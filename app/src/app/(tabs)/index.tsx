import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DeadlineAlert } from '../../components/meu-dia/DeadlineAlert';
import { EventCard } from '../../components/meu-dia/EventCard';
import { TaskItem } from '../../components/meu-dia/TaskItem';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../hooks/useTheme';
import type { Event } from '../../services/events.service';
import { eventsService } from '../../services/events.service';
import type { Task } from '../../services/tasks.service';
import { tasksService } from '../../services/tasks.service';
import { useAuthStore } from '../../store/auth.store';

export default function MeuDiaScreen() {
  const { colors, fontSize } = useTheme();
  const user = useAuthStore((s: any) => s.user);

  const [events, setEvents] = useState<Event[]>([]);
  const [focusTasks, setFocusTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newIsFocus, setNewIsFocus] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      const [eventsRes, focusRes, tasksRes] = await Promise.all([
        eventsService.list(today),
        tasksService.list(true),
        tasksService.list(),
      ]);
      setEvents(eventsRes.data.data);
      setFocusTasks(focusRes.data.data.filter((t: Task) => !t.is_done).slice(0, 3));
      setAllTasks(tasksRes.data.data);
    } catch {}
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleTask = async (id: number) => {
    await tasksService.toggleDone(id);
    await loadData();
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Atenção', 'Informe o título da tarefa.');
      return;
    }
    setSaving(true);
    try {
      await tasksService.create({
        title: newTitle.trim(),
        priority: newPriority,
        is_focus: newIsFocus,
        due_date: newDueDate || undefined,
      });
      setShowAddTask(false);
      setNewTitle('');
      setNewPriority('medium');
      setNewDueDate('');
      setNewIsFocus(true);
      await loadData();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao criar tarefa.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await tasksService.delete(id);
          await loadData();
        },
      },
    ]);
  };

  const nextDeadline = allTasks
    .filter((t) => !t.is_done && t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const priorities: Array<{ value: 'low' | 'medium' | 'high'; label: string; color: string }> = [
    { value: 'high', label: 'Alta', color: colors.error },
    { value: 'medium', label: 'Média', color: colors.warning },
    { value: 'low', label: 'Baixa', color: colors.success },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.greeting, { color: colors.text, fontSize: fontSize['2xl'] }]}>
          {greeting()}, {user?.name?.split(' ')[0]}! 👋
        </Text>

        {nextDeadline && <DeadlineAlert task={nextDeadline} />}

        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg }]}>
          Agenda de Hoje
        </Text>
        {events.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Nenhum evento para hoje.
          </Text>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg, marginTop: 0 }]}>
            Foco do Dia
          </Text>
          <Pressable
            onPress={() => setShowAddTask(true)}
            accessibilityLabel="Adicionar tarefa"
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <FontAwesome name="plus" size={14} color="#FFF" />
          </Pressable>
        </View>

        {focusTasks.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Nenhuma tarefa marcada como foco. Toque no + para adicionar.
          </Text>
        ) : (
          focusTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          ))
        )}

        {allTasks.filter((t) => !t.is_focus && !t.is_done).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg }]}>
              Outras Tarefas
            </Text>
            {allTasks
              .filter((t) => !t.is_focus && !t.is_done)
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddTask} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>
                Nova Tarefa
              </Text>
              <Pressable onPress={() => setShowAddTask(false)} accessibilityLabel="Fechar">
                <FontAwesome name="times" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Título *"
              placeholder="O que precisa fazer?"
              value={newTitle}
              onChangeText={setNewTitle}
              accessibilityLabel="Título da tarefa"
            />

            <Input
              label="Prazo (opcional)"
              placeholder="AAAA-MM-DD"
              value={newDueDate}
              onChangeText={setNewDueDate}
              accessibilityLabel="Data de prazo"
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
              Prioridade
            </Text>
            <View style={styles.priorityRow}>
              {priorities.map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setNewPriority(p.value)}
                  accessibilityLabel={`Prioridade ${p.label}`}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: newPriority === p.value ? p.color : colors.background,
                      borderColor: p.color,
                    },
                  ]}
                >
                  <Text style={{ color: newPriority === p.value ? '#FFF' : p.color, fontSize: fontSize.sm, fontWeight: '600' }}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setNewIsFocus(!newIsFocus)}
              style={styles.focusToggle}
              accessibilityLabel="Marcar como foco do dia"
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: newIsFocus ? colors.primary : colors.border,
                    backgroundColor: newIsFocus ? colors.primary : 'transparent',
                  },
                ]}
              >
                {newIsFocus && <Text style={styles.check}>✓</Text>}
              </View>
              <Text style={[{ color: colors.text, fontSize: fontSize.base }]}>
                Adicionar ao Foco do Dia
              </Text>
            </Pressable>

            <Button
              title="Criar Tarefa"
              onPress={handleAddTask}
              loading={saving}
              style={{ marginTop: 16 }}
              accessibilityLabel="Criar tarefa"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontWeight: '700',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: '700',
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  focusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
});
