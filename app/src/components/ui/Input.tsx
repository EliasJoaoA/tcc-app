import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, secureTextEntry, ...props }: InputProps) {
  const { colors, fontSize } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const isPassword = !!secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && hidden}
          style={[
            styles.input,
            isPassword && styles.inputWithIcon,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: error ? colors.error : focused ? colors.primary : colors.border,
              fontSize: fontSize.base,
            },
          ]}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={8}
          >
            <FontAwesome
              name={hidden ? 'eye' : 'eye-slash'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error, fontSize: fontSize.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 48,
  },
  inputWithIcon: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    height: 48,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: 4,
  },
});
