import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import type { MapPoint } from '../../services/map.service';
import { Button } from '../ui/Button';

const typeLabels: Record<string, string> = {
  quiet_zone: 'Zona Silenciosa',
  rest_point: 'Ponto de Descanso',
  building: 'Prédio',
  service: 'Serviço',
};

const typeColors: Record<string, string> = {
  quiet_zone: Colors.quietZone,
  rest_point: Colors.restPoint,
  building: Colors.building,
  service: Colors.service,
};

interface PointCardProps {
  point: MapPoint;
  onClose: () => void;
}

export function PointCard({ point, onClose }: PointCardProps) {
  const { colors, fontSize } = useTheme();

  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${point.latitude},${point.longitude}`,
      android: `geo:0,0?q=${point.latitude},${point.longitude}(${point.name})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Pressable onPress={onClose} style={styles.close} accessibilityLabel="Fechar">
        <FontAwesome name="times" size={20} color={colors.textSecondary} />
      </Pressable>

      <View style={[styles.badge, { backgroundColor: typeColors[point.type] + '20' }]}>
        <View style={[styles.dot, { backgroundColor: typeColors[point.type] }]} />
        <Text style={[{ color: typeColors[point.type], fontSize: fontSize.xs, fontWeight: '600' }]}>
          {typeLabels[point.type]}
        </Text>
      </View>

      <Text style={[styles.name, { color: colors.text, fontSize: fontSize.lg }]}>{point.name}</Text>

      {point.description && (
        <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4 }]}>
          {point.description}
        </Text>
      )}

      {point.floor && (
        <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4 }]}>
          📍 {point.floor}
        </Text>
      )}

      <Button
        title="Como Chegar"
        onPress={handleDirections}
        style={{ marginTop: 12 }}
        accessibilityLabel="Abrir direções no mapa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  name: {
    fontWeight: '700',
  },
});
