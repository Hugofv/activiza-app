/**
 * Operation service for managing operations (loans, installments, rentals)
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export enum OperationType {
  LOAN = 'LOAN',
  RENT_ROOM = 'RENT_ROOM',
  RENT_HOUSE = 'RENT_HOUSE',
  RENT_VEHICLE = 'RENT_VEHICLE',
  INSTALLMENTS = 'INSTALLMENTS',
}

export type OperationStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface OperationInstallment {
  id: number;
  operationId: number;
  dueDate: string;
  profit: number;
}

export interface Operation {
  id: number;
  accountId?: number;
  clientId: number;
  type: OperationType;
  status: OperationStatus;
  title?: string;
  description?: string;
  principalAmount: number;
  currency: string;
  startDate: string;
  dueDate: string;
  frequency: FrequencyType;
  interestRate: number;
  entryAmount?: number;
  installments?: number;
  installmentsList?: OperationInstallment[];
  depositAmount?: number;
  resourceId?: number;
  createdAt?: string;
  updatedAt?: string;
  /** Outstanding balance from API (same unit as principalAmount). */
  remainingToReceive?: number | string | null;
  /** Snake_case alias some backends send on GET operation(s). */
  remaining_to_receive?: number | string | null;
  nextInstallmentDueAmount?: number | string | null;
  client?: {
    id: number;
    name?: string;
    profilePictureUrl?: string;
    rating?: number;
    reliability?: number | string;
    meta?: { reliability?: string | number } | null;
  };
}

