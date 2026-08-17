import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ImportedScheduleEvent, ScheduleImportPreview } from '../../services/events.service';
import { Button } from '../ui/Button';

interface Props {
  preview: ScheduleImportPreview | null;
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (events: ImportedScheduleEvent[]) => Promise<void>;
}

export function ScheduleImportModal({ preview, visible, loading, onClose, onConfirm }: Props) {
  const { colors, fontSize } = useTheme();
  const [selection, setSelection] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSelection({});
  }, [preview]);

  const selectedEvents = useMemo(
    () => (preview?.events ?? []).map((event, index) => ({
      ...event,
      selected: selection[index] ?? true,
    })),
    [preview, selection],
  );

  const selectedCount = selectedEvents.filter((event) => event.selected).length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text, fontSize: fontSize.lg }]}>Revisar horários</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {preview?.metadata.course || 'Extrato de matrícula'}
              {preview?.metadata.semester ? ` · ${preview.metadata.semester}` : ''}
            </Text>
          </View>
          <Pressable onPress={onClose} accessibilityLabel="Fechar revisão">
            <FontAwesome name="times" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.primaryLight }]}> 
          <FontAwesome name="info-circle" size={18} color={colors.primaryDark} />
          <Text style={[styles.noticeText, { color: colors.primaryDark, fontSize: fontSize.sm }]}> 
            Confira dias, salas e horários. As aulas serão adicionadas semanalmente à agenda.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {selectedEvents.map((event, index) => (
            <Pressable
              key={`${event.code}-${event.day_of_week}-${event.start_time}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: event.selected }}
              accessibilityLabel={`${event.title}, ${event.day_label}, das ${event.start_time} às ${event.end_time}`}
              onPress={() => setSelection((current) => ({
                ...current,
                [index]: !(current[index] ?? true),
              }))}
              style={[
                styles.eventCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: event.selected ? colors.primary : colors.border,
                  opacity: event.selected ? 1 : 0.55,
                },
              ]}
            >
              <View style={[
                styles.checkbox,
                {
                  borderColor: event.selected ? colors.primary : colors.border,
                  backgroundColor: event.selected ? colors.primary : 'transparent',
                },
              ]}>
                {event.selected && <FontAwesome name="check" size={12} color="#FFF" />}
              </View>
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text, fontSize: fontSize.base }]}>
                  {event.title}
                </Text>
                <View style={styles.detailsRow}>
                  <FontAwesome name="calendar" size={13} color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                    {event.day_label}, {event.start_time}–{event.end_time}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <FontAwesome name="map-marker" size={14} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                    {event.location || 'Local não informado'}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}> 
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 10 }}>
            {selectedCount} de {selectedEvents.length} aulas selecionadas
          </Text>
          <Button
            title="Importar para minha agenda"
            onPress={() => onConfirm(selectedEvents)}
            loading={loading}
            disabled={selectedCount === 0}
            accessibilityLabel={`Importar ${selectedCount} aulas para a agenda`}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, paddingRight: 16 },
  title: { fontWeight: '700', marginBottom: 2 },
  notice: {
    margin: 16,
    marginBottom: 4,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  noticeText: { flex: 1, lineHeight: 20 },
  list: { padding: 16, paddingBottom: 24, gap: 10 },
  eventCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  eventContent: { flex: 1, gap: 6 },
  eventTitle: { fontWeight: '700', lineHeight: 21 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footer: { borderTopWidth: 1, padding: 16, paddingBottom: 28 },
});
