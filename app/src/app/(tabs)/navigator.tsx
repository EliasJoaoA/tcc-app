import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { CampusMap } from '../../components/mapa/CampusMap';
import { PointCard } from '../../components/mapa/PointCard';
import { useTheme } from '../../hooks/useTheme';
import type { MapPoint } from '../../services/map.service';
import { mapService } from '../../services/map.service';
import { getApiErrorMessage } from '../../services/api-error';

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

export default function NavigatorScreen() {
  const { colors, fontSize } = useTheme();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPoints();
  }, [activeFilter, search]);

  const loadPoints = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await mapService.list(activeFilter ?? undefined, search || undefined);
      setPoints(res.data.data);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os pontos do campus.'));
    } finally {
      setLoading(false);
    }
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

      <CampusMap points={points} onSelect={setSelectedPoint} />

      {loading && (
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: fontSize.sm }}>Carregando campus...</Text>
        </View>
      )}

      {!loading && errorMessage && (
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <FontAwesome name="exclamation-circle" size={18} color={colors.error} />
          <Text style={[styles.statusText, { color: colors.text, fontSize: fontSize.sm }]}>{errorMessage}</Text>
          <Pressable onPress={loadPoints} accessibilityLabel="Tentar carregar o campus novamente">
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}

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
  statusCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '45%',
    zIndex: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 10,
    elevation: 5,
  },
  statusText: { textAlign: 'center' },
});
