import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import api, { API_BASE_URL } from './api';
import { tokenStorage } from './token-storage';

export interface Event {
  id: number;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  color: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
}

export interface ImportedScheduleEvent {
  title: string;
  code: string;
  location: string;
  day_of_week: number;
  day_label: string;
  start_time: string;
  end_time: string;
  selected?: boolean;
}

export interface ScheduleImportPreview {
  metadata: {
    student_name: string;
    course: string;
    registration: string | null;
    issued_at: string;
    semester: string | null;
  };
  events: ImportedScheduleEvent[];
}

export const eventsService = {
  list: (date?: string) =>
    api.get<{ data: Event[] }>('/events', { params: date ? { date } : undefined }),

  create: (data: Partial<Event>) =>
    api.post<{ data: Event }>('/events', data),

  get: (id: number) =>
    api.get<{ data: Event }>(`/events/${id}`),

  update: (id: number, data: Partial<Event>) =>
    api.put<{ data: Event }>(`/events/${id}`, data),

  delete: (id: number) =>
    api.delete(`/events/${id}`),

  export: () =>
    api.get('/events/export', { responseType: 'blob' }),

  previewPdfImport: (
    uri: string,
    name = 'horario.pdf',
    mimeType = 'application/pdf',
    webFile?: File,
  ) => {
    if (Platform.OS !== 'web') {
      return (async () => {
        const token = await tokenStorage.get();
        const result = await FileSystem.uploadAsync(
          `${API_BASE_URL}/api/v1/events/import-pdf/preview`,
          uri,
          {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'pdf',
            mimeType,
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        let payload: { data?: ScheduleImportPreview; message?: string; errors?: Record<string, string[]> };
        try {
          payload = JSON.parse(result.body);
        } catch {
          payload = { message: 'A API retornou uma resposta inválida.' };
        }

        if (result.status < 200 || result.status >= 300) {
          const error = Object.assign(new Error(payload.message || `Erro HTTP ${result.status}`), {
            isAxiosError: true,
            response: { status: result.status, data: payload },
          });
          throw error;
        }

        return { data: payload as { data: ScheduleImportPreview } };
      })();
    }

    const formData = new FormData();
    if (webFile) {
      formData.append('pdf', webFile, name);
    } else {
      formData.append('pdf', { uri, name, type: mimeType } as any);
    }

    // Let Axios create the multipart boundary. Setting it manually makes the
    // browser send an empty file to Laravel.
    return api.post<{ data: ScheduleImportPreview }>('/events/import-pdf/preview', formData);
  },

  confirmPdfImport: (startDate: string, events: ImportedScheduleEvent[]) =>
    api.post<{ data: Event[]; message: string }>('/events/import-pdf/confirm', {
      start_date: startDate,
      events,
    }),

  clearSchedule: () =>
    api.delete<{ data: { deleted: number }; message: string }>('/events/schedule'),
};
