import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import type { MapPoint } from '../../services/map.service';

const typeColors: Record<string, string> = {
  quiet_zone: Colors.quietZone,
  rest_point: Colors.restPoint,
  building: Colors.building,
  service: Colors.service,
};

interface Props {
  points: MapPoint[];
  onSelect: (point: MapPoint) => void;
}

export function CampusMap({ points, onSelect }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: -25.0947,
        longitude: -50.1618,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          title={point.name}
          pinColor={typeColors[point.type]}
          onPress={() => onSelect(point)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
