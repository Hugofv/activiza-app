import { create } from 'zustand';

import type {
  PhotoDeletion,
  UpdateVehicleData,
  Vehicle,
  VehicleSubtype,
} from '@/lib/services/vehicleService';

export interface DisplayPhoto {
  uri: string;
  key?: string;
  isNew: boolean;
}

export interface VehicleEditDraft extends UpdateVehicleData {
  subtype?: VehicleSubtype;
  _displayPhotos?: DisplayPhoto[];
  _newPhotoUris?: string[];
}

function initDraft(vehicle: Vehicle): VehicleEditDraft {
  const existingPhotos: DisplayPhoto[] = (vehicle.photos ?? []).map((p) => ({
    uri: p.downloadUrl,
    key: p.key,
    isNew: false,
  }));

  return {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    plate: vehicle.plate,
    vin: vehicle.vin,
    value: vehicle.value,
    currency: vehicle.currency,
    mileage: vehicle.mileage,
    observation: vehicle.observation,
    description: vehicle.description,
    meta: vehicle.meta,
    subtype: vehicle.meta?.subtype ?? 'CAR',
    status: vehicle.status,
    _displayPhotos: existingPhotos,
    _newPhotoUris: [],
  };
}

interface EditVehicleState {
  vehicleId: string | null;
  draft: VehicleEditDraft;
  isEditMode: boolean;
  initFromVehicle: (vehicle: Vehicle) => void;
  updateDraft: (data: Partial<VehicleEditDraft>) => void;
  addPhoto: (uri: string) => void;
  removePhoto: (index: number) => void;
  getDisplayPhotos: () => DisplayPhoto[];
  clear: () => void;
}

export const useEditVehicleStore = create<EditVehicleState>((set, get) => ({
  vehicleId: null,
  draft: {},
  isEditMode: false,

  initFromVehicle: (vehicle) =>
    set({
      vehicleId: String(vehicle.id),
      draft: initDraft(vehicle),
      isEditMode: true,
    }),

  updateDraft: (data) =>
    set((s) => ({
      draft: { ...s.draft, ...data },
    })),

  addPhoto: (uri) =>
    set((s) => ({
      draft: {
        ...s.draft,
        _displayPhotos: [
          ...(s.draft._displayPhotos ?? []),
          { uri, isNew: true },
        ],
        _newPhotoUris: [...(s.draft._newPhotoUris ?? []), uri],
      },
    })),

  removePhoto: (index) =>
    set((s) => {
      const photos = s.draft._displayPhotos ?? [];
      const photo = photos[index];
      if (!photo) return s;

      const newDisplayPhotos = photos.filter((_, i) => i !== index);

      if (photo.isNew) {
        return {
          draft: {
            ...s.draft,
            _displayPhotos: newDisplayPhotos,
            _newPhotoUris: (s.draft._newPhotoUris ?? []).filter(
              (u) => u !== photo.uri
            ),
          },
        };
      }

      const deletions: PhotoDeletion[] = [
        ...(s.draft.deletedPhotos ?? []),
      ];
      if (photo.key) {
        deletions.push({ key: photo.key, deleted: true });
      }

      return {
        draft: {
          ...s.draft,
          _displayPhotos: newDisplayPhotos,
          deletedPhotos: deletions,
        },
      };
    }),

  getDisplayPhotos: () => get().draft._displayPhotos ?? [],

  clear: () =>
    set({
      vehicleId: null,
      draft: {},
      isEditMode: false,
    }),
}));
