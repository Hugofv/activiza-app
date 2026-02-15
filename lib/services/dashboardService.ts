/**
 * Dashboard service for fetching home screen summary data
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type DashboardPeriod =
  | 'this_month'
  | 'last_month'
  | 'this_week'
  | 'this_year'
  | 'all';

export interface DashboardFilters {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

export interface DashboardOperationByType {
  type: string;
  count: number;
}

export interface DashboardReportByType {
  type: string;
  totalAmount: number;
  count: number;
}

export interface DashboardData {
  period: {
    start: string;
    end: string;
  };
  received: number;
  expected: number;
  overdueCount: number;
  operationsByType: DashboardOperationByType[];
  reportsByType: DashboardReportByType[];
  totalOperations: number;
  totalClients: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// -----------------------------------------------------------------------
// API calls
// -----------------------------------------------------------------------

/**
 * Fetch dashboard summary data.
 * Defaults to `this_month` period when no filters are provided.
 */
export async function getDashboard(
  filters?: DashboardFilters
): Promise<DashboardData> {
  const params: Record<string, string> = {};

  if (filters?.period) {
    params.period = filters.period;
  }
  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await apiClient.get<DashboardResponse>(
    ENDPOINTS.DASHBOARD,
    { params }
  );

  return response.data.data;
}