export interface OperationsResponse {
  results: Operation[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface OperationFilters {
  type?: OperationType;
  status?: OperationStatus;
  clientId?: number;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

// -----------------------------------------------------------------------
// Create operation payload
// -----------------------------------------------------------------------

export interface CreateOperationData {
  type: OperationType;
  clientId: number;
  title?: string;
  description?: string;
  principalAmount: number;
  currency: string;
  startDate: string;
  dueDate?: string;
  frequency: FrequencyType;
  interestRate: number;
  entryAmount?: number;
  installments?: number;
  depositAmount?: number;
  resourceId?: number;
}

export interface UpdateOperationData extends Partial<
  Omit<CreateOperationData, 'type' | 'clientId'>
> {
  status?: OperationStatus;
}

/**
 * Register payment — POST /api/operations/:id/register-payment
 * `amount` in major currency units; `paidAt` ISO 8601 (e.g. from selected date).
 */
export interface RegisterLoanPaymentPayload {
  amount: number;
  paidAt: string;
  installmentId?: string;
  method?: string;
  reference?: string;
  meta?: Record<string, unknown>;
  accountId?: number;
}

export type OperationHistoryReason =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'PAYMENT'
  | 'COMPLETED'
  | 'CONTRACT_EVALUATION'
  | 'MANUAL'
  | string;

export interface OperationHistoryPayment {
  id?: string | number;
  clientId?: number;
  installmentId?: string | number;
  operationId?: string | number;
  amount: number;
  currency?: string;
  paidAt?: string;
  method?: string | null;
  reference?: string | null;
  meta?: {
    contractSettlement?: string;
    installmentPaymentType?: string;
    [key: string]: unknown;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperationHistoryEntry {
  id: string | number;
  operationId?: string | number;
  previousAmount: number;
  newAmount: number;
  reason: OperationHistoryReason;
  actor?: string | null;
  paymentId?: string | number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  payment?: OperationHistoryPayment | null;
}

export interface OperationHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OperationHistoryResponse {
  results: OperationHistoryEntry[];
  pagination: OperationHistoryPagination;
}

// -----------------------------------------------------------------------
// Helpers — convert form data to API payload
// -----------------------------------------------------------------------

/**
 * Parses a money-masked string (e.g. "1.234,56") into cents as integer.
 * Returns the raw numeric value (e.g. 123456 → 1234.56 as float).
 */
export function parseAmount(formatted: string): number {
  const digits = formatted.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const cleaned = digits.replace(/^0+/, '') || '0';
  const padded = cleaned.padStart(3, '0');
  const intPart = padded.slice(0, -2);
  const decPart = padded.slice(-2);
  return parseFloat(`${intPart}.${decPart}`);
}

/**
 * Parses a percentage string (e.g. "12,50") into a float (12.5).
 */
export function parseInterest(formatted: string): number {
  const cleaned = formatted.replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  BRL: 'R$',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

/**
 * Display amount with symbol suffix (aligned with loan list cards).
 */
export function formatOperationCurrency(
  value: number,
  currency: string
): string {
  const symbol = CURRENCY_SYMBOL[currency?.toUpperCase()] ?? '£';
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted}${symbol}`;
}

function coerceOperationAmount(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n =
    typeof raw === 'string' ? parseFloat(raw.replace(',', '.')) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Amount still owed; uses API remaining fields when present, else principal + interest. */
export function getOperationRemainingToReceive(operation: Operation): number {
  const r = coerceOperationAmount(
    operation.remainingToReceive ?? operation.remaining_to_receive
  );
  if (r != null) {
    return r;
  }
  return operation.principalAmount * (1 + operation.interestRate / 100);
}

// -----------------------------------------------------------------------
// API functions
// -----------------------------------------------------------------------

/**
 * Create a new operation
 * POST /api/operations
 */
export async function createOperation(
  data: CreateOperationData
): Promise<Operation> {
  try {
    const response = await apiClient.post<Operation>(
      ENDPOINTS.OPERATIONS.CREATE,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Create operation error:', error);
    throw error;
  }
}

/**
 * Get list of operations with optional filters
 * GET /api/operations
 */
export async function getOperations(
  filters?: OperationFilters
): Promise<OperationsResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId)
      params.append('clientId', filters.clientId.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `${ENDPOINTS.OPERATIONS.GET}?${queryString}`
      : ENDPOINTS.OPERATIONS.GET;

    const response = await apiClient.get<OperationsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('Get operations error:', error);
    throw error;
  }
}

/**
 * Get operation by ID
 * GET /api/operations/:id
 */
export async function getOperationById(id: string): Promise<Operation> {
  try {
    const response = await apiClient.get<Operation>(
      ENDPOINTS.OPERATIONS.GET_BY_ID(id)
    );
    return response.data;
  } catch (error: any) {
    console.error('Get operation by ID error:', error);
    throw error;
  }
}

/**
 * Update an operation
 * PUT /api/operations/:id
 */
export async function updateOperation(
  id: string,
  data: UpdateOperationData
): Promise<Operation> {
  try {
    const response = await apiClient.put<Operation>(
      ENDPOINTS.OPERATIONS.UPDATE(id),
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Update operation error:', error);
    throw error;
  }
}

/**
 * Delete an operation
 * DELETE /api/operations/:id
 */
export async function deleteOperation(id: string): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.OPERATIONS.DELETE(id));
  } catch (error: any) {
    console.error('Delete operation error:', error);
    throw error;
  }
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function mapOperationHistoryPayment(
  raw: Record<string, unknown>
): OperationHistoryPayment {
  const meta = asRecord(raw.meta);
  return {
    id: raw.id as string | number | undefined,
    clientId: raw.clientId as number | undefined,
    installmentId: (raw.installment_id ?? raw.installmentId) as
      | string
      | number
      | undefined,
    operationId: (raw.operation_id ?? raw.operationId) as
      | string
      | number
      | undefined,
    amount: Number(raw.amount ?? 0),
    currency: raw.currency as string | undefined,
    paidAt: (raw.paid_at ?? raw.paidAt) as string | undefined,
    method: (raw.method ?? null) as string | null,
    reference: (raw.reference ?? null) as string | null,
    meta: meta as OperationHistoryPayment['meta'],
    createdAt: (raw.created_at ?? raw.createdAt) as string | undefined,
    updatedAt: (raw.updated_at ?? raw.updatedAt) as string | undefined,
  };
}

function mapOperationHistoryEntry(
  raw: Record<string, unknown>
): OperationHistoryEntry {
  const paymentRaw = asRecord(raw.payment);
  return {
    id: raw.id as string | number,
    operationId: (raw.operation_id ?? raw.operationId) as
      | string
      | number
      | undefined,
    previousAmount: Number(raw.previous_amount ?? raw.previousAmount ?? 0),
    newAmount: Number(raw.new_amount ?? raw.newAmount ?? 0),
    reason: String(raw.reason ?? '') as OperationHistoryReason,
    actor: (raw.actor ?? null) as string | null,
    paymentId: (raw.payment_id ?? raw.paymentId ?? null) as
      | string
      | number
      | null,
    metadata: asRecord(raw.metadata),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
    payment: paymentRaw ? mapOperationHistoryPayment(paymentRaw) : null,
  };
}

interface OperationHistoryApiBody {
  success?: boolean;
  results?: unknown[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    totalPages?: number;
  };
}

/**
 * Operation audit / history (balance changes, payments, etc.).
 * GET /api/operations/:id/history?page=&limit=
 */
export async function getOperationHistory(
  operationId: string,
  params?: { page?: number; limit?: number }
): Promise<OperationHistoryResponse> {
  try {
    const search = new URLSearchParams();
    if (params?.page != null) search.append('page', String(params.page));
    if (params?.limit != null) search.append('limit', String(params.limit));
    const qs = search.toString();
    const url = qs
      ? `${ENDPOINTS.OPERATIONS.HISTORY(operationId)}?${qs}`
      : ENDPOINTS.OPERATIONS.HISTORY(operationId);
    const response = await apiClient.get<OperationHistoryApiBody>(url);
    const body = response.data;
    const rawList = Array.isArray(body.results) ? body.results : [];
    const results = rawList
      .map((row) => asRecord(row))
      .filter((r): r is Record<string, unknown> => r != null)
      .map(mapOperationHistoryEntry);

    const p = body.pagination;
    const page = p?.page ?? 1;
    const limit = p?.limit ?? 50;
    const total = p?.total ?? results.length;
    const totalPages =
      p?.totalPages ?? p?.total_pages ?? Math.max(1, Math.ceil(total / limit));

    return {
      results,
      pagination: { page, limit, total, totalPages },
    };
  } catch (error: any) {
    console.error('Get operation history error:', error);
    throw error;
  }
}

/**
 * Register a payment against a loan operation.
 * POST /api/operations/:id/register-payment
 */
export async function registerLoanPayment(
  operationId: string,
  payload: RegisterLoanPaymentPayload
): Promise<void> {
  try {
    await apiClient.post(
      ENDPOINTS.OPERATIONS.REGISTER_PAYMENT(operationId),
      payload
    );
  } catch (error: any) {
    console.error('Register loan payment error:', error);
    throw error;
  }
}
