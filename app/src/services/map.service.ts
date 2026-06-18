import api from './api';

export interface MapPoint {
  id: number;
  name: string;
  description: string | null;
  type: 'quiet_zone' | 'rest_point' | 'building' | 'service';
  latitude: number;
  longitude: number;
  floor: string | null;
  is_active: boolean;
}

export const mapService = {
  list: (type?: string, search?: string) =>
    api.get<{ data: MapPoint[] }>('/map/points', { params: { type, search } }),

  get: (id: number) =>
    api.get<{ data: MapPoint }>(`/map/points/${id}`),
};
