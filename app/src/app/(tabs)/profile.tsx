import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { useAuthStore } from '../../store/auth.store';
import { usePreferencesStore } from '../../store/preferences.store';

export default function ProfileScreen() {
  const { colors, fontSize } = useTheme();
  const { user, logout, refreshUser } = useAuthStore();
  const { preferences, updatePreference } = usePreferencesStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [course, setCourse] = useState(user?.course || '');
  const [sosName, setSosName] = useState(user?.support_contact_name || '');
  const [sosPhone, setSosPhone] = useState(user?.support_contact_phone || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
        support_contact_name: sosName.trim(),
        support_contact_phone: sosPhone.trim(),
      });
      await refreshUser();
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        await userService.updateAvatar(formData);
        await refreshUser();
      } catch {
        Alert.alert('Erro', 'Não foi possível atualizar a foto.');
      }
    }
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
      <Pressable
        onPress={handlePickAvatar}
        style={styles.avatarContainer}
        accessibilityLabel="Alterar foto de perfil"
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
            <FontAwesome name="user" size={40} color={colors.primary} />
          </View>
        )}
        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
          <FontAwesome name="camera" size={12} color="#FFF" />
        </View>
      </Pressable>

      <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg }]}>
        Dados Pessoais
      </Text>
      <Input label="Nome" value={name} onChangeText={setName} accessibilityLabel="Nome" />
      <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" />
      <Input label="Curso" value={course} onChangeText={setCourse} accessibilityLabel="Curso" />

      <Text style={[styles.section, { color: colors.text, fontSize: fontSize.lg }]}>
        Contato SOS
      </Text>
      <Input label="Nome do contato" value={sosName} onChangeText={setSosName} accessibilityLabel="Nome do contato SOS" />
      <Input label="Telefone" value={sosPhone} onChangeText={setSosPhone} keyboardType="phone-pad" accessibilityLabel="Telefone do contato SOS" />

      <Button title="Salvar" onPress={handleSaveProfile} loading={saving} accessibilityLabel="Salvar perfil" />

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
});
