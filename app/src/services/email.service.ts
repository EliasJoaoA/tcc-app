import api from './api';

export interface EmailTemplate {
  id: number;
  title: string;
  category: 'professor' | 'group' | 'coordination' | 'other';
  subject: string;
  body: string;
  is_active: boolean;
  order: number;
}

export interface ProfessorContact {
  id: number;
  name: string;
  email: string | null;
  department: string | null;
  discipline: string | null;
  notes: string | null;
}

export const emailService = {
  listTemplates: (category?: string) =>
    api.get<{ data: EmailTemplate[] }>('/email-templates', { params: category ? { category } : undefined }),

  getTemplate: (id: number) =>
    api.get<{ data: EmailTemplate }>(`/email-templates/${id}`),

  listContacts: () =>
    api.get<{ data: ProfessorContact[] }>('/professor-contacts'),

  createContact: (data: Partial<ProfessorContact>) =>
    api.post<{ data: ProfessorContact }>('/professor-contacts', data),

  updateContact: (id: number, data: Partial<ProfessorContact>) =>
    api.put<{ data: ProfessorContact }>(`/professor-contacts/${id}`, data),

  deleteContact: (id: number) =>
    api.delete(`/professor-contacts/${id}`),
};
