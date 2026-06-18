import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { EmailTemplate } from '../../services/email.service';
import { Card } from '../ui/Card';

const categoryIcons: Record<string, string> = {
  professor: 'graduation-cap',
  group: 'users',
  coordination: 'building',
  other: 'envelope',
};

interface TemplateCardProps {
  template: EmailTemplate;
  onPress: () => void;
}

export function TemplateCard({ template, onPress }: TemplateCardProps) {
  const { colors, fontSize } = useTheme();

  return (
    <Pressable onPress={onPress} accessibilityLabel={`Template: ${template.title}`}>
      <Card>
        <View style={styles.row}>
          <FontAwesome
            name={categoryIcons[template.category] as any}
            size={20}
            color={colors.primary}
          />
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text, fontSize: fontSize.base }]}>
              {template.title}
            </Text>
            <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm }]}>
              {template.subject}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={colors.textLight} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
});
