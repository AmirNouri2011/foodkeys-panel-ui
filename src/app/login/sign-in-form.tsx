'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Password } from '@/components/ui/password';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { PiArrowLeftBold } from 'react-icons/pi';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { login as reduxLogin } from '@/store/userSlice';
import { useDispatch } from 'react-redux';
import CaptchaField from '@/components/auth/captcha-field';
import { useCaptcha } from '@/hooks/use-captcha';
import { CAPTCHA_ERROR, checkCaptchaRequired } from '@/utils/auth-captcha';

const loginSchema = z.object({
  username: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
  password: z.string().min(1, { message: 'رمزعبور اشتباه است' }),
  remember: z.boolean(),
});

type Login = z.infer<typeof loginSchema>;

const initialValues: Login = {
  username: '',
  password: '',
  remember: false,
};

export default function SignInForm({
  step,
  onCaptchaVisibilityChange,
}: {
  step: 'INITIAL' | 'PASSWORD' | 'SIGNUP';
  onCaptchaVisibilityChange?: (visible: boolean) => void;
}) {
  const [reset, setReset] = useState({});
  const reduxDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [usernameForStatus, setUsernameForStatus] = useState('');
  const captcha = useCaptcha({ autoFetch: false });
  // @ts-ignore
  const { login } = useAuth();

  useEffect(() => {
    if (!showCaptcha) return;
    void captcha.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCaptcha]);

  useEffect(() => {
    onCaptchaVisibilityChange?.(showCaptcha);
    return () => onCaptchaVisibilityChange?.(false);
  }, [onCaptchaVisibilityChange, showCaptcha]);

  useEffect(() => {
    if (step !== 'PASSWORD' || usernameForStatus.length !== 11) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const required = await checkCaptchaRequired('LOGIN', usernameForStatus);
      if (!cancelled && required) {
        setShowCaptcha(true);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, usernameForStatus]);

  const onSubmit: SubmitHandler<Login> = async (data) => {
    setLoading(true);
    console.log(data);

    if (showCaptcha && !captcha.answer.trim()) {
      captcha.setError('کد کپچا الزامی است');
      setLoading(false);
      return;
    }

    let m = { token: '', user: '' };
    const result = await login(
      data.username,
      data.password,
      m,
      showCaptcha ? captcha.getPayload() : undefined
    );
    console.log(m);

    if (result?.success) {
      // @ts-ignore
      reduxDispatch(reduxLogin(m));
    } else {
      if (
        result?.captchaRequired ||
        result?.errorType === CAPTCHA_ERROR.REQUIRED ||
        result?.errorType === CAPTCHA_ERROR.INVALID ||
        (result?.errorType === CAPTCHA_ERROR.AUTH && result?.captchaRequired)
      ) {
        setShowCaptcha(true);
        captcha.setError(
          result?.errorType === CAPTCHA_ERROR.INVALID
            ? 'کپچا نامعتبر'
            : undefined
        );
        await captcha.refresh();
      } else if (showCaptcha) {
        await captcha.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <>
      {step === 'INITIAL' && (
        <Form<Login>
          validationSchema={loginSchema}
          resetValues={reset}
          onSubmit={onSubmit}
          useFormProps={{
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className={showCaptcha ? 'space-y-3' : 'space-y-5'}>
              <Input
                dir="rtl"
                type="number"
                variant="outline"
                label="شماره خود را وارد کنید"
                placeholder="********* 09"
                // @ts-ignore
                {...register('phoneNumber')}
                // @ts-ignore
                error={errors.phoneNumber}
                size="lg"
                color="info"
                className="lg:justify-end"
                max={11}
                maxLength={11}
              />
              <div className="flex items-center justify-between pb-2">
                <Checkbox
                  {...register('remember')}
                  label="مرا به خاطر بسپر"
                  variant="flat"
                  className="[&>label>span]:font-medium"
                />
                <Link
                  href={routes.auth.forgotPassword1}
                  className="h-auto p-0 text-sm font-semibold text-[#129974] underline transition-colors hover:text-gray-900 hover:no-underline"
                >
                  رمز عبور را فراموش کردید؟
                </Link>
              </div>
              <Button
                className="group/btn w-full bg-[#129974]"
                type="submit"
                size="lg"
                color="success"
                isLoading={loading}
              >
                <span>ورود</span>{' '}
                <PiArrowLeftBold className="ms-2 mt-0.5 h-5 w-5" />
              </Button>
            </div>
          )}
        </Form>
      )}
      {step === 'PASSWORD' && (
        <Form<Login>
          validationSchema={loginSchema}
          resetValues={reset}
          onSubmit={onSubmit}
          useFormProps={{
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-5">
              <Input
                type="tel"
                dir="ltr"
                size="lg"
                label="شماره موبایل"
                placeholder="09 *********"
                color="success"
                className="[&>label>span]:font-medium"
                inputClassName="h-12 text-left text-sm tracking-wide"
                inputMode="numeric"
                autoComplete="username"
                maxLength={11}
                {...register('username', {
                  onChange: (e) => setUsernameForStatus(e.target.value),
                })}
                error={errors.username?.message}
              />
              <Password
                label="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
                size="lg"
                className="[&>label>span]:font-medium"
                inputClassName="h-12 text-sm"
                color="success"
                autoComplete="current-password"
                {...register('password')}
                error={errors.password?.message}
              />
              {showCaptcha && (
                <CaptchaField
                  imageSrc={captcha.imageSrc}
                  answer={captcha.answer}
                  onAnswerChange={captcha.setAnswer}
                  onRefresh={captcha.refresh}
                  loading={captcha.loading}
                  error={captcha.error}
                  loadError={captcha.loadError}
                  color="info"
                  compact
                />
              )}
              <div className="flex items-center justify-between pb-2">
                <Checkbox
                  {...register('remember')}
                  label="مرا به خاطر بسپر"
                  variant="flat"
                  className="[&>label>span]:font-medium"
                />
                <Link
                  href={routes.auth.forgotPassword1}
                  className="h-auto p-0 text-xs font-semibold text-[#0d765a] transition-colors hover:text-gray-900 sm:text-sm"
                >
                  رمز عبور را فراموش کردید؟
                </Link>
              </div>
              <Button
                className="group/btn h-12 w-full bg-[#129974] text-base font-semibold shadow-[0_10px_24px_-10px_rgba(18,153,116,0.9)] transition-all hover:bg-[#0d8061] hover:shadow-[0_14px_28px_-12px_rgba(18,153,116,0.95)]"
                type="submit"
                size="lg"
                color="success"
                isLoading={loading}
              >
                <span>ورود</span>{' '}
                <PiArrowLeftBold className="ms-2 mt-0.5 h-5 w-5" />
              </Button>
            </div>
          )}
        </Form>
      )}
    </>
  );
}
