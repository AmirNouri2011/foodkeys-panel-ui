'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Password } from '@/components/ui/password';
import { PinCode } from '@/components/ui/pin-code';
import CaptchaField from '@/components/auth/captcha-field';
import { useAuth } from '@/context/AuthContext';
import { useCaptcha } from '@/hooks/use-captcha';
import { CAPTCHA_ERROR } from '@/utils/auth-captcha';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Modal } from 'rizzui';
import toast from 'react-hot-toast';
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiCheckBold,
  PiClockCountdownBold,
  PiXBold,
} from 'react-icons/pi';
import * as z from 'zod';

type VerifyFormValues = { otp: string };
type OtpFormValues = { phoneNumber: string };
type FormValues = { password: string; confirmPassword: string };

const OTP_VALIDITY_MS = 5 * 60 * 1000;
const otpFormSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
});
const verifyFormSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'کد یکبارمصرف باید ۶ رقم باشد'),
});
const passwordSchema = z
  .string()
  .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
  .max(32, 'رمز عبور باید حداکثر ۳۲ کاراکتر باشد')
  .regex(/[A-Z]/, 'حداقل یک حرف بزرگ لازم است')
  .regex(/[a-z]/, 'حداقل یک حرف کوچک لازم است')
  .regex(/\d/, 'حداقل یک عدد لازم است')
  .regex(/[^A-Za-z0-9]/, 'حداقل یک علامت لازم است');
const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن باید یکسان باشند',
    path: ['confirmPassword'],
  });
const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;

