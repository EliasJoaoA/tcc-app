import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MapPoint } from '../../services/map.service';
import { createLeafletMapHtml } from './leaflet-map';

interface Props {
  points: MapPoint[];
  onSelect: (point: MapPoint) => void;
}

export function CampusMap({ points, onSelect }: Props) {
  const html = useMemo(() => createLeafletMapHtml(points, 'web'), [points]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'campus-point') return;
      const point = points.find((item) => item.id === Number(event.data.id));
      if (point) onSelect(point);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelect, points]);

  return (
    <View style={styles.container}>
      <iframe
        title="Mapa interativo do campus da UEPG"
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, paddingTop: 112 } });
