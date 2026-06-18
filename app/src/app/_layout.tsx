import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { usePreferencesStore } from '../store/preferences.store';

export default function RootLayout() {
  const { loadToken, isLoading, user } = useAuthStore();
  const { setPreferences } = usePreferencesStore();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
