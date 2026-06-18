import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SOSButtonProps {
  icon: string;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}

export function SOSButton({ icon, label, description, color, onPress }: SOSButtonProps) {
  const { colors, fontSize } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: color,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <FontAwesome name={icon as any} size={28} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.text, fontSize: fontSize.base }]}>{label}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  desc: {
    textAlign: 'center',
  },
});
