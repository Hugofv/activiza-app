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
  document?: string;
  documentType?: string;
  documentImages?: string[];
  address?: {
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    countryCode?: string;
    number: string;
    complement?: string;
  };
  observation?: string;
  guarantorId?: string;
  reliability?: number;
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

export interface CreateClientData {
  name: string;
  avatar?: string; // Avatar image URI
  phone?: string;
  email?: string;
  document?: string;
  documentType?: string;
  documentImages?: string[];
  address?: {
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    countryCode?: string;
    number: string;
    complement?: string;
  };
  observation?: string;
  guarantorId?: string;
  reliability?: number;
}

export type UpdateClientData = Partial<CreateClientData>;

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
 * Uses FormData if documentImages are present, otherwise uses JSON
 */
export async function createClient(clientData: CreateClientData): Promise<Client> {
  try {
    const hasDocumentImages = clientData.documentImages && clientData.documentImages.length > 0;
    const hasAvatar = !!clientData.avatar;
    const needsFormData = hasDocumentImages || hasAvatar;
    const documentImages = clientData.documentImages;
    
    if (needsFormData) {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      if (clientData.name) formData.append('name', clientData.name);
      if (clientData.phone) formData.append('phone', clientData.phone);
      if (clientData.email) formData.append('email', clientData.email);
      if (clientData.document) formData.append('document', clientData.document);
      if (clientData.documentType) formData.append('documentType', clientData.documentType);
      if (clientData.observation) formData.append('observation', clientData.observation);
      if (clientData.guarantorId) formData.append('guarantorId', clientData.guarantorId);
      if (clientData.reliability) formData.append('reliability', clientData.reliability.toString());
      
      // Add address fields (nested under `address[...]`) if present
      if (clientData.address) {
        const addr = clientData.address;
        if (addr.postalCode) formData.append('address[postalCode]', addr.postalCode);
        if (addr.street) formData.append('address[street]', addr.street);
        if (addr.neighborhood) formData.append('address[neighborhood]', addr.neighborhood);
        if (addr.city) formData.append('address[city]', addr.city);
        if (addr.state) formData.append('address[state]', addr.state);
        if (addr.country) formData.append('address[country]', addr.country);
        if (addr.countryCode) formData.append('address[countryCode]', addr.countryCode);
        if (addr.number) formData.append('address[number]', addr.number);
        if (addr.complement) formData.append('address[complement]', addr.complement);
      }
      
      // Add avatar if present
      if (hasAvatar && clientData.avatar) {
        const avatarUri = clientData.avatar;
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // Format URI for React Native (keep file:// prefix)
        let imageUri = avatarUri;
        if (avatarUri.startsWith('file://')) {
          imageUri = avatarUri;
        }
        
        formData.append('avatar', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      
      // Add document images if present
      if (hasDocumentImages && documentImages) {
        documentImages.forEach((uri, index) => {
          // For React Native, we need to create a file object
          // The URI format is different on iOS/Android vs web
          const filename = uri.split('/').pop() || `document_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          // Format URI for React Native (keep file:// prefix)
          let imageUri = uri;
          if (uri.startsWith('file://')) {
            imageUri = uri;
          }
          
          formData.append('documentImages', {
            uri: imageUri,
            name: filename,
            type,
          } as any);
        });
      }
      
      // Don't set Content-Type header - axios will set it automatically with boundary
      const response = await apiClient.post<Client>(ENDPOINTS.CLIENTS.CREATE, formData);
      return response.data;
    } else {
      // Use regular JSON for requests without images
      const { documentImages, ...jsonData } = clientData;
      const response = await apiClient.post<Client>(ENDPOINTS.CLIENTS.CREATE, jsonData);
      return response.data;
    }
  } catch (error: any) {
    console.error('Create client error:', error);
    throw error;
  }
}

/**
 * Update client
 * PUT /api/clients/:id
 * Uses FormData if documentImages are present, otherwise uses JSON
 */
export async function updateClient(id: string, clientData: UpdateClientData): Promise<Client> {
  try {
    const hasDocumentImages = clientData.documentImages && clientData.documentImages.length > 0;
    const hasAvatar = !!clientData.avatar;
    const needsFormData = hasDocumentImages || hasAvatar;
    const documentImages = clientData.documentImages;
    
    if (needsFormData) {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      if (clientData.name) formData.append('name', clientData.name);
      if (clientData.phone) formData.append('phone', clientData.phone);
      if (clientData.email) formData.append('email', clientData.email);
      if (clientData.document) formData.append('document', clientData.document);
      if (clientData.documentType) formData.append('documentType', clientData.documentType);
      if (clientData.observation) formData.append('observation', clientData.observation);
      if (clientData.guarantorId) formData.append('guarantorId', clientData.guarantorId);
      if (clientData.reliability) formData.append('reliability', clientData.reliability.toString());
      
      // Add address fields (nested under `address[...]`) if present
      if (clientData.address) {
        const addr = clientData.address;
        if (addr.postalCode) formData.append('address[postalCode]', addr.postalCode);
        if (addr.street) formData.append('address[street]', addr.street);
        if (addr.neighborhood) formData.append('address[neighborhood]', addr.neighborhood);
        if (addr.city) formData.append('address[city]', addr.city);
        if (addr.state) formData.append('address[state]', addr.state);
        if (addr.country) formData.append('address[country]', addr.country);
        if (addr.countryCode) formData.append('address[countryCode]', addr.countryCode);
        if (addr.number) formData.append('address[number]', addr.number);
        if (addr.complement) formData.append('address[complement]', addr.complement);
      }
      
      // Add avatar if present
      if (hasAvatar && clientData.avatar) {
        const avatarUri = clientData.avatar;
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // Format URI for React Native (keep file:// prefix)
        let imageUri = avatarUri;
        if (avatarUri.startsWith('file://')) {
          imageUri = avatarUri;
        }
        
        formData.append('avatar', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      
      // Add document images if present
      if (hasDocumentImages && documentImages) {
        documentImages.forEach((uri, index) => {
          // For React Native, we need to create a file object
          const filename = uri.split('/').pop() || `document_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          // Format URI for React Native (keep file:// prefix)
          let imageUri = uri;
          if (uri.startsWith('file://')) {
            imageUri = uri;
          }
          
          formData.append('documentImages', {
            uri: imageUri,
            name: filename,
            type,
          } as any);
        });
      }
      
      // Don't set Content-Type header - axios will set it automatically with boundary
      const response = await apiClient.put<Client>(ENDPOINTS.CLIENTS.UPDATE(id), formData);
      return response.data;
    } else {
      // Use regular JSON for requests without images
      const { documentImages, ...jsonData } = clientData;
      const response = await apiClient.put<Client>(ENDPOINTS.CLIENTS.UPDATE(id), jsonData);
      return response.data;
    }
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
