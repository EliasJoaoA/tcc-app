import axios from 'axios';

type ValidationErrors = Record<string, string[] | string>;

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  if (!error.response) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const details = [error.code, error.message]
      .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
      .join(' - ');

    return apiUrl
      ? `Não foi possível conectar à API (${apiUrl}). ${details ? `Detalhe: ${details}. ` : ''}Verifique sua internet e tente novamente.`
      : `Não foi possível conectar ao servidor. ${details ? `Detalhe: ${details}. ` : ''}Verifique sua internet e tente novamente.`;
  }

  const data = error.response.data as { message?: string; errors?: ValidationErrors } | undefined;
  const validationMessage = data?.errors
    ? Object.values(data.errors).flat().find((message) => typeof message === 'string')
    : undefined;

  return validationMessage || data?.message || fallback;
}
