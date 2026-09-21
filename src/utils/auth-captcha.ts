import axiosInstance from '@/utils/axios-instance';

export const CAPTCHA_ERROR = {
  REQUIRED: 'CAPTCHA_REQUIRED_ERROR',
  INVALID: 'INVALID_CAPTCHA_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED_ERROR',
} as const;

export type CaptchaAction = 'LOGIN' | 'SIGNUP' | 'SEND_OTP' | 'FORGOT_PASSWORD';

export type CaptchaChallenge = {
  token: string;
  image: string;
};

export type CaptchaPayload = {
  captchaToken?: string;
  captchaAnswer?: string;
};

export type AuthActionErrorMeta = {
  captchaRequired?: boolean;
  errorType?: string;
  retryAfterSeconds?: number;
  message?: string;
};

export function toCaptchaImageSrc(image: string) {
  if (!image) return '';
  if (image.startsWith('data:')) return image;
  return `data:image/png;base64,${image}`;
}

export async function fetchCaptchaChallenge(): Promise<CaptchaChallenge> {
  const response = await axiosInstance.get('/auth/captcha');
  const data = response.data?.data ?? response.data;
  const token = data?.token ?? '';
  const image = data?.image ?? '';

  if (!token || !image) {
    throw new Error('Captcha response is missing its token or image');
  }

  return { token, image };
}

export async function checkCaptchaRequired(
  action: CaptchaAction,
  identity: string
): Promise<boolean> {
  if (!identity) return false;
  try {
    const response = await axiosInstance.get('/auth/captcha/status', {
      params: { action, identity },
    });
    return Boolean(response.data?.data?.captchaRequired);
  } catch {
    return false;
  }
}

export function getErrorItems(error: any): Array<{
  type?: string;
  formikField?: string;
  message?: string;
}> {
  return error?.response?.data?.error ?? [];
}

export function getErrorType(error: any): string | undefined {
  const items = getErrorItems(error);
  const typed = items.find((item) => item?.type);
  return (
    typed?.type ||
    error?.response?.data?.statusCode ||
    error?.response?.data?.errorType
  );
}

export function extractAuthErrorMeta(error: any): AuthActionErrorMeta {
  const data = error?.response?.data;
  const items = getErrorItems(error);
  const statusCode = data?.statusCode;
  const statusCodeAsType =
    typeof statusCode === 'string' ? statusCode : undefined;
  const httpStatus = error?.response?.status;
  const errorType =
    items.find((item) => item?.type)?.type ||
    statusCodeAsType ||
    (httpStatus === 429 ? CAPTCHA_ERROR.RATE_LIMIT : undefined);

  const captchaRequired =
    Boolean(data?.data?.captchaRequired) ||
    errorType === CAPTCHA_ERROR.REQUIRED ||
    items.some(
      (item) =>
        item?.type === CAPTCHA_ERROR.REQUIRED ||
        item?.formikField === 'captchaAnswer' ||
        item?.formikField === 'captchaToken'
    );

  const retryAfterSeconds =
    data?.data?.retryAfterSeconds ??
    (typeof data?.retryAfterSeconds === 'number'
      ? data.retryAfterSeconds
      : undefined);

  let message = data?.message as string | undefined;
  if (errorType === CAPTCHA_ERROR.INVALID) {
    message = 'کپچا نامعتبر';
  } else if (errorType === CAPTCHA_ERROR.RATE_LIMIT || httpStatus === 429) {
    message = retryAfterSeconds
      ? `تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${retryAfterSeconds} ثانیه صبر کنید`
      : 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید';
  } else if (
    errorType === CAPTCHA_ERROR.AUTH &&
    (!message || message === 'Unauthorized')
  ) {
    message = 'نام کاربری یا رمزعبور اشتباه است';
  }

  return {
    captchaRequired,
    errorType:
      typeof errorType === 'string' ? errorType : String(errorType ?? ''),
    retryAfterSeconds,
    message,
  };
}

export function withCaptchaPayload<T extends Record<string, unknown>>(
  body: T,
  captcha?: CaptchaPayload | null
): T & CaptchaPayload {
  if (!captcha?.captchaToken) return body;
  return {
    ...body,
    captchaToken: captcha.captchaToken,
    captchaAnswer: captcha.captchaAnswer ?? '',
  };
}
