/**
 * Client service for managing clients
 */

import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Client {
  id: string;
  name: string;
  rating?: number;
  pendingOperations?: number;
  completedOperations?: number;
  totalAmount?: number;
  currency?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientsResponse {
  results: Client[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface ClientFilters {
  search?: string;
  rating?: number;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get list of clients with optional filters
 * GET /api/clients
 */
export async function getClients(filters?: ClientFilters): Promise<ClientsResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.rating) {
      params.append('rating', filters.rating.toString());
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sort_order', filters.sortOrder);
    }

    const queryString = params.toString();
    const url = queryString ? `${ENDPOINTS.CLIENTS.GET}?${queryString}` : ENDPOINTS.CLIENTS.GET;

    const response = await apiClient.get<ClientsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('Get clients error:', error);
    throw error;
  }
}

/**
 * Get client by ID
 * GET /api/clients/:id
 */
export async function getClientById(id: string): Promise<Client> {
  try {
    const response = await apiClient.get<Client>(ENDPOINTS.CLIENTS.GET_BY_ID(id));
    return response.data;
  } catch (error: any) {
    console.error('Get client by ID error:', error);
    throw error;
  }
}

/**
 * Create new client
 * POST /api/clients
 */
export async function createClient(clientData: Partial<Client>): Promise<Client> {
  try {
    const response = await apiClient.post<Client>(ENDPOINTS.CLIENTS.CREATE, clientData);
    return response.data;
  } catch (error: any) {
    console.error('Create client error:', error);
    throw error;
  }
}

/**
 * Update client
 * PUT /api/clients/:id
 */
export async function updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
  try {
    const response = await apiClient.put<Client>(ENDPOINTS.CLIENTS.UPDATE(id), clientData);
    return response.data;
  } catch (error: any) {
    console.error('Update client error:', error);
    throw error;
  }
}

/**
 * Delete client
 * DELETE /api/clients/:id
 */
export async function deleteClient(id: string): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.CLIENTS.DELETE(id));
  } catch (error: any) {
    console.error('Delete client error:', error);
    throw error;
  }
}
