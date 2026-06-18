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
import { authService } from '../../services/auth.service';

export default function ForgotPasswordScreen() {
  const { colors, fontSize } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Informe seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Erro ao enviar e-mail.';
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
        <Pressable onPress={() => router.back()} accessibilityLabel="Voltar">
          <Text style={[styles.back, { color: colors.primary, fontSize: fontSize.base }]}>
            ← Voltar
          </Text>
        </Pressable>

        <Text
          style={[styles.title, { color: colors.text, fontSize: fontSize['2xl'] }]}
          accessibilityRole="header"
        >
          Recuperar Senha
        </Text>

        {sent ? (
          <View style={styles.sentContainer}>
            <Text style={[styles.sentText, { color: colors.success, fontSize: fontSize.lg }]}>
              E-mail enviado!
            </Text>
            <Text style={[{ color: colors.textSecondary, fontSize: fontSize.base }]}>
              Verifique sua caixa de entrada para redefinir a senha.
            </Text>
            <Button
              title="Voltar ao login"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              style={{ marginTop: 24 }}
              accessibilityLabel="Voltar ao login"
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }]}>
              Informe o e-mail cadastrado para receber as instruções de recuperação.
            </Text>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Campo de e-mail"
            />
            <Button
              title="Enviar"
              onPress={handleSend}
              loading={loading}
              accessibilityLabel="Botão de enviar e-mail de recuperação"
            />
          </View>
        )}
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
    marginBottom: 16,
  },
  form: {
    gap: 4,
  },
  sentContainer: {
    marginTop: 24,
  },
  sentText: {
    fontWeight: '600',
    marginBottom: 8,
  },
});
