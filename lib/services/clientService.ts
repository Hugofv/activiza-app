/**
 * Client service for managing clients
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

type FormDataFileValue = Blob | { uri: string;
name: string;
type: string };

/**
 * Prepares a file for FormData. In React Native, use { uri, type, name } so the
 * HTTP client reads the file from the URI and sends the bytes (multipart).
 * For blob:/data: URIs (e.g. web), try fetch+blob; otherwise use the object.
 */
async function uriToFormDataFile(
  uri: string,
  defaultName: string
): Promise<{ value: FormDataFileValue;
name: string;
type: string }> {
  const name = uri.split('/').pop() || defaultName;
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // file:// and content://: always use { uri, type, name }; client reads URI and sends bytes
  if (uri.startsWith('file://') || uri.startsWith('content://')) {
    return {
 value: {
 uri,
name,
type
},
name,
type
};
  }

  // blob:/data: (e.g. web): try Blob so multipart sends the content
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return {
 value: blob,
name,
type
};
  } catch {
    return {
 value: {
 uri,
name,
type
},
name,
type
};
  }
}

/** Account nested in client (business data) */
export interface ClientAccount {
  id: number;
  accountId?: number;
  businessDocument?: string;
  businessEmail?: string;
  businessName?: string;
  businessPhone?: string;
  createdAt?: Record<string, unknown>;
  createdBy?: string | null;
  currency?: string;
  deletedAt?: string | null;
  meta?: Record<string, unknown>;
  ownerId?: number;
  planId?: number;
  status?: string;
  updatedAt?: Record<string, unknown>;
  updatedBy?: string | null;
}

/** Address nested in client */
export interface ClientAddress {
  id?: number;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
}

/** Document item in documents array (API return) */
export interface ClientDocumentItem {
  downloadUrl?: string;
  downloadUrlExpiresIn?: number;
  key?: string;
  name?: string;
  uploadedAt?: string;
}

/** Meta (name, phone, observation, profile picture, etc.) */
export interface ClientMeta {
  name?: string;
  phone?: string;
  observation?: string;
  profilePictureKey?: string;
  profilePictureUrl?: string;
  profilePictureUrlExpiresIn?: number;
  reliability?: string;
  documents?: ClientDocumentItem[];
}

