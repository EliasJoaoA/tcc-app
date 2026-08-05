import api from './api';

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
