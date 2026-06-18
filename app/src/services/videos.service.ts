import api from './api';

export interface Video {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  url: string;
  thumbnail: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  order: number;
}

export const videosService = {
  list: (category?: string) =>
    api.get<{ data: Video[] }>('/videos', { params: category ? { category } : undefined }),

  get: (id: number) =>
    api.get<{ data: Video }>(`/videos/${id}`),
};
