import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { Event } from '../../services/events.service';
import { Card } from '../ui/Card';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { colors, fontSize } = useTheme();

  const startTime = new Date(event.starts_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = event.ends_at
    ? new Date(event.ends_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Card style={{ borderLeftWidth: 4, borderLeftColor: event.color || colors.primary }}>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.base }]}>
        {event.title}
      </Text>
      <View style={styles.row}>
        <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
        <Text style={[styles.detail, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
          {startTime}{endTime ? ` — ${endTime}` : ''}
        </Text>
      </View>
      {event.location && (
        <View style={styles.row}>
          <FontAwesome name="map-pin" size={14} color={colors.textSecondary} />
          <Text style={[styles.detail, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            {event.location}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detail: {},
});
