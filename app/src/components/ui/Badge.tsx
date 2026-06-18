import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  label: string;
  color?: string;
  icon?: string;
}

const priorityColors: Record<string, string> = {
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

export function Badge({ label, color }: BadgeProps) {
  const { fontSize } = useTheme();
  const bgColor = priorityColors[label.toLowerCase()] ?? color ?? Colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor + '20' }]}>
      <View style={[styles.dot, { backgroundColor: bgColor }]} />
      <Text style={[styles.text, { color: bgColor, fontSize: fontSize.xs }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
  },
});
