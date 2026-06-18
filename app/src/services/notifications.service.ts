import api from './api';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: 'deadline' | 'event' | 'system';
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export const notificationsService = {
  list: () =>
    api.get<{ data: AppNotification[] }>('/notifications'),

  markRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};
