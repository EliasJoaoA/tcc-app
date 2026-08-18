import axios from 'axios';
import { tokenStorage } from './token-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    // The browser/React Native transport must generate the multipart boundary.
    // Keeping the instance default (`application/json`) turns uploaded files
    // into regular fields and Laravel rejects them with "must be a file".
    config.headers.delete('Content-Type');
  }

  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.remove();
    }
    return Promise.reject(error);
  },
);

export default api;
