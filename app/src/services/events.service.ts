import api from './api';

export interface Event {
  id: number;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  color: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
}

export const eventsService = {
  list: (date?: string) =>
    api.get<{ data: Event[] }>('/events', { params: date ? { date } : undefined }),

  create: (data: Partial<Event>) =>
    api.post<{ data: Event }>('/events', data),

  get: (id: number) =>
    api.get<{ data: Event }>(`/events/${id}`),

  update: (id: number, data: Partial<Event>) =>
    api.put<{ data: Event }>(`/events/${id}`, data),

  delete: (id: number) =>
    api.delete(`/events/${id}`),

  export: () =>
    api.get('/events/export', { responseType: 'blob' }),
};
