import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
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
import { ScheduleImportModal } from '../../components/meu-dia/ScheduleImportModal';
import { TaskItem } from '../../components/meu-dia/TaskItem';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../hooks/useTheme';
import type { Event, ImportedScheduleEvent, ScheduleImportPreview } from '../../services/events.service';
import { eventsService } from '../../services/events.service';
import type { Task } from '../../services/tasks.service';
import { tasksService } from '../../services/tasks.service';
import { useAuthStore } from '../../store/auth.store';

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromLocalDateKey = (date: string) => new Date(`${date}T12:00:00`);

export default function MeuDiaScreen() {
  const { colors, fontSize } = useTheme();
  const user = useAuthStore((s: any) => s.user);

  const today = toLocalDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
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
  const [importPreview, setImportPreview] = useState<ScheduleImportPreview | null>(null);
  const [importingPdf, setImportingPdf] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [clearingSchedule, setClearingSchedule] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventsRes, focusRes, tasksRes] = await Promise.all([
        eventsService.list(selectedDate),
        tasksService.list(true),
        tasksService.list(),
      ]);
      setEvents(eventsRes.data.data);
      setFocusTasks(focusRes.data.data.filter((t: Task) => !t.is_done).slice(0, 3));
      setAllTasks(tasksRes.data.data);
    } catch {}
  }, [selectedDate]);

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

  const handleSelectSchedulePdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setImportingPdf(true);
      const response = await eventsService.previewPdfImport(
        file.uri,
        file.name || 'extrato-matricula.pdf',
        file.mimeType || 'application/pdf',
        file.file,
      );
      setImportPreview(response.data.data);
    } catch (error: any) {
      Alert.alert(
        'Não foi possível ler o PDF',
        error.response?.data?.message
          || error.response?.data?.errors?.pdf?.[0]
          || 'Confira se o arquivo é um Extrato de Matrícula da UEPG.',
      );
    } finally {
      setImportingPdf(false);
    }
  };

  const handleConfirmScheduleImport = async (selectedEvents: ImportedScheduleEvent[]) => {
    setConfirmingImport(true);
    try {
      const response = await eventsService.confirmPdfImport(
        importPreview?.metadata.issued_at || today,
        selectedEvents,
      );
      setImportPreview(null);
      await loadData();
      Alert.alert('Horários importados', response.data.message);
    } catch (error: any) {
      Alert.alert('Erro ao importar', error.response?.data?.message || 'Não foi possível salvar os horários.');
    } finally {
      setConfirmingImport(false);
    }
  };

  const handleClearSchedule = () => {
    Alert.alert(
      'Limpar grade',
      'Isso removerá todos os horários recorrentes da sua grade. Tarefas e eventos avulsos serão mantidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar grade',
          style: 'destructive',
          onPress: async () => {
            setClearingSchedule(true);
            try {
              const response = await eventsService.clearSchedule();
              await loadData();
              Alert.alert('Grade limpa', response.data.message);
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível limpar a grade.');
            } finally {
              setClearingSchedule(false);
            }
          },
        },
      ],
    );
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

  const moveSelectedDate = (days: number) => {
    const date = fromLocalDateKey(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(toLocalDateKey(date));
  };

  const selectedDateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(fromLocalDateKey(selectedDate));

  const isToday = selectedDate === today;

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

        <View style={[styles.dateNavigator, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => moveSelectedDate(-1)}
            accessibilityLabel="Ver dia anterior"
            style={styles.dateArrow}
          >
            <FontAwesome name="chevron-left" size={16} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={() => setSelectedDate(today)}
            disabled={isToday}
            accessibilityLabel={isToday ? 'Agenda de hoje' : 'Voltar para hoje'}
            style={styles.dateLabelContainer}
          >
            <Text style={[styles.dateLabel, { color: colors.text, fontSize: fontSize.base }]}>
              {selectedDateLabel}
            </Text>
            <Text style={[styles.dateHint, { color: isToday ? colors.primary : colors.textSecondary, fontSize: fontSize.xs }]}>
              {isToday ? 'Hoje' : 'Toque para voltar para hoje'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => moveSelectedDate(1)}
            accessibilityLabel="Ver próximo dia"
            style={styles.dateArrow}
          >
            <FontAwesome name="chevron-right" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg, marginTop: 0 }]}>
            {isToday ? 'Agenda de Hoje' : 'Agenda do Dia'}
          </Text>
          <View style={styles.scheduleActions}>
            <Pressable
              onPress={handleClearSchedule}
              disabled={clearingSchedule}
              accessibilityLabel="Limpar grade de horários"
              style={[styles.clearButton, { borderColor: colors.error, opacity: clearingSchedule ? 0.6 : 1 }]}
            >
              <FontAwesome name={clearingSchedule ? 'spinner' : 'trash-o'} size={15} color={colors.error} />
            </Pressable>
            <Pressable
              onPress={handleSelectSchedulePdf}
              disabled={importingPdf}
              accessibilityLabel="Importar horários de um PDF"
              style={[styles.importButton, { borderColor: colors.primary, opacity: importingPdf ? 0.6 : 1 }]}
            >
              <FontAwesome name={importingPdf ? 'spinner' : 'file-pdf-o'} size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' }}>
                {importingPdf ? 'Lendo...' : 'Importar PDF'}
              </Text>
            </Pressable>
          </View>
        </View>
        {events.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Nenhum evento para este dia.
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

      <ScheduleImportModal
        visible={!!importPreview}
        preview={importPreview}
        loading={confirmingImport}
        onClose={() => setImportPreview(null)}
        onConfirm={handleConfirmScheduleImport}
      />
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
  dateNavigator: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateArrow: {
    width: 52,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dateLabel: {
    fontWeight: '700',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  dateHint: {
    marginTop: 3,
    fontWeight: '600',
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
  importButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    width: 36,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1.5,
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
