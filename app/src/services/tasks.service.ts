import api from './api';

export interface Task {
  id: number;
  title: string;
  is_done: boolean;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  is_focus: boolean;
}

export const tasksService = {
  list: (focus?: boolean) =>
    api.get<{ data: Task[] }>('/tasks', { params: focus ? { focus: true } : undefined }),

  create: (data: Partial<Task>) =>
    api.post<{ data: Task }>('/tasks', data),

  update: (id: number, data: Partial<Task>) =>
    api.put<{ data: Task }>(`/tasks/${id}`, data),

  toggleDone: (id: number) =>
    api.patch<{ data: Task }>(`/tasks/${id}/toggle-done`),

  delete: (id: number) =>
    api.delete(`/tasks/${id}`),
};
