import api from './api';

export interface SupportContact {
  id: number;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
}

export interface SupportContactInput {
  name: string;
  phone: string;
  relationship?: string | null;
  is_primary?: boolean;
}

export const supportContactsService = {
  list: () =>
    api.get<{ data: SupportContact[] }>('/support-contacts'),

  create: (data: SupportContactInput) =>
    api.post<{ data: SupportContact }>('/support-contacts', data),

  update: (id: number, data: Partial<SupportContactInput>) =>
    api.put<{ data: SupportContact }>(`/support-contacts/${id}`, data),

  delete: (id: number) =>
    api.delete(`/support-contacts/${id}`),
};
