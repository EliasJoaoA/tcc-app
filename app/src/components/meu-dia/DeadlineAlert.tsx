import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { Task } from '../../services/tasks.service';
import { Card } from '../ui/Card';

interface DeadlineAlertProps {
  task: Task;
}

export function DeadlineAlert({ task }: DeadlineAlertProps) {
  const { colors, fontSize } = useTheme();

  const daysLeft = Math.ceil(
    (new Date(task.due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const urgencyColor = daysLeft <= 1 ? colors.error : daysLeft <= 3 ? colors.warning : colors.primary;

  return (
    <Card style={{ borderLeftWidth: 4, borderLeftColor: urgencyColor }}>
      <View style={styles.row}>
        <FontAwesome name="exclamation-circle" size={18} color={urgencyColor} />
        <Text style={[styles.label, { color: urgencyColor, fontSize: fontSize.sm }]}>
          Próximo prazo
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.base }]}>
        {task.title}
      </Text>
      <Text style={[{ color: urgencyColor, fontSize: fontSize.lg, fontWeight: '700', marginTop: 4 }]}>
        {daysLeft <= 0 ? 'Hoje!' : daysLeft === 1 ? 'Amanhã' : `${daysLeft} dias restantes`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  title: {
    fontWeight: '500',
  },
});
