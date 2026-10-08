import type { FieldType } from './schema-converter';

export function hasNumericLengthConstraint(field: FieldType): boolean {
  return field.minLength !== undefined || field.maxLength !== undefined;
}

// Keep the editing value as text so length checks also cover leading zeroes.
export function editNumericDigits(raw: string, previous: unknown, maxLength?: number): string {
  const normalized = raw
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
  if (!/^\d*$/.test(normalized)) return String(previous ?? '');
  return maxLength === undefined ? normalized : normalized.slice(0, maxLength);
}

export function validateNumericText(value: unknown, field: FieldType): true | string {
  if (value === '' || value === undefined || value === null) return true;
  const text = String(value);
  if (hasNumericLengthConstraint(field) && !/^\d+$/.test(text)) {
    return 'فقط رقم وارد کنید';
  }
  if (field.minLength !== undefined && text.length < field.minLength) {
    return `حداقل ${field.minLength} رقم وارد کنید`;
  }
  if (field.maxLength !== undefined && text.length > field.maxLength) {
    return `حداکثر ${field.maxLength} رقم مجاز است`;
  }
  if (field.pattern && !new RegExp(field.pattern).test(text)) {
    return 'فرمت وارد شده صحیح نیست';
  }
  return true;
}
