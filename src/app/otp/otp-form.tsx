'use client';

import { PinCode } from '@/components/ui/pin-code';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { SubmitHandler } from 'react-hook-form';
import {
  PiArrowLeftBold,
  PiClockCountdownBold,
  PiXBold,
} from 'react-icons/pi';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { SEND_OTP_SCENARIOS } from '@/core/dto/enums/send-otp-scenarios';
import CaptchaField from '@/components/auth/captcha-field';
import { useCaptcha } from '@/hooks/use-captcha';
import { CAPTCHA_ERROR } from '@/utils/auth-captcha';
import { useDispatch } from 'react-redux';
import { login as reduxLogin } from '@/store/userSlice';
import * as z from 'zod';
import { Modal } from 'rizzui';
import { ActionIcon } from '@/components/ui/action-icon';

const OTP_VALIDITY_MS = 5 * 60 * 1000;

type FormValues = {
  phoneNumber: string;
  otp: string;
};

type SendOtpFormValues = {
  phoneNumber: string;
};

const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
});

const verifyOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'کد یکبارمصرف باید ۶ رقم باشد'),
  phoneNumber: z.string().optional(),
});

export default function OtpForm({
  setStep,
  setPhoneNumber: setParentPhoneNumber,
  setRegistrationToken,
  initialPhoneNumber = '',
}: {
  setStep: (step: 'INITIAL' | 'PASSWORD' | 'SIGNUP') => void;
  setPhoneNumber?: (phoneNumber: string) => void;
  setRegistrationToken?: (token: string) => void;
  initialPhoneNumber?: string;
}) {
  // @ts-ignore
  const { loginOtp, requestOtp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setOtpSent] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);
  const [expirationModalOpen, setExpirationModalOpen] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [otpFormVersion, setOtpFormVersion] = useState(0);

  const captcha = useCaptcha({ autoFetch: !isOtpSent });
  const reduxDispatch = useDispatch();

  /*
   * Wrapper around RizzUI PinCode.
   *
   * We intentionally don't use autoFocus on PinCode because RizzUI
   * forwards input props to its generated PIN inputs.
   */
  const pinCodeRef = useRef<HTMLDivElement>(null);
  const resendCaptchaRef = useRef<HTMLDivElement>(null);
  const resendPreparationRef = useRef(false);

  /*
   * When OTP screen is rendered, manually focus the FIRST input.
   */
  useEffect(() => {
    if (!isOtpSent) return;

    const frame = requestAnimationFrame(() => {
      const firstInput =
        pinCodeRef.current?.querySelector<HTMLInputElement>('input');

      firstInput?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOtpSent, otpFormVersion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (resendTimer > 0 && isOtpSent) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, isOtpSent]);

  useEffect(() => {
    if (!isOtpSent || !otpExpiresAt) return;

    let interval: NodeJS.Timeout | undefined;

    const syncOtpTimer = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((otpExpiresAt - Date.now()) / 1000)
      );

      setOtpSecondsRemaining(remainingSeconds);

      if (remainingSeconds === 0) {
        if (interval) clearInterval(interval);
        setExpirationModalOpen(true);
      }
    };

    syncOtpTimer();
    if (otpExpiresAt > Date.now()) {
      interval = setInterval(syncOtpTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpSent, otpExpiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleCaptchaFailure = async (result?: {
    errorType?: string;
    captchaRequired?: boolean;
  }) => {
    if (result?.errorType === CAPTCHA_ERROR.INVALID) {
      captcha.setError('کپچا نامعتبر');
    } else if (
      result?.errorType === CAPTCHA_ERROR.REQUIRED ||
      result?.captchaRequired
    ) {
      captcha.setError(undefined);
    }

    await captcha.refresh();
  };

  const handleResendOtp = async () => {
    if (!canResend || !isResendMode || isResending) return;

    if (!captcha.answer.trim()) {
      captcha.setError('کد کپچا الزامی است');
      focusResendCaptcha();
      return;
    }

    setIsResending(true);

    try {
      const result = await requestOtp(phoneNumber, captcha.getPayload());

      if (result?.success) {
        setResendTimer(120);
        setCanResend(false);
        setOtpExpiresAt(Date.now() + OTP_VALIDITY_MS);
        setOtpSecondsRemaining(OTP_VALIDITY_MS / 1000);
        captcha.clearAnswer();
        setIsResendMode(false);
        setOtpFormVersion((version) => version + 1);

        toast.success('رمز یکبار مصرف مجددا ارسال شد');
      } else {
        await handleCaptchaFailure(result || {});

        if (!result?.message) {
          toast.error('خطا در ارسال مجدد رمز یکبار مصرف');
        }
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);

      toast.error('خطا در ارسال مجدد رمز یکبار مصرف');
      await captcha.refresh();
    } finally {
      setIsResending(false);
    }
  };

  const handleStartResend = async () => {
    if (!canResend || isResending || resendPreparationRef.current) return;

    resendPreparationRef.current = true;
    setIsResendMode(true);
    captcha.setError(undefined);
    try {
      const loaded = await captcha.refresh();
      if (loaded && Date.now() < otpExpiresAt) {
        focusResendCaptcha();
      }
    } finally {
      resendPreparationRef.current = false;
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log(phoneNumber);

    if (!otpExpiresAt || Date.now() >= otpExpiresAt) {
      setExpirationModalOpen(true);
      return;
    }

    setLoading(true);

    const otpCode = data.otp;

    if (otpCode.length === 6) {
      setLoading(true);

      try {
        const result = await loginOtp(phoneNumber, otpCode);

        if (result?.success && result.mustRegister) {
          setParentPhoneNumber?.(phoneNumber);
          setRegistrationToken?.(result.registrationToken);

          setStep('SIGNUP');
        } else if (result?.success && result.token) {
          // @ts-ignore
          reduxDispatch(
            reduxLogin({
              token: result.token,
              user: result.user,
            })
          );
        }
      } catch (error) {
        console.error('OTP login error:', error);

        toast.error('خطا در تایید کد یکبار مصرف');
      } finally {
        setLoading(false);
      }
    }
  };

  const onSendOtpSubmit: SubmitHandler<SendOtpFormValues> = async (data) => {
    try {
      console.log(data);

      setLoading(true);

      if (!captcha.answer.trim()) {
        captcha.setError('کد کپچا الزامی است');
        return;
      }

      const result = await requestOtp(data.phoneNumber, captcha.getPayload());

      if (
        result?.success &&
        result?.scenario !== SEND_OTP_SCENARIOS.IS_BLOCKED
      ) {
        setOtpSent(true);
        setPhoneNumber(data.phoneNumber);

        setParentPhoneNumber?.(data.phoneNumber);

        setResendTimer(120);
        setCanResend(false);
        setOtpExpiresAt(Date.now() + OTP_VALIDITY_MS);
        setOtpSecondsRemaining(OTP_VALIDITY_MS / 1000);
      } else if (result?.scenario === SEND_OTP_SCENARIOS.IS_BLOCKED) {
        toast.error('امکان ورود با این شماره در حال حاضر وجود ندارد');
      } else {
        await handleCaptchaFailure(result || {});

        if (!result?.message) {
          toast.error(
            'خطا در ارسال کد یکبار مصرف\n لطفا از طریق رمزعبور وارد شوید'
          );
        }
      }
    } catch (error) {
      console.error(error);

      toast.error(
        'خطا در ارسال کد یکبار مصرف\n لطفا از طریق رمزعبور وارد شوید'
      );

      await captcha.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpExpiration = () => {
    setExpirationModalOpen(false);
    setOtpSent(false);
    setOtpExpiresAt(0);
    setOtpSecondsRemaining(0);
    setResendTimer(120);
    setCanResend(false);
    setIsResending(false);
    setIsResendMode(false);
    captcha.clearAnswer();
  };

  const focusResendCaptcha = () => {
    setTimeout(() => {
      resendCaptchaRef.current
        ?.querySelector<HTMLInputElement>('input')
        ?.focus();
    }, 100);
  };

  // @ts-ignore
  return isOtpSent ? (
    <>
      <Text className="mb-4 mt-1 text-center text-[15px] leading-[1.85] text-gray-700 md:text-base md:!leading-loose lg:text-start xl:mt-6">
        {isResendMode
          ? 'برای دریافت کد جدید، کپچا را وارد کنید.'
          : 'کد یکبار مصرف برای شما ارسال شد.'}
      </Text>

      <Form<FormValues>
        key={otpFormVersion}
        validationSchema={verifyOtpSchema}
        onSubmit={onSubmit}
      >
        {({ setValue, formState: { errors } }) => (
          <div dir="rtl" className="space-y-6">
            {!isResendMode && (
              <div className="border-[#129974]/15 flex items-center justify-between rounded-lg border bg-[#f4fbf8] px-3 py-2 text-xs text-gray-600">
                <span>زمان باقی‌مانده برای واردکردن کد</span>
                <span
                  dir="ltr"
                  className="font-mono text-sm font-bold text-[#0d765a]"
                >
                  {formatTime(otpSecondsRemaining)}
                </span>
              </div>
            )}

            {/*
             * PinCode itself should behave LTR.
             *
             * IMPORTANT:
             * Don't put autoFocus on RizzUI PinCode.
             * We manually focus its first input using pinCodeRef.
             */}
            <div
              ref={pinCodeRef}
              dir="ltr"
              style={{
                direction: 'ltr',
              }}
              className="flex flex-col items-center gap-4"
            >
              {!isResendMode && (
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
              )}

              {isResendMode && (
                <div
                  ref={resendCaptchaRef}
                  className="w-full max-w-md animate-popup rounded-xl border border-[#129974]/10 bg-[#f8fcfa] p-3"
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

              <div className="flex w-full flex-col items-center gap-2">
                {isResendMode ? (
                  <Button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    isLoading={isResending}
                    className="w-full max-w-xs rounded-lg bg-[#129974] px-6 py-3 text-base font-semibold text-white hover:bg-[#0d8061]"
                  >
                    ارسال کد جدید
                  </Button>
                ) : canResend ? (
                  <button
                    type="button"
                    onClick={handleStartResend}
                    disabled={captcha.loading}
                    className="text-sm font-semibold text-[#0d765a] underline decoration-2 underline-offset-4 transition-colors hover:text-[#095a45] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#129974] disabled:cursor-wait disabled:opacity-60"
                  >
                    {captcha.loading
                      ? 'در حال دریافت کپچا...'
                      : 'ارسال مجدد رمز یکبارمصرف'}
                  </button>
                ) : (
                  <Text className="text-center text-sm text-gray-500">
                    <span dir="ltr" className="font-mono font-bold">
                      {formatTime(resendTimer)}
                    </span>
                    ارسال مجدد در{' '}
                  </Text>
                )}
              </div>
            </div>

            {!isResendMode && (
              <Button
                isLoading={loading}
                className="mt-6 w-full"
                type="submit"
                size="lg"
                color="success"
              >
                <span>ورود | ثبت‌نام</span>{' '}
                <PiArrowLeftBold className="ms-2 mt-0.5 h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </Form>

      <Modal
        isOpen={expirationModalOpen}
        onClose={handleOtpExpiration}
        className="flex items-center justify-center p-4"
        backdropClassName="bg-gray-900/55 backdrop-blur-sm"
      >
        <div
          dir="rtl"
          role="button"
          tabIndex={0}
          onClick={handleOtpExpiration}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleOtpExpiration();
            }
          }}
          className="w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <div className="mb-2 flex justify-end">
            <ActionIcon
              type="button"
              variant="text"
              size="sm"
              aria-label="بستن"
            >
              <PiXBold className="h-5 w-5" />
            </ActionIcon>
          </div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-lighter text-orange-dark">
            <PiClockCountdownBold className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-black text-gray-900">
            کد یکبارمصرف منقضی شد
          </h3>
          <p className="text-sm leading-7 text-gray-500">
            بیشتر از ۵ دقیقه از دریافت کد گذشته است. لطفاً مجدداً شروع کنید.
          </p>
        </div>
      </Modal>

    </>
  ) : (
    <Form<SendOtpFormValues>
      validationSchema={sendOtpSchema}
      onSubmit={onSendOtpSubmit}
      useFormProps={{
        defaultValues: {
          phoneNumber: initialPhoneNumber,
        },
      }}
    >
      {({ register, formState: { errors } }) => (
        <div className="space-y-4">
          <div>
            <Input
              type="tel"
              dir="ltr"
              variant="outline"
              label="شماره موبایل"
              placeholder="09 *********"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              size="lg"
              color="success"
              className="lg:justify-end"
              inputClassName="text-left tracking-wide"
              inputMode="numeric"
              maxLength={11}
            />
          </div>

          <div>
            <CaptchaField
              imageSrc={captcha.imageSrc}
              answer={captcha.answer}
              onAnswerChange={captcha.setAnswer}
              onRefresh={captcha.refresh}
              loading={captcha.loading}
              error={captcha.error}
              loadError={captcha.loadError}
              color="success"
              compact
              inline
            />
          </div>

          <Button
            className="h-11 w-full text-base font-medium"
            type="submit"
            size="lg"
            color="success"
            isLoading={loading}
          >
            ارسال کد یکبار مصرف
          </Button>
        </div>
      )}
    </Form>
  );
}
