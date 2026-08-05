import type { ComponentType } from 'react';
import type { MapPoint } from '../../services/map.service';

export const CampusMap: ComponentType<{
  points: MapPoint[];
  onSelect: (point: MapPoint) => void;
}>;
