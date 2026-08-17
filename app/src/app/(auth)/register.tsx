import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../hooks/useTheme';
import { getApiErrorMessage } from '../../services/api-error';
import { useAuthStore } from '../../store/auth.store';

export default function RegisterScreen() {
  const { colors, fontSize } = useTheme();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: confirmPassword,
        course: course.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (error: unknown) {
      Alert.alert('Não foi possível criar a conta', getApiErrorMessage(error, 'Erro ao criar conta.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} accessibilityLabel="Voltar">
          <Text style={[styles.back, { color: colors.primary, fontSize: fontSize.base }]}>
            ← Voltar
          </Text>
        </Pressable>

        <Text
          style={[styles.title, { color: colors.text, fontSize: fontSize['2xl'] }]}
          accessibilityRole="header"
        >
          Criar Conta
        </Text>

        <View style={styles.form}>
          <Input
            label="Nome completo *"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            accessibilityLabel="Campo de nome completo"
          />
          <Input
            label="E-mail *"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Campo de e-mail"
          />
          <Input
            label="Curso"
            placeholder="Ex: Ciência da Computação"
            value={course}
            onChangeText={setCourse}
            accessibilityLabel="Campo de curso"
          />
          <Input
            label="Senha *"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Campo de senha"
          />
          <Input
            label="Confirmar senha *"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            accessibilityLabel="Campo de confirmar senha"
          />
          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={loading}
            accessibilityLabel="Botão de criar conta"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  back: {
    marginBottom: 24,
    fontWeight: '500',
  },
  title: {
    fontWeight: '700',
    marginBottom: 32,
  },
  form: {
    gap: 4,
  },
});