export default function ForgetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState<'INITIAL' | 'OTP' | 'UPDATE'>('INITIAL');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(120);
  const [resendMode, setResendMode] = useState(false);
  const [expirationModalOpen, setExpirationModalOpen] = useState(false);
  const [otpFormVersion, setOtpFormVersion] = useState(0);
  const pinCodeRef = useRef<HTMLDivElement>(null);
  const resendCaptchaRef = useRef<HTMLDivElement>(null);
  const resendPreparationRef = useRef(false);
  const { forgotPassword, forgotPasswordOtp, forgotPasswordVerify } = useAuth();
  const captcha = useCaptcha({ autoFetch: step === 'INITIAL' });

  useEffect(() => {
    if (step !== 'OTP' || resendMode) return;
    const frame = requestAnimationFrame(() => {
      pinCodeRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [step, resendMode, otpFormVersion]);

  useEffect(() => {
    if (step !== 'OTP' || !otpExpiresAt) return;
    const sync = () => {
      const remaining = Math.max(
        0,
        Math.ceil((otpExpiresAt - Date.now()) / 1000)
      );
      setOtpSecondsRemaining(remaining);
      if (remaining === 0) setExpirationModalOpen(true);
    };
    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [step, otpExpiresAt]);

  useEffect(() => {
    if (step !== 'OTP' || resendSeconds === 0) return;
    const interval = setInterval(
      () => setResendSeconds((seconds) => Math.max(0, seconds - 1)),
      1000
    );
    return () => clearInterval(interval);
  }, [step, resendSeconds]);

  const startOtpTimer = () => {
    setOtpExpiresAt(Date.now() + OTP_VALIDITY_MS);
    setOtpSecondsRemaining(OTP_VALIDITY_MS / 1000);
    setResendSeconds(120);
    setResendMode(false);
    setOtpFormVersion((version) => version + 1);
  };

  const focusCaptcha = () => {
    setTimeout(
      () =>
        resendCaptchaRef.current
          ?.querySelector<HTMLInputElement>('input')
          ?.focus(),
      100
    );
  };

  const handleCaptchaFailure = async (result?: {
    errorType?: string;
    captchaRequired?: boolean;
  }) => {
    await captcha.refresh();
    if (result?.errorType === CAPTCHA_ERROR.INVALID)
      captcha.setError('کپچا نامعتبر است');
  };

  const onOtpSubmit: SubmitHandler<OtpFormValues> = async ({
    phoneNumber: phone,
  }) => {
    if (!captcha.answer.trim()) {
      captcha.setError('کد کپچا الزامی است');
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPasswordOtp(phone, captcha.getPayload());
      if (result?.success) {
        setPhoneNumber(phone);
        setResetToken('');
        startOtpTimer();
        captcha.clearAnswer();
        setStep('OTP');
      } else {
        await handleCaptchaFailure(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit: SubmitHandler<VerifyFormValues> = async ({ otp }) => {
    if (!otpExpiresAt || Date.now() >= otpExpiresAt) {
      setExpirationModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const token = await forgotPasswordVerify(otp, phoneNumber);
      if (token) {
        setResetToken(token);
        setStep('UPDATE');
      }
    } finally {
      setLoading(false);
    }
  };

  const startResend = async () => {
    if (resendSeconds || loading || resendPreparationRef.current) return;
    resendPreparationRef.current = true;
    setResendMode(true);
    try {
      if (await captcha.refresh()) focusCaptcha();
    } finally {
      resendPreparationRef.current = false;
    }
  };

  const onResendOtp = async () => {
    if (!phoneNumber || loading) return;
    if (!captcha.answer.trim()) {
      captcha.setError('کد کپچا الزامی است');
      focusCaptcha();
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPasswordOtp(phoneNumber, captcha.getPayload());
      if (result?.success) {
        setResetToken('');
        captcha.clearAnswer();
        startOtpTimer();
      } else {
        await handleCaptchaFailure(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const returnToStart = () => {
    setExpirationModalOpen(false);
    setStep('INITIAL');
    setResetToken('');
    setOtpExpiresAt(0);
    setOtpSecondsRemaining(0);
    setResendSeconds(120);
    setResendMode(false);
    captcha.clearAnswer();
  };

  const onSubmit: SubmitHandler<FormValues> = async ({ password }) => {
    if (!resetToken) {
      toast.error('توکن بازنشانی رمز عبور موجود نیست؛ لطفاً دوباره کد بگیرید');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(password, phoneNumber, resetToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 'OTP' ? (
        <>
          <p className="mb-4 text-center text-sm leading-7 text-gray-600 lg:text-start">
            {resendMode
              ? 'برای دریافت کد جدید، کپچا را وارد کنید.'
              : `کد یکبارمصرف به شماره ${phoneNumber} ارسال شد.`}
          </p>
          <Form<VerifyFormValues>
            key={otpFormVersion}
            validationSchema={verifyFormSchema}
            onSubmit={onVerifySubmit}
          >
            {({ setValue, formState: { errors } }) => (
              <div dir="rtl" className="space-y-5">
                {!resendMode && (
                  <>
                    <div className="border-[#129974]/15 flex items-center justify-between rounded-lg border bg-[#f4fbf8] px-3 py-2 text-xs text-gray-600">
                      <span>زمان باقی‌مانده برای واردکردن کد</span>
                      <span
                        dir="ltr"
                        className="font-mono text-sm font-bold text-[#0d765a]"
                      >
                        {formatTime(otpSecondsRemaining)}
                      </span>
                    </div>
                    <div
                      ref={pinCodeRef}
                      dir="ltr"
                      className="flex justify-center"
                    >
                      <PinCode
                        variant="outline"
                        length={6}
                        setValue={(value) => setValue('otp', String(value))}
                        size="lg"
                        color="success"
                        className="w-full justify-center ![direction:ltr]"
                        inputClassName="text-center ![direction:ltr]"
                        error={errors.otp?.message}
                      />
                    </div>
                  </>
                )}
                {resendMode && (
                  <div
                    ref={resendCaptchaRef}
                    className="animate-popup rounded-xl border border-[#129974]/10 bg-[#f8fcfa] p-3"
                  >
                    <CaptchaField
                      imageSrc={captcha.imageSrc}
                      answer={captcha.answer}
                      onAnswerChange={(value) => {
                        captcha.setAnswer(value);
                        captcha.setError(undefined);
                      }}
                      onRefresh={captcha.refresh}
                      loading={captcha.loading}
                      error={captcha.error}
                      loadError={captcha.loadError}
                      color="success"
                      compact
                      inline
                    />
                  </div>
                )}
                {resendMode ? (
                  <Button
                    type="button"
                    onClick={onResendOtp}
                    isLoading={loading}
                    className="h-11 w-full bg-[#129974] font-semibold"
                    color="success"
                  >
                    ارسال کد جدید
                  </Button>
                ) : (
                  <Button
                    isLoading={loading}
                    className="h-11 w-full bg-[#129974] font-semibold"
                    type="submit"
                    color="success"
                  >
                    <span>تأیید کد و ادامه</span>
                    <PiArrowLeftBold className="ms-2 h-5 w-5" />
                  </Button>
                )}
                <div className="text-center">
                  {resendMode ? null : resendSeconds === 0 ? (
                    <button
                      type="button"
                      onClick={startResend}
                      className="text-sm font-semibold text-[#0d765a] underline decoration-2 underline-offset-4 hover:text-[#095a45]"
                    >
                      ارسال مجدد کد یکبارمصرف
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      ارسال مجدد در{' '}
                      <span
                        dir="ltr"
                        className="inline-block font-mono font-bold"
                      >
                        {formatTime(resendSeconds)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </Form>
        </>
      ) : step === 'UPDATE' ? (
        <Form<FormValues>
          validationSchema={formSchema}
          onSubmit={onSubmit}
          className="pt-1.5"
          useFormProps={{
            defaultValues: { password: '', confirmPassword: '' },
            mode: 'onChange',
            reValidateMode: 'onChange',
          }}
        >
          {({ register, watch, formState: { errors, isValid } }) => {
            const password = watch('password') || '';
            const confirmPassword = watch('confirmPassword') || '';
            const passwordRules = [
              {
                label: 'بین ۸ تا ۳۲ کاراکتر',
                valid: password.length >= 8 && password.length <= 32,
              },
              {
                label: 'حرف کوچک و بزرگ',
                valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
              },
              { label: 'حداقل یک عدد', valid: /\d/.test(password) },
              { label: 'حداقل یک علامت', valid: /[^A-Za-z0-9]/.test(password) },
              {
                label: 'تکرار رمز عبور یکسان است',
                valid:
                  confirmPassword.length > 0 && password === confirmPassword,
              },
            ];

            return (
              <div className="space-y-4">
                <Password
                  label="رمز عبور جدید"
                  placeholder="رمز عبور جدید را وارد کنید"
                  size="lg"
                  color="success"
                  inputClassName="h-11 text-sm"
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Password
                  label="تکرار رمز عبور"
                  placeholder="رمز عبور را دوباره وارد کنید"
                  size="lg"
                  color="success"
                  inputClassName="h-11 text-sm"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <div className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2 text-[11px] leading-4">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-1.5 transition-colors ${
                        rule.valid
                          ? 'font-semibold text-[#129974]'
                          : 'text-gray-400'
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                          rule.valid
                            ? 'border-[#129974] bg-[#129974] text-white'
                            : 'border-gray-300 bg-white text-transparent'
                        }`}
                      >
                        <PiCheckBold className="h-2.5 w-2.5" />
                      </span>
                      {rule.label}
                    </div>
                  ))}
                </div>
                <Button
                  className="h-11 w-full bg-[#129974] font-semibold"
                  type="submit"
                  color="success"
                  isLoading={loading}
                  disabled={!isValid || loading}
                >
                  ذخیره رمز عبور جدید
                </Button>
              </div>
            );
          }}
        </Form>
      ) : (
        <Form<OtpFormValues>
          validationSchema={otpFormSchema}
          onSubmit={onOtpSubmit}
          className="pt-1.5"
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-4">
              <Input
                type="tel"
                dir="ltr"
                size="lg"
                label="شماره موبایل"
                placeholder="09 *********"
                color="success"
                inputClassName="h-11 text-left text-sm tracking-wide"
                inputMode="numeric"
                autoComplete="username"
                maxLength={11}
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
              <CaptchaField
                imageSrc={captcha.imageSrc}
                answer={captcha.answer}
                onAnswerChange={(value) => {
                  captcha.setAnswer(value);
                  captcha.setError(undefined);
                }}
                onRefresh={captcha.refresh}
                loading={captcha.loading}
                error={captcha.error}
                loadError={captcha.loadError}
                color="success"
                compact
                inline
              />
              <Button
                className="h-11 w-full bg-[#129974] font-semibold"
                type="submit"
                color="success"
                isLoading={loading}
              >
                دریافت کد بازیابی
              </Button>
            </div>
          )}
        </Form>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4 text-center">
        <p className="text-sm leading-6 text-gray-500">
          نمی‌خواهید رمز عبور را بازنشانی کنید؟
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-[#0d765a] transition-colors hover:bg-[#edf8f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#129974]"
        >
          <PiArrowRightBold className="h-4 w-4" />
          بازگشت به صفحه ورود
        </Link>
      </div>

      <Modal
        isOpen={expirationModalOpen}
        onClose={returnToStart}
        className="flex items-center justify-center p-4"
        backdropClassName="bg-gray-900/55 backdrop-blur-sm"
      >
        <div
          dir="rtl"
          role="button"
          tabIndex={0}
          onClick={returnToStart}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') returnToStart();
          }}
          className="w-full max-w-sm cursor-pointer rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <div className="mb-2 flex justify-end">
            <PiXBold className="h-5 w-5 text-gray-500" />
          </div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-lighter text-orange-dark">
            <PiClockCountdownBold className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-black text-gray-900">
            کد یکبارمصرف منقضی شد
          </h3>
          <p className="text-sm leading-7 text-gray-500">
            بیشتر از ۵ دقیقه از دریافت کد گذشته است. لطفاً دوباره شروع کنید.
          </p>
        </div>
      </Modal>
    </>
  );
}