export interface Client {
  id: number;
  accountId?: number;
  account?: ClientAccount | null;
  address?: ClientAddress | null;
  createdAt?: Record<string, unknown>;
  createdBy?: string | null;
  deletedAt?: string | null;
  document?: string;
  documentCountryCode?: string | null;
  documentType?: string;
  documents?: ClientDocumentItem[];
  email?: string;
  meta?: ClientMeta | null;
  updatedAt?: Record<string, unknown>;
  updatedBy?: string | null;
  guarantor?: Client | null;
  // Convenience fields (populated from meta / account for UI)
  name?: string;
  phone?: string;
  profilePictureUrl?: string;
  rating?: number;
  pendingOperations?: number;
  completedOperations?: number;
  totalAmount?: number;
  currency?: string;
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
  documentImages?: string[]; // New document URIs (file://, content://)
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

/** Document state for update operations */
export interface DocumentUpdate {
  key: string;
  name?: string;
  deleted?: boolean;
}

export interface UpdateClientData extends Partial<
  Omit<CreateClientData, 'documentImages'>
> {
  /** Array of existing documents state (keep/delete) */
  documents?: DocumentUpdate[];
  /** New document file URIs to upload */
  newDocuments?: string[];
}

/**
 * Get list of clients with optional filters
 * GET /api/clients
 */
export async function getClients(
  filters?: ClientFilters
): Promise<ClientsResponse> {
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
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${ENDPOINTS.CLIENTS.GET}?${queryString}`
      : ENDPOINTS.CLIENTS.GET;

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
    const response = await apiClient.get<Client>(
      ENDPOINTS.CLIENTS.GET_BY_ID(id)
    );
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
export async function createClient(
  clientData: CreateClientData
): Promise<Client> {
  try {
    const hasDocumentImages =
      clientData.documentImages && clientData.documentImages.length > 0;
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
      if (clientData.documentType)
        formData.append('documentType', clientData.documentType);
      if (clientData.observation)
        formData.append('observation', clientData.observation);
      if (clientData.guarantorId)
        formData.append('guarantorId', clientData.guarantorId);
      if (clientData.reliability)
        formData.append('reliability', clientData.reliability.toString());

      // Add address fields (nested under `address[...]`) if present
      if (clientData.address) {
        const addr = clientData.address;
        if (addr.postalCode)
          formData.append('address[postalCode]', addr.postalCode);
        if (addr.street) formData.append('address[street]', addr.street);
        if (addr.neighborhood)
          formData.append('address[neighborhood]', addr.neighborhood);
        if (addr.city) formData.append('address[city]', addr.city);
        if (addr.state) formData.append('address[state]', addr.state);
        if (addr.country) formData.append('address[country]', addr.country);
        if (addr.countryCode)
          formData.append('address[countryCode]', addr.countryCode);
        if (addr.number) formData.append('address[number]', addr.number);
        if (addr.complement)
          formData.append('address[complement]', addr.complement);
      }

      // Add avatar as blob/file for API
      if (hasAvatar && clientData.avatar) {
        const { value, name: fileName } = await uriToFormDataFile(
          clientData.avatar,
          'avatar.jpg'
        );
        if (value instanceof Blob) {
          formData.append('avatar', value, fileName);
        } else {
          formData.append('avatar', value as any);
        }
      }

      // Add document images as blobs/files for API
      if (hasDocumentImages && documentImages) {
        for (let i = 0; i < documentImages.length; i++) {
          const { value, name: fileName } = await uriToFormDataFile(
            documentImages[i],
            `document_${i}.jpg`
          );
          if (value instanceof Blob) {
            formData.append('documentImages', value, fileName);
          } else {
            formData.append('documentImages', value as any);
          }
        }
      }

      // Don't set Content-Type header - axios will set it automatically with boundary
      const response = await apiClient.post<Client>(
        ENDPOINTS.CLIENTS.CREATE,
        formData
      );
      return response.data;
    } else {
      // Use regular JSON for requests without images
      const { documentImages, ...jsonData } = clientData;
      const response = await apiClient.post<Client>(
        ENDPOINTS.CLIENTS.CREATE,
        jsonData
      );
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
 */
export async function updateClient(
  id: string,
  clientData: UpdateClientData
): Promise<Client> {
  try {
    const { newDocuments, ...data } = clientData;

    const formData = new FormData();

    // Text fields
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.document) formData.append('document', data.document);
    if (data.documentType) formData.append('documentType', data.documentType);
    if (data.observation) formData.append('observation', data.observation);
    if (data.guarantorId) formData.append('guarantorId', data.guarantorId);
    if (data.reliability != null)
      formData.append('reliability', data.reliability.toString());

    // Address
    if (data.address) {
      const addr = data.address;
      if (addr.postalCode)
        formData.append('address[postalCode]', addr.postalCode);
      if (addr.street) formData.append('address[street]', addr.street);
      if (addr.neighborhood)
        formData.append('address[neighborhood]', addr.neighborhood);
      if (addr.city) formData.append('address[city]', addr.city);
      if (addr.state) formData.append('address[state]', addr.state);
      if (addr.country) formData.append('address[country]', addr.country);
      if (addr.countryCode)
        formData.append('address[countryCode]', addr.countryCode);
      if (addr.number) formData.append('address[number]', addr.number);
      if (addr.complement)
        formData.append('address[complement]', addr.complement);
    }

    // Avatar (new file)
    if (
      data.avatar?.startsWith('file://') ||
      data.avatar?.startsWith('content://')
    ) {
      const file = await uriToFormDataFile(data.avatar, 'avatar.jpg');
      formData.append('avatar', file.value as any);
    }

    // New document files
    if (newDocuments?.length) {
      for (const uri of newDocuments) {
        const file = await uriToFormDataFile(uri, 'document.jpg');
        formData.append('documentImages', file.value as any);
      }
    }

    // Documents state (JSON) - only send if there are deletions
    if (data.documents?.length) {
      formData.append('documents', JSON.stringify(data.documents));
    }

    const response = await apiClient.put<Client>(
      ENDPOINTS.CLIENTS.UPDATE(id),
      formData
    );
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
