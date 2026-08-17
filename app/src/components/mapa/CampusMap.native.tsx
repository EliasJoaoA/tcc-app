import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { MapPoint } from '../../services/map.service';
import { createLeafletMapHtml } from './leaflet-map';

interface Props {
  points: MapPoint[];
  onSelect: (point: MapPoint) => void;
}

export function CampusMap({ points, onSelect }: Props) {
  const html = useMemo(() => createLeafletMapHtml(points, 'native'), [points]);
  return (
    <WebView
      style={styles.map}
      source={{ html }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => {
        const point = points.find((item) => item.id === Number(event.nativeEvent.data));
        if (point) onSelect(point);
      }}
      accessibilityLabel="Mapa interativo do campus da UEPG"
    />
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
