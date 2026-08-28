import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../hooks/useTheme';
import { userService } from '../../services/user.service';
import type { SupportContact } from '../../services/support-contacts.service';
import { supportContactsService } from '../../services/support-contacts.service';
import { useAuthStore } from '../../store/auth.store';
import { usePreferencesStore } from '../../store/preferences.store';
import { maskPhone } from '../../utils/masks';

type ContactForm = {
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
};

const emptyForm: ContactForm = { name: '', phone: '', relationship: '', is_primary: false };

export default function ProfileScreen() {
  const { colors, fontSize } = useTheme();
  const { user, logout, refreshUser } = useAuthStore();
  const { preferences, updatePreference } = usePreferencesStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [course, setCourse] = useState(user?.course || '');
  const [saving, setSaving] = useState(false);

  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(emptyForm);
  const [savingContact, setSavingContact] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const res = await supportContactsService.list();
      setContacts(res.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
      });
      await refreshUser();
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // TODO(foto de perfil): reativar o upload de avatar quando o S3 estiver
  // configurado. A lógica ficou em userService.updateAvatar / handlePickAvatar
  // (removido). Enquanto isso, o perfil mostra apenas um ícone estático.

  const openContactModal = (contact?: SupportContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || '',
        is_primary: contact.is_primary,
      });
    } else {
      setEditingContact(null);
      setContactForm({ ...emptyForm, is_primary: contacts.length === 0 });
    }
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      Alert.alert('Atenção', 'Informe nome e telefone do contato.');
      return;
    }
    setSavingContact(true);
    try {
      const payload = {
        name: contactForm.name.trim(),
        phone: contactForm.phone.trim(),
        relationship: contactForm.relationship.trim() || null,
        is_primary: contactForm.is_primary,
      };
      if (editingContact) {
        await supportContactsService.update(editingContact.id, payload);
      } else {
        await supportContactsService.create(payload);
      }
      setShowContactModal(false);
      await loadContacts();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao salvar contato.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = (contact: SupportContact) => {
    Alert.alert('Excluir contato', `Excluir ${contact.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await supportContactsService.delete(contact.id);
            await loadContacts();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o contato.');
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const fontSizeOptions = ['small', 'medium', 'large'] as const;
  const fontSizeLabels = { small: 'Pequena', medium: 'Média', large: 'Grande' };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Foto de perfil oculta até configurarmos o S3 (upload desativado). */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
          <FontAwesome name="user" size={40} color={colors.primary} />
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg }]}>
        Dados Pessoais
      </Text>
      <Input label="Nome" value={name} onChangeText={setName} accessibilityLabel="Nome" />
      <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" />
      <Input label="Curso" value={course} onChangeText={setCourse} accessibilityLabel="Curso" />
      <Button title="Salvar" onPress={handleSaveProfile} loading={saving} accessibilityLabel="Salvar perfil" />

      <View style={styles.sectionHeader}>
        <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg, marginTop: 0, marginBottom: 0 }]}>
          Contatos de Apoio (SOS)
        </Text>
        <Pressable
          onPress={() => openContactModal()}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="Adicionar contato de apoio"
        >
          <FontAwesome name="plus" size={14} color="#FFF" />
        </Pressable>
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
        O contato principal é quem o app liga no botão SOS.
      </Text>

      {contacts.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
          Nenhum contato cadastrado. Toque no + para adicionar.
        </Text>
      ) : (
        contacts.map((c) => (
          <View key={c.id} style={[styles.contactRow, { borderBottomColor: colors.borderLight }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.contactNameRow}>
                <Text style={[styles.contactName, { color: colors.text, fontSize: fontSize.base }]}>
                  {c.name}
                </Text>
                {c.is_primary && (
                  <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.primaryBadgeText}>Principal</Text>
                  </View>
                )}
              </View>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm }]}>
                {c.relationship ? `${c.relationship} · ` : ''}{c.phone}
              </Text>
            </View>
            <Pressable onPress={() => openContactModal(c)} style={styles.contactAction} accessibilityLabel={`Editar ${c.name}`}>
              <FontAwesome name="pencil" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => handleDeleteContact(c)} style={styles.contactAction} accessibilityLabel={`Excluir ${c.name}`}>
              <FontAwesome name="trash-o" size={18} color={colors.error} />
            </Pressable>
          </View>
        ))
      )}

      <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg, marginTop: 32 }]}>
        Acessibilidade
      </Text>

      <Text style={[styles.prefLabel, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
        Tamanho da fonte
      </Text>
      <View style={styles.fontSizeRow}>
        {fontSizeOptions.map((size) => (
          <Pressable
            key={size}
            onPress={() => updatePreference('font_size', size)}
            accessibilityLabel={`Fonte ${fontSizeLabels[size]}`}
            style={[
              styles.fontSizeBtn,
              {
                backgroundColor: preferences.font_size === size ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={{ color: preferences.font_size === size ? '#FFF' : colors.primary, fontSize: 14, fontWeight: '600' }}>
              {fontSizeLabels[size]}
            </Text>
          </Pressable>
        ))}
      </View>

      <SettingRow
        label="Alto contraste"
        value={preferences.high_contrast}
        onToggle={(v) => updatePreference('high_contrast', v)}
        colors={colors}
        fontSize={fontSize}
      />
      <SettingRow
        label="Legendas automáticas"
        value={preferences.auto_captions}
        onToggle={(v) => updatePreference('auto_captions', v)}
        colors={colors}
        fontSize={fontSize}
      />
      <SettingRow
        label="Reduzir animações"
        value={preferences.reduce_animations}
        onToggle={(v) => updatePreference('reduce_animations', v)}
        colors={colors}
        fontSize={fontSize}
      />

      <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg, marginTop: 32 }]}>
        Notificações
      </Text>
      <SettingRow
        label="Notificações ativas"
        value={preferences.notifications_enabled}
        onToggle={(v) => updatePreference('notifications_enabled', v)}
        colors={colors}
        fontSize={fontSize}
      />

      <Button
        title="Sair"
        onPress={handleLogout}
        variant="danger"
        style={{ marginTop: 40 }}
        accessibilityLabel="Sair da conta"
      />

      <Modal visible={showContactModal} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>
                {editingContact ? 'Editar Contato' : 'Novo Contato de Apoio'}
              </Text>
              <Pressable onPress={() => setShowContactModal(false)} accessibilityLabel="Fechar">
                <FontAwesome name="times" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Nome *"
              value={contactForm.name}
              onChangeText={(v: string) => setContactForm({ ...contactForm, name: v })}
              placeholder="Ex: Maria (mãe)"
              accessibilityLabel="Nome do contato"
            />
            <Input
              label="Telefone *"
              value={contactForm.phone}
              onChangeText={(v: string) => setContactForm({ ...contactForm, phone: maskPhone(v) })}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={16}
              accessibilityLabel="Telefone do contato"
            />
            <Input
              label="Parentesco / relação"
              value={contactForm.relationship}
              onChangeText={(v: string) => setContactForm({ ...contactForm, relationship: v })}
              placeholder="Ex: Mãe, Irmão, Amigo"
              accessibilityLabel="Parentesco ou relação"
            />

            <Pressable
              onPress={() => setContactForm({ ...contactForm, is_primary: !contactForm.is_primary })}
              style={styles.primaryToggle}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: contactForm.is_primary }}
              accessibilityLabel="Definir como contato principal"
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: contactForm.is_primary ? colors.primary : colors.border,
                    backgroundColor: contactForm.is_primary ? colors.primary : 'transparent',
                  },
                ]}
              >
                {contactForm.is_primary && <Text style={styles.check}>✓</Text>}
              </View>
              <Text style={{ color: colors.text, fontSize: fontSize.base }}>
                Definir como contato principal
              </Text>
            </Pressable>

            <Button
              title="Salvar contato"
              onPress={handleSaveContact}
              loading={savingContact}
              style={{ marginTop: 16 }}
              accessibilityLabel="Salvar contato"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

function SettingRow({
  label,
  value,
  onToggle,
  colors,
  fontSize: fs,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: any;
  fontSize: any;
}) {
  return (
    <View style={settingStyles.row}>
      <Text style={[{ color: colors.text, fontSize: fs.base, flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#f4f4f4'}
        accessibilityLabel={label}
      />
    </View>
  );
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 4,
  },
  hint: {
    marginBottom: 12,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontStyle: 'italic',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  contactName: {
    fontWeight: '600',
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  contactAction: {
    padding: 8,
  },
  prefLabel: {
    marginBottom: 8,
  },
  fontSizeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  fontSizeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
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
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
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
