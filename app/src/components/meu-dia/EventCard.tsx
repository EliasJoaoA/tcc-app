import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { Event } from '../../services/events.service';
import { Card } from '../ui/Card';

interface EventCardProps {
  event: Event;
}

const formatScheduleTime = (value: string) => {
  // Class schedules are wall-clock times. Converting an ISO value with Date
  // would turn 08:15 UTC into 05:15 in America/Sao_Paulo.
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value.slice(0, 5);
};

export function EventCard({ event }: EventCardProps) {
  const { colors, fontSize } = useTheme();

  const startTime = formatScheduleTime(event.starts_at);
  const endTime = event.ends_at ? formatScheduleTime(event.ends_at) : null;

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
