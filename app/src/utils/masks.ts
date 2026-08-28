/**
 * Utilitários de máscara e conversão de campos de formulário.
 */

/** Mantém apenas os dígitos de uma string. */
export const onlyDigits = (value: string) => value.replace(/\D/g, '');

/**
 * Máscara de telefone brasileiro.
 * Celular: (99) 99999-9999 | Fixo: (99) 9999-9999
 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length < 3) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  // 8 dígitos (fixo) -> 4+4 | 9 dígitos (celular) -> 5+4
  const splitAt = rest.length <= 8 ? 4 : 5;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

/**
 * Máscara de data no formato DD/MM/AAAA a partir do que o usuário digita.
 */
export function maskDate(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  const parts: string[] = [];

  parts.push(digits.slice(0, 2));
  if (digits.length >= 3) parts.push(digits.slice(2, 4));
  if (digits.length >= 5) parts.push(digits.slice(4, 8));

  return parts.filter(Boolean).join('/');
}

/**
 * Converte uma data BR (DD/MM/AAAA) para ISO (AAAA-MM-DD).
 * Retorna null quando a data está incompleta ou inválida.
 */
export function isoFromBrDate(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return null;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Valida se a data existe de fato (ex.: 31/02).
  const parsed = new Date(`${iso}T12:00:00`);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return iso;
}

/** Converte ISO (AAAA-MM-DD) para data BR (DD/MM/AAAA). */
export function brDateFromIso(value: string | null | undefined): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}
