import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

function browserStorage(): Storage | null {
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
    ? (globalThis as typeof globalThis & { localStorage: Storage }).localStorage
    : null;
}

export const tokenStorage = {
  get: async () => {
    if (Platform.OS === 'web') return browserStorage()?.getItem(TOKEN_KEY) ?? null;
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  set: async (token: string) => {
    if (Platform.OS === 'web') {
      browserStorage()?.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  remove: async () => {
    if (Platform.OS === 'web') {
      browserStorage()?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
