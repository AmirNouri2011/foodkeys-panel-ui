import { z } from 'zod';

export const validationMessages = {
  required: 'این فیلد اجباری میباشد',
  email: 'آدرس ایمیل اشتباه میباشد',
  mobilePhone: 'شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود',
  landlinePhone: 'شماره تلفن یا فکس باید با صفر شروع شود و دقیقاً ۱۱ رقم باشد',
  website: 'آدرس وبسایت باید معتبر و با https:// شروع شود',
  postalCode: 'کد پستی باید ۱۰ رقم باشد',
  digitsOnly: 'فقط عدد وارد کنید',
  productName: 'نام محصول الزامی است',
  productCategory: 'دسته‌بندی محصول الزامی است',
  serviceName: 'نام خدمت الزامی است',
  invalidFormat: 'فرمت وارد شده صحیح نیست',
};

export const MOBILE_PHONE_REGEX = /^09\d{9}$/;
export const LANDLINE_PHONE_REGEX = /^0\d{10}$/;
export const POSTAL_CODE_REGEX = /^\d{10}$/;
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

export function isValidMobilePhone(value: string): boolean {
  return MOBILE_PHONE_REGEX.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidWebsite(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith('https://')) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' && Boolean(url.hostname) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isValidLandline(value: string): boolean {
  return LANDLINE_PHONE_REGEX.test(value.trim());
}

export function isValidPostalCode(value: string): boolean {
  return POSTAL_CODE_REGEX.test(value.trim());
}

export const requiredStringSchema = () =>
  z.string().trim().min(1, { message: validationMessages.required });

export const optionalDigitsSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || /^\d+$/.test(String(val).trim()),
    { message: validationMessages.digitsOnly }
  );

export const optionalNumberSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || /^\d+(?:\.\d+)?$/.test(String(val).trim()),
    { message: 'مقدار باید عدد باشد' }
  );

export const optionalMobilePhoneSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || isValidMobilePhone(String(val)),
    { message: validationMessages.mobilePhone }
  );

export const requiredMobilePhoneSchema = () =>
  z
    .string()
    .min(1, { message: validationMessages.required })
    .refine((val) => isValidMobilePhone(val), {
      message: validationMessages.mobilePhone,
    });

export const optionalEmailSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || isValidEmail(String(val)),
    { message: validationMessages.email }
  );

export const optionalWebsiteSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || isValidWebsite(String(val)),
    { message: validationMessages.website }
  );

export const optionalLandlineSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || isValidLandline(String(val)),
    { message: validationMessages.landlinePhone }
  );

export const requiredLandlineSchema = () =>
  z
    .string()
    .min(1, { message: validationMessages.required })
    .refine((val) => isValidLandline(val), {
      message: validationMessages.landlinePhone,
    });

export const optionalPostalCodeSchema = () =>
  z.string().refine(
    (val) => isEmptyValue(val) || isValidPostalCode(String(val)),
    { message: validationMessages.postalCode }
  );

export const optionalEmailArraySchema = () =>
  z.array(optionalEmailSchema()).optional();

type RhfRule = Record<string, unknown>;

export function getRhfMobilePhoneRules(required = false): RhfRule {
  const rules: RhfRule = {
    validate: (value: string) => {
      if (isEmptyValue(value)) {
        return required ? validationMessages.required : true;
      }
      return isValidMobilePhone(String(value)) || validationMessages.mobilePhone;
    },
  };

  if (required) {
    rules.required = validationMessages.required;
  }

  return rules;
}

export function getRhfEmailRules(required = false): RhfRule {
  const rules: RhfRule = {
    validate: (value: string) => {
      if (isEmptyValue(value)) {
        return required ? validationMessages.required : true;
      }
      return isValidEmail(String(value)) || validationMessages.email;
    },
  };

  if (required) {
    rules.required = validationMessages.required;
  }

  return rules;
}

export function getRhfWebsiteRules(required = false): RhfRule {
  const rules: RhfRule = {
    validate: (value: string) => {
      if (isEmptyValue(value)) {
        return required ? validationMessages.required : true;
      }
      return isValidWebsite(String(value)) || validationMessages.website;
    },
  };

  if (required) {
    rules.required = validationMessages.required;
  }

  return rules;
}

export function getRhfLandlineRules(required = false): RhfRule {
  const rules: RhfRule = {
    validate: (value: string) => {
      if (isEmptyValue(value)) {
        return required ? validationMessages.required : true;
      }
      return isValidLandline(String(value)) || validationMessages.landlinePhone;
    },
  };

  if (required) {
    rules.required = validationMessages.required;
  }

  return rules;
}
