import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/colors';
import type { Task } from '../../services/tasks.service';
import { Badge } from '../ui/Badge';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onToggle(task.id)}
        accessibilityLabel={`${task.is_done ? 'Concluída' : 'Pendente'}: ${task.title}`}
        accessibilityRole="checkbox"
        style={styles.main}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: task.is_done ? colors.success : colors.border,
              backgroundColor: task.is_done ? colors.success : 'transparent',
            },
          ]}
        >
          {task.is_done && <Text style={styles.check}>✓</Text>}
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: task.is_done ? colors.textSecondary : colors.text,
                fontSize: fontSize.base,
                textDecorationLine: task.is_done ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>
          <Badge
            label={{ low: 'Baixa', medium: 'Média', high: 'Alta' }[task.priority]}
            color={{ low: Colors.priorityLow, medium: Colors.priorityMedium, high: Colors.priorityHigh }[task.priority]}
          />
        </View>
      </Pressable>
      {onDelete && (
        <Pressable
          onPress={() => onDelete(task.id)}
          accessibilityLabel={`Excluir tarefa: ${task.title}`}
          style={styles.deleteBtn}
        >
          <FontAwesome name="trash-o" size={18} color={colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 10,
  },
});
