import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
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
  const { colors, fontSize } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.webNotice, { backgroundColor: colors.primaryLight }]}> 
        <FontAwesome name="map" size={18} color={colors.primaryDark} />
        <Text style={{ color: colors.primaryDark, fontSize: fontSize.sm }}>
          No navegador, os pontos são exibidos em lista. O mapa interativo está disponível no app móvel.
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {points.map((point) => (
          <Pressable
            key={point.id}
            onPress={() => onSelect(point)}
            style={[styles.point, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.marker, { backgroundColor: typeColors[point.type] }]}> 
              <FontAwesome name="map-marker" size={18} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: fontSize.base, fontWeight: '700' }}>{point.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{point.description}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 112 },
  webNotice: { marginHorizontal: 16, padding: 12, borderRadius: 12, flexDirection: 'row', gap: 10 },
  list: { padding: 16, gap: 10, paddingBottom: 140 },
  point: { padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12 },
  marker: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
