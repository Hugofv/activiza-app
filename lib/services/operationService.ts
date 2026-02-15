/**
 * Operation service for managing operations (loans, installments, rentals)
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type OperationType =
  | 'LOAN'
  | 'INSTALLMENTS'
  | 'RENT_PROPERTY'
  | 'RENT_ROOM'
  | 'RENT_VEHICLE';

export type OperationStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type FrequencyType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface Operation {
  id: number;
  accountId?: number;
  clientId: number;
  type: OperationType;
  status: OperationStatus;
  amount: number;
  currency: string;
  interest: number;
  dueDate: string;
  frequency: FrequencyType;
  observation?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: number;
    name?: string;
    profilePictureUrl?: string;
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
  principalAmount: number;
  currency: string;
  interest: number;
  startDate: string;
  frequency: FrequencyType;
  observation?: string;
}

export interface UpdateOperationData extends Partial<Omit<CreateOperationData, 'type' | 'clientId'>> {
  status?: OperationStatus;
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
    if (filters?.clientId) params.append('clientId', filters.clientId.toString());
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
