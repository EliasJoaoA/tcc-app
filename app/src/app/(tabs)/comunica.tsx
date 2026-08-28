import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ContactItem } from '../../components/comunica/ContactItem';
import { TemplateCard } from '../../components/comunica/TemplateCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../hooks/useTheme';
import type { EmailTemplate, ProfessorContact } from '../../services/email.service';
import { emailService } from '../../services/email.service';
import { useAuthStore } from '../../store/auth.store';

const categoryLabels: Record<string, string> = {
  professor: 'Falar com Professor',
  group: 'Grupo de Trabalho',
  coordination: 'Contatos Importantes',
};

export default function ComunicaScreen() {
  const { colors, fontSize } = useTheme();
  const user = useAuthStore((s: any) => s.user);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contacts, setContacts] = useState<ProfessorContact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedBody, setEditedBody] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [selectedContact, setSelectedContact] = useState<ProfessorContact | null>(null);
  const [tab, setTab] = useState<'templates' | 'contacts'>('templates');

  // Add/edit contact
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ProfessorContact | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', department: '', discipline: '', notes: '' });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesRes, contactsRes] = await Promise.all([
        emailService.listTemplates(),
        emailService.listContacts(),
      ]);
      setTemplates(templatesRes.data.data);
      setContacts(contactsRes.data.data);
    } catch {}
  };

  const openTemplate = (template: EmailTemplate) => {
    const body = template.body.replace(/{nome}/g, user?.name || '{nome}');
    const subject = template.subject.replace(/{nome}/g, user?.name || '{nome}');
    setEditedBody(body);
    setEditedSubject(subject);
    setSelectedContact(null);
    setSelectedTemplate(template);
  };

  const handleSelectRecipient = (contact: ProfessorContact) => {
    setSelectedContact(contact);
    setEditedBody(
      editedBody
        .replace(/{professor}/g, contact.name)
        .replace(/{disciplina}/g, contact.discipline || '{disciplina}'),
    );
    setEditedSubject(
      editedSubject
        .replace(/{professor}/g, contact.name)
        .replace(/{disciplina}/g, contact.discipline || '{disciplina}'),
    );
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(editedBody);
    Alert.alert('Copiado!', 'Texto copiado para a área de transferência.');
  };

  const handleOpenMail = () => {
    const to = selectedContact?.email || '';
    const url = `mailto:${to}?subject=${encodeURIComponent(editedSubject)}&body=${encodeURIComponent(editedBody)}`;
    Linking.openURL(url);
  };

  // Contact CRUD
  const openContactForm = (contact?: ProfessorContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name,
        email: contact.email || '',
        department: contact.department || '',
        discipline: contact.discipline || '',
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setContactForm({ name: '', email: '', department: '', discipline: '', notes: '' });
    }
    setShowContactForm(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name.trim()) {
      Alert.alert('Atenção', 'Informe o nome do professor.');
      return;
    }
    setSavingContact(true);
    try {
      if (editingContact) {
        await emailService.updateContact(editingContact.id, contactForm);
      } else {
        await emailService.createContact(contactForm);
      }
      setShowContactForm(false);
      await loadData();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao salvar contato.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = (contact: ProfessorContact) => {
    Alert.alert('Excluir contato', `Excluir ${contact.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await emailService.deleteContact(contact.id);
          await loadData();
        },
      },
    ]);
  };

  const grouped = templates.reduce<Record<string, EmailTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabs}>
        {(['templates', 'contacts'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            accessibilityLabel={t === 'templates' ? 'Aba de templates' : 'Aba de contatos'}
            style={[
              styles.tab,
              {
                backgroundColor: tab === t ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={{
                color: tab === t ? '#FFF' : colors.primary,
                fontSize: fontSize.sm,
                fontWeight: '600',
              }}
            >
              {t === 'templates' ? 'Templates' : 'Contatos'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'templates' ? (
          Object.entries(grouped).map(([category, items]) => (
            <View key={category}>
              <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg }]}>
                {categoryLabels[category] || category}
              </Text>
              {items.map((t) => (
                <TemplateCard key={t.id} template={t} onPress={() => openTemplate(t)} />
              ))}
            </View>
          ))
        ) : (
          <>
            <View style={styles.contactsHeader}>
              <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg, marginTop: 0 }]}>
                Meus Professores
              </Text>
              <Pressable
                onPress={() => openContactForm()}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                accessibilityLabel="Adicionar contato"
              >
                <FontAwesome name="plus" size={14} color="#FFF" />
              </Pressable>
            </View>
            {contacts.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
                Nenhum contato cadastrado. Toque no + para adicionar.
              </Text>
            ) : (
              contacts.map((c) => (
                <ContactItem
                  key={c.id}
                  contact={c}
                  onEdit={() => openContactForm(c)}
                  onDelete={() => handleDeleteContact(c)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Template modal with recipient selection */}
      <Modal visible={!!selectedTemplate} animationType="slide" transparent>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>
              {selectedTemplate?.title}
            </Text>
            <Pressable onPress={() => setSelectedTemplate(null)} accessibilityLabel="Fechar">
              <Text style={{ color: colors.primary, fontSize: fontSize.base }}>Fechar</Text>
            </Pressable>
          </View>

          {/* Recipient selector */}
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 6 }]}>
            Destinatário:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12, maxHeight: 36 }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {contacts.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => handleSelectRecipient(c)}
                accessibilityLabel={`Selecionar ${c.name}`}
                style={[
                  styles.recipientChip,
                  {
                    backgroundColor: selectedContact?.id === c.id ? colors.primary : colors.surface,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={{ color: selectedContact?.id === c.id ? '#FFF' : colors.primary, fontSize: fontSize.xs, fontWeight: '600' }}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.subjectLabel, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Assunto:
          </Text>
          <TextInput
            value={editedSubject}
            onChangeText={setEditedSubject}
            style={[styles.subjectInput, { color: colors.text, borderColor: colors.border, fontSize: fontSize.base }]}
            accessibilityLabel="Assunto do e-mail"
          />

          <ScrollView style={styles.bodyScroll}>
            <TextInput
              value={editedBody}
              onChangeText={setEditedBody}
              multiline
              style={[styles.bodyInput, { color: colors.text, fontSize: fontSize.base }]}
              accessibilityLabel="Corpo do e-mail"
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable onPress={handleCopy} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel="Copiar texto">
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>Copiar</Text>
            </Pressable>
            <Pressable onPress={handleOpenMail} style={[styles.actionBtn, { backgroundColor: colors.primary }]} accessibilityLabel="Abrir no app de e-mail">
              <Text style={{ color: '#FFF', fontSize: fontSize.sm, fontWeight: '600' }}>
                {selectedContact ? `Enviar para ${selectedContact.name.split(' ')[0]}` : 'Abrir E-mail'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add/Edit contact modal */}
      <Modal visible={showContactForm} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.contactModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.contactModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </Text>
              <Pressable onPress={() => setShowContactForm(false)} accessibilityLabel="Fechar">
                <FontAwesome name="times" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input label="Nome *" value={contactForm.name} onChangeText={(v: string) => setContactForm({ ...contactForm, name: v })} placeholder="Nome do professor" accessibilityLabel="Nome do professor" />
            <Input label="E-mail" value={contactForm.email} onChangeText={(v: string) => setContactForm({ ...contactForm, email: v })} placeholder="professor@uepg.br" keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail do professor" />
            <Input label="Disciplina" value={contactForm.discipline} onChangeText={(v: string) => setContactForm({ ...contactForm, discipline: v })} placeholder="Ex: Algoritmos" accessibilityLabel="Disciplina" />
            <Input label="Departamento" value={contactForm.department} onChangeText={(v: string) => setContactForm({ ...contactForm, department: v })} placeholder="Ex: Ciência da Computação" accessibilityLabel="Departamento" />
            <Input label="Notas" value={contactForm.notes} onChangeText={(v: string) => setContactForm({ ...contactForm, notes: v })} placeholder="Anotações pessoais" multiline accessibilityLabel="Notas" />

            <Button title="Salvar" onPress={handleSaveContact} loading={savingContact} accessibilityLabel="Salvar contato" />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: { fontWeight: '700', marginBottom: 12, marginTop: 8 },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  empty: { fontStyle: 'italic', textAlign: 'center', marginTop: 32 },
  modal: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontWeight: '700', flex: 1 },
  recipientChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, marginRight: 8, alignSelf: 'flex-start' },
  subjectLabel: { marginBottom: 4 },
  subjectInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  bodyScroll: { flex: 1 },
  bodyInput: { lineHeight: 22, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  contactModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  contactModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
});
