'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Password } from '@/components/ui/password';
import { useAuth } from '@/context/AuthContext';
import { login as reduxLogin } from '@/store/userSlice';
import { PiCheckBold, PiClockCountdownBold, PiXBold } from 'react-icons/pi';
import { Modal } from 'rizzui';
import { ActionIcon } from '@/components/ui/action-icon';

const REGISTRATION_TTL_SECONDS = 12 * 60;

const registrationSchema = z
  .object({
    firstName: z.string().trim().min(2, 'نام باید حداقل ۲ حرف باشد'),
    lastName: z.string().trim().min(2, 'نام خانوادگی باید حداقل ۲ حرف باشد'),
    phoneNumber: z
      .string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
    email: z
      .string()
      .trim()
      .min(1, 'ایمیل الزامی است')
      .email('ایمیل معتبر نمی‌باشد'),
    password: z
      .string()
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
      .regex(/[a-z]/, 'رمز عبور باید حرف کوچک داشته باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حرف بزرگ داشته باشد')
      .regex(/\d/, 'رمز عبور باید عدد داشته باشد')
      .regex(/[^A-Za-z0-9]/, 'رمز عبور باید علامت ویژه داشته باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
    isAgreed: z.boolean().refine(Boolean, 'پذیرش قوانین الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function OtpRegistrationForm({
  phoneNumber,
  registrationToken,
  expiresAt,
  onRegistrationExpired,
}: {
  phoneNumber: string;
  registrationToken: string;
  expiresAt: number;
  onRegistrationExpired: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [expirationModalOpen, setExpirationModalOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    Math.min(
      REGISTRATION_TTL_SECONDS,
      Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    )
  );
  const setErrorRef = useRef<any>(null);
  const expiryHandledRef = useRef(false);
  const reduxDispatch = useDispatch();
  // @ts-ignore
  const { registerAfterOtp } = useAuth();

  useEffect(() => {
    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(Math.min(REGISTRATION_TTL_SECONDS, remaining));
      if (remaining === 0 && !expiryHandledRef.current) {
        expiryHandledRef.current = true;
        setExpirationModalOpen(true);
      }
    };

    updateRemainingTime();
    const interval = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt, onRegistrationExpired]);

  const initialValues: RegistrationFormValues = {
    firstName: '',
    lastName: '',
    phoneNumber,
    email: '',
    password: '',
    confirmPassword: '',
    isAgreed: false,
  };

  return (
    <>
      <Form<RegistrationFormValues>
        validationSchema={registrationSchema}
        onSubmit={async (data) => {
          setLoading(true);
          const result = await registerAfterOtp({
            registrationToken,
            phoneNumber: data.phoneNumber,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
          });
          if (result?.success) {
            // @ts-ignore
            reduxDispatch(
              reduxLogin({ token: result.token, user: result.user })
            );
          } else if (result?.validationErrors?.length) {
            result.validationErrors.forEach(
              (item: { formikField?: string; message?: string }) => {
                const fieldMap: Record<string, keyof RegistrationFormValues> = {
                  firstName: 'firstName',
                  lastName: 'lastName',
                  email: 'email',
                  phone: 'phoneNumber',
                  phoneNumber: 'phoneNumber',
                  password: 'password',
                };
                const fieldName = item.formikField
                  ? fieldMap[item.formikField]
                  : undefined;
                if (fieldName && item.message) {
                  setErrorRef.current?.(fieldName, {
                    type: 'server',
                    message: item.message,
                  });
                }
              }
            );
          } else if (result?.registrationExpired) {
            expiryHandledRef.current = true;
            setExpirationModalOpen(true);
          }
          setLoading(false);
        }}
        useFormProps={{
          defaultValues: initialValues,
          mode: 'onChange',
          reValidateMode: 'onChange',
        }}
      >
        {({ register, watch, setError, formState: { errors, isValid } }) => {
          setErrorRef.current = setError;
          const password = watch('password') || '';
          const remainingMinutes = Math.floor(secondsRemaining / 60)
            .toString()
            .padStart(2, '0');
          const remainingSeconds = (secondsRemaining % 60)
            .toString()
            .padStart(2, '0');
          const passwordRules = [
            { label: 'حداقل ۸ کاراکتر', valid: password.length >= 8 },
            {
              label: 'حرف کوچک و بزرگ',
              valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
            },
            { label: 'حداقل یک عدد', valid: /\d/.test(password) },
            { label: 'حداقل یک علامت', valid: /[^A-Za-z0-9]/.test(password) },
          ];

          return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="border-[#129974]/15 col-span-full flex items-center justify-between rounded-lg border bg-[#f4fbf8] px-3 py-2 text-xs text-gray-500">
                <span>مهلت تکمیل ثبت‌نام</span>
                <span dir="ltr" className="font-mono font-bold text-[#0d765a]">
                  {remainingMinutes}:{remainingSeconds}
                </span>
              </div>
              <Input
                label="نام"
                placeholder="نام"
                size="lg"
                color="success"
                inputClassName="h-10 text-sm"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <Input
                label="نام خانوادگی"
                placeholder="نام خانوادگی"
                size="lg"
                color="success"
                inputClassName="h-10 text-sm"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
              <Input
                dir="ltr"
                type="tel"
                label="شماره موبایل"
                size="lg"
                color="success"
                readOnly
                inputClassName="h-10 bg-gray-100 text-left text-sm tracking-wide"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
              <Input
                dir="ltr"
                type="email"
                label="ایمیل"
                placeholder="name@example.com"
                size="lg"
                color="success"
                inputClassName="h-10 text-left text-sm"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
              />
              <Password
                label="رمز عبور"
                placeholder="رمز عبور"
                size="lg"
                color="success"
                inputClassName="h-10 text-sm"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
              />
              <Password
                label="تکرار رمز عبور"
                placeholder="تکرار رمز عبور"
                size="lg"
                color="success"
                inputClassName="h-10 text-sm"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <div className="col-span-full flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2 text-[10px] leading-4 sm:text-[11px]">
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

              <div className="col-span-full flex items-start">
                <Checkbox
                  {...register('isAgreed')}
                  label="قوانین و شرایط استفاده را می‌پذیرم"
                  className="[&>label>span]:text-xs [&>label>span]:font-medium"
                />
                {errors.isAgreed?.message && (
                  <span className="ms-2 text-xs text-red">
                    {errors.isAgreed.message}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                color="success"
                size="lg"
                isLoading={loading}
                disabled={!isValid || loading}
                className="col-span-full h-11 w-full bg-[#129974] font-semibold shadow-[0_10px_24px_-12px_rgba(18,153,116,0.9)] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
              >
                ساخت حساب و ورود به پنل
              </Button>
            </div>
          );
        }}
      </Form>

      <Modal
        isOpen={expirationModalOpen}
        onClose={onRegistrationExpired}
        className="flex items-center justify-center p-4"
        backdropClassName="bg-gray-900/55 backdrop-blur-sm"
      >
        <div
          dir="rtl"
          className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <div className="mb-2 flex justify-end">
            <ActionIcon
              type="button"
              variant="text"
              size="sm"
              onClick={onRegistrationExpired}
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
          <p className="mb-6 text-sm leading-7 text-gray-500">
            مهلت ۱۲ دقیقه‌ای تکمیل ثبت‌نام به پایان رسیده است. برای ادامه، کد
            جدید دریافت کنید.
          </p>
          <Button
            type="button"
            color="success"
            onClick={onRegistrationExpired}
            className="h-11 w-full bg-[#129974] font-semibold"
          >
            دریافت مجدد کد یکبارمصرف
          </Button>
        </div>
      </Modal>
    </>
  );
}
