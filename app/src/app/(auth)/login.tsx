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
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen() {
  const { colors, fontSize } = useTheme();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Erro ao fazer login.';
      Alert.alert('Erro', msg);
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
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.primary, fontSize: fontSize['3xl'] }]}
            accessibilityRole="header"
          >
            Conecta UEPG
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.base }]}>
            Inclusiva
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Campo de e-mail"
          />
          <Input
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            accessibilityLabel="Campo de senha"
          />
          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            accessibilityLabel="Botão de entrar"
          />
        </View>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/(auth)/forgot-password')} accessibilityRole="link">
            <Text style={[styles.link, { color: colors.primary, fontSize: fontSize.sm }]}>
              Esqueci minha senha
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="link">
            <Text style={[styles.link, { color: colors.primary, fontSize: fontSize.sm }]}>
              Criar conta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
  form: {
    gap: 4,
  },
  links: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  link: {
    fontWeight: '500',
  },
});
