import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../../constants/colors';
import { PointCard } from '../../components/mapa/PointCard';
import { useTheme } from '../../hooks/useTheme';
import type { MapPoint } from '../../services/map.service';
import { mapService } from '../../services/map.service';

const typeColors: Record<string, string> = {
  quiet_zone: Colors.quietZone,
  rest_point: Colors.restPoint,
  building: Colors.building,
  service: Colors.service,
};

const typeLabels: Record<string, string> = {
  quiet_zone: 'Silenciosas',
  rest_point: 'Descanso',
  building: 'Prédios',
  service: 'Serviços',
};

const UEPG_REGION = {
  latitude: -25.0947,
  longitude: -50.1618,
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

export default function NavigatorScreen() {
  const { colors, fontSize } = useTheme();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPoints();
  }, [activeFilter, search]);

  const loadPoints = async () => {
    try {
      const res = await mapService.list(activeFilter ?? undefined, search || undefined);
      setPoints(res.data.data);
    } catch {}
  };

  const filters = ['quiet_zone', 'rest_point', 'building', 'service'] as const;

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <FontAwesome name="search" size={16} color={colors.textSecondary} />
        <TextInput
          placeholder="Buscar local..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text, fontSize: fontSize.sm }]}
          accessibilityLabel="Buscar pontos no mapa"
        />
      </View>

      <View style={styles.filters}>
        {filters.map((type) => (
          <Pressable
            key={type}
            onPress={() => setActiveFilter(activeFilter === type ? null : type)}
            accessibilityLabel={`Filtrar por ${typeLabels[type]}`}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeFilter === type ? typeColors[type] : colors.surface,
                borderColor: typeColors[type],
              },
            ]}
          >
            <Text
              style={{
                color: activeFilter === type ? '#FFF' : typeColors[type],
                fontSize: fontSize.xs,
                fontWeight: '600',
              }}
            >
              {typeLabels[type]}
            </Text>
          </Pressable>
        ))}
      </View>

      <MapView
        style={styles.map}
        initialRegion={UEPG_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.name}
            pinColor={typeColors[point.type]}
            onPress={() => setSelectedPoint(point)}
          />
        ))}
      </MapView>

      {selectedPoint && (
        <PointCard point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
  },
  filters: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  map: {
    flex: 1,
  },
});
