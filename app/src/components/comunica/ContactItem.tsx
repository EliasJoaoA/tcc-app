import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ProfessorContact } from '../../services/email.service';

interface ContactItemProps {
  contact: ProfessorContact;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ContactItem({ contact, onEdit, onDelete }: ContactItemProps) {
  const { colors, fontSize } = useTheme();

  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderLight }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, fontSize: fontSize.base }]}>
          {contact.name}
        </Text>
        {contact.discipline && (
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm }]}>
            {contact.discipline}
          </Text>
        )}
        {contact.department && (
          <Text style={[{ color: colors.textLight, fontSize: fontSize.xs }]}>
            {contact.department}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        {contact.email && (
          <Pressable onPress={handleEmail} accessibilityLabel={`Enviar e-mail para ${contact.name}`} style={styles.actionBtn}>
            <FontAwesome name="envelope" size={18} color={colors.primary} />
          </Pressable>
        )}
        {onEdit && (
          <Pressable onPress={onEdit} accessibilityLabel={`Editar ${contact.name}`} style={styles.actionBtn}>
            <FontAwesome name="pencil" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} accessibilityLabel={`Excluir ${contact.name}`} style={styles.actionBtn}>
            <FontAwesome name="trash-o" size={18} color={colors.error} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
});
