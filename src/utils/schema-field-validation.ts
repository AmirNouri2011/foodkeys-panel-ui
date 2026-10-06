import type { FieldType } from './schema-converter';
import { isValidEmail, validationMessages } from './form-validators';

export const normalizePhoneNumber = (value: string, maxLength = 11) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
    .slice(0, maxLength);

export function normalizeSchemaArrayInput(field: FieldType, value: string): string {
  if (isLandlineSchemaField(field) || field.itemType === 'tel') {
    return normalizePhoneNumber(value, field.itemMaxLength ?? 11);
  }
  return field.itemMaxLength === undefined
    ? value
    : value.slice(0, field.itemMaxLength);
}

export function isLandlineSchemaField(field: FieldType): boolean {
  return (
    /تلفن.*ثابت|فکس|landline|fax/i.test(field.label || '') ||
    /(?:^|\.)(?:tel|fax)$/.test(field.name) ||
    (field.itemPattern || field.pattern) === '^0[1-9][0-9]{9}$'
  );
}

export function validateSchemaArrayItem(
  field: FieldType,
  value: string
): true | string {
  const input = value.trim();
  if (field.itemType === 'email' && !isValidEmail(input)) {
    return 'لطفاً نشانی ایمیل معتبر وارد کنید';
  }
  const isLandline = isLandlineSchemaField(field);
  const phoneMessage = isLandline
    ? validationMessages.landlinePhone
    : field.itemType === 'tel'
    ? validationMessages.mobilePhone
    : undefined;

  // An explicit schema pattern takes priority over the default phone rule.
  if (!field.itemPattern && field.itemType === 'tel') {
    const pattern = isLandline ? /^0[1-9][0-9]{9}$/ : /^09\d{9}$/;
    if (!pattern.test(input)) return phoneMessage!;
  }
  if (field.itemMinLength !== undefined && input.length < field.itemMinLength) {
    return phoneMessage || `حداقل ${field.itemMinLength} کاراکتر وارد کنید`;
  }
  if (field.itemMaxLength !== undefined && input.length > field.itemMaxLength) {
    return phoneMessage || `حداکثر ${field.itemMaxLength} کاراکتر مجاز است`;
  }
  if (field.itemPattern && !new RegExp(field.itemPattern).test(input)) {
    return phoneMessage || field.validationMessage || validationMessages.invalidFormat;
  }
  return true;
}
