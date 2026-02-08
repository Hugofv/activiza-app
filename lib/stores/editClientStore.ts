import { create } from 'zustand';

import type {
  Client,
  ClientDocumentItem,
  DocumentUpdate,
  UpdateClientData,
} from '@/lib/services/clientService';

/** Document for UI display */
export interface DisplayDocument {
  uri: string;
  key?: string;
  isNew: boolean;
}

function initDraft(
  client: Client
): UpdateClientData & { _displayDocs: DisplayDocument[] } {
  const addr = client.address;

  // Map existing documents
  const displayDocs: DisplayDocument[] = (client.documents ?? [])
    .filter((d): d is ClientDocumentItem => !!d?.downloadUrl)
    .map((d) => ({
      uri: d.downloadUrl!,
      key: d.key,
      isNew: false,
    }));

  return {
    name: client.name ?? client.meta?.name,
    phone: client.phone ?? client.meta?.phone,
    email: client.email,
    observation: client.meta?.observation,
    document: client.document,
    documentType: client.documentType,
    documents: [], // Only populated when docs are deleted
    newDocuments: [],
    address: addr
      ? {
          postalCode: addr.postalCode ?? '',
          street: addr.street ?? '',
          neighborhood: addr.neighborhood ?? '',
          city: addr.city ?? '',
          state: addr.state ?? '',
          country: addr.country ?? '',
          countryCode: addr.countryCode,
          number: addr.number ?? '',
          complement: addr.complement ?? undefined,
        }
      : undefined,
    guarantorId: client.guarantor ? String(client.guarantor.id) : undefined,
    reliability:
      client.rating ??
      (client.meta?.reliability != null
        ? Number(client.meta.reliability)
        : undefined),
    avatar: client.profilePictureUrl,
    _displayDocs: displayDocs,
  };
}

interface EditClientState {
  clientId: string | null;
  draft: UpdateClientData & {
    _displayDocs?: DisplayDocument[];
    _guarantor?: Client;
  };
  isEditMode: boolean;
  initFromClient: (client: Client) => void;
  updateDraft: (
    data: Partial<UpdateClientData> & { _guarantor?: Client }
  ) => void;
  addDocument: (uri: string) => void;
  removeDocument: (index: number) => void;
  getDisplayDocs: () => DisplayDocument[];
  clear: () => void;
}

export const useEditClientStore = create<EditClientState>((set, get) => ({
  clientId: null,
  draft: {},
  isEditMode: false,

  initFromClient: (client) =>
    set({
      clientId: String(client.id),
      draft: initDraft(client),
      isEditMode: true,
    }),

  updateDraft: (data) =>
    set((s) => ({
      draft: {
        ...s.draft,
        ...data,
      },
    })),

  addDocument: (uri) =>
    set((s) => ({
      draft: {
        ...s.draft,
        _displayDocs: [
          ...(s.draft._displayDocs ?? []),
          {
            uri,
            isNew: true,
          },
        ],
        newDocuments: [...(s.draft.newDocuments ?? []), uri],
      },
    })),

  removeDocument: (index) =>
    set((s) => {
      const docs = s.draft._displayDocs ?? [];
      const doc = docs[index];
      if (!doc) return s;

      const newDisplayDocs = docs.filter((_, i) => i !== index);

      if (doc.isNew) {
        return {
          draft: {
            ...s.draft,
            _displayDocs: newDisplayDocs,
            newDocuments: (s.draft.newDocuments ?? []).filter(
              (u) => u !== doc.uri
            ),
          },
        };
      }
      // Mark existing as deleted
      const updatedDocs: DocumentUpdate[] = (s.draft.documents ?? []).map(
        (d) =>
          d.key === doc.key
            ? {
                ...d,
                deleted: true,
              }
            : d
      );
      if (doc.key && !updatedDocs.some((d) => d.key === doc.key)) {
        updatedDocs.push({
          key: doc.key,
          deleted: true,
        });
      }
      return {
        draft: {
          ...s.draft,
          _displayDocs: newDisplayDocs,
          documents: updatedDocs,
        },
      };
    }),

  getDisplayDocs: () => get().draft._displayDocs ?? [],

  clear: () =>
    set({
      clientId: null,
      draft: {},
      isEditMode: false,
    }),
}));
