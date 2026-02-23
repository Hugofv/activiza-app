/**
 * Vehicle / Resource service for managing vehicles and their rentals.
 * Uses the /api/resources endpoint.
 *
 * API resource type is "VEHICLE"; the subtype (CAR / MOTORCYCLE) is stored in meta.
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type VehicleSubtype = 'CAR' | 'MOTORCYCLE';

export type VehicleStatus = 'AVAILABLE' | 'RENTED';

export interface VehicleMeta {
  subtype?: VehicleSubtype;
  [key: string]: unknown;
}

export interface VehiclePhoto {
  key: string;
  name: string;
  downloadUrl: string;
  downloadUrlExpiresIn?: number;
  uploadedAt?: string;
}

export interface Vehicle {
  id: number;
  accountId?: number;
  type: string;
  title: string;
  description?: string;
  meta?: VehicleMeta;
  brand: string;
  model: string;
  year?: string;
  plate: string;
  vin?: string;
  avatar?: VehiclePhoto;
  photos?: VehiclePhoto[];
  status: VehicleStatus;
  value?: number;
  currency?: string;
  mileage?: string;
  observation?: string;
  interestRate?: number;
  maintenanceCount?: number;
  inspectionCount?: number;
  currentClient?: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiclesResponse {
  results: Vehicle[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface VehicleFilters {
  type?: string;
  status?: VehicleStatus;
  search?: string;
  sortBy?: 'brand' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVehicleData {
  type: 'VEHICLE';
  title: string;
  description?: string;
  meta?: VehicleMeta;
  brand: string;
  model: string;
  year?: string;
  plate: string;
  vin?: string;
  value?: number;
  currency?: string;
  mileage?: string;
  observation?: string;
  photos?: string[];
}

export interface PhotoDeletion {
  key: string;
  deleted: true;
}

export interface UpdateVehicleData extends Partial<Omit<CreateVehicleData, 'type'>> {
  status?: VehicleStatus;
  deletedPhotos?: PhotoDeletion[];
}

/** Build a display title like "Honda Civic 2024" */
export function buildVehicleTitle(brand: string, model: string, year?: string): string {
  const name = `${brand} ${model}`.trim();
  return year ? `${name} ${year}` : name;
}

/** Helper to build a display name like "BMW X1 / 2020" */
export function getVehicleDisplayName(vehicle: Vehicle): string {
  if (vehicle.title) return vehicle.title;
  const parts = [`${vehicle.brand} ${vehicle.model}`.trim()];
  if (vehicle.year) parts.push(vehicle.year);
  return parts.join(' / ');
}

/** Get the subtype (CAR / MOTORCYCLE) from meta, defaults to CAR */
export function getVehicleSubtype(vehicle: Vehicle): VehicleSubtype {
  return vehicle.meta?.subtype ?? 'CAR';
}

/** Avatar downloadUrl (first photo used as avatar), falls back to first photo */
export function getVehicleImageUrl(vehicle: Vehicle): string | undefined {
  return vehicle.avatar?.downloadUrl ?? vehicle.photos?.[0]?.downloadUrl;
}

/** All photo downloadUrls */
export function getVehiclePhotoUrls(vehicle: Vehicle): string[] {
  return (vehicle.photos ?? []).map((p) => p.downloadUrl).filter(Boolean);
}

// -----------------------------------------------------------------------
// API functions
// -----------------------------------------------------------------------

export async function getVehicles(
  filters?: VehicleFilters
): Promise<VehiclesResponse> {
  const params: Record<string, string> = { type: 'VEHICLE' };
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await apiClient.get<VehiclesResponse>(
    ENDPOINTS.RESOURCES.GET,
    { params }
  );
  return response.data;
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await apiClient.get<Vehicle>(
    ENDPOINTS.RESOURCES.GET_BY_ID(id)
  );
  return response.data;
}

function buildFormData(
  data: Record<string, unknown>,
  photos?: string[],
  deletedPhotos?: PhotoDeletion[]
): FormData {
  const fd = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }

  if (photos?.length) {
    for (const uri of photos) {
      const filename = uri.split('/').pop() ?? 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      fd.append('photos', { uri, name: filename, type: mimeType } as any);
    }
  }

  if (deletedPhotos?.length) {
    fd.append('photos', JSON.stringify(deletedPhotos));
  }

  return fd;
}

export async function createVehicle(
  data: CreateVehicleData
): Promise<Vehicle> {
  const { photos, ...fields } = data;
  const fd = buildFormData(fields, photos);

  const response = await apiClient.post<Vehicle>(
    ENDPOINTS.RESOURCES.CREATE,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function updateVehicle(
  id: string,
  data: UpdateVehicleData
): Promise<Vehicle> {
  const { photos, deletedPhotos, ...fields } = data;
  const fd = buildFormData(fields, photos, deletedPhotos);

  const response = await apiClient.put<Vehicle>(
    ENDPOINTS.RESOURCES.UPDATE(id),
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.RESOURCES.DELETE(id));
}

export async function deleteVehicles(ids: number[]): Promise<void> {
  await Promise.all(ids.map((id) => apiClient.delete(ENDPOINTS.RESOURCES.DELETE(String(id)))));
}
