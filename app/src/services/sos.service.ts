import api from './api';
import type { MapPoint } from './map.service';

export interface SosResource {
  id: number;
  type: 'breathing' | 'calm_route' | 'service';
  title: string;
  description: string | null;
  map_point: MapPoint | null;
  content: Record<string, unknown> | null;
  is_active: boolean;
}

export const sosService = {
  listResources: () =>
    api.get<{ data: SosResource[] }>('/sos/resources'),

  nearestCalmPoint: (lat: number, lng: number) =>
    api.get<{ data: MapPoint }>('/sos/nearest-calm-point', { params: { lat, lng } }),
};
