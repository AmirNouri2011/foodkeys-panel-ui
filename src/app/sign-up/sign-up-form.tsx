'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Password } from '@/components/ui/password';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ErrorOption,
  SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { Text } from '@/components/ui/text';
import Link from 'next/link';
import { Form } from '@/components/ui/form';
import * as z from 'zod';
import React, { useState, useEffect, useRef } from 'react';
import { PiArrowLeftBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { PinCode } from '@/components/ui/pin-code';
import axios from 'axios';
import * as process from 'node:process';
import { login as reduxLogin } from '@/store/userSlice';
import { useAuth } from '@/context/AuthContext';
import { useDispatch } from 'react-redux';
import { da } from 'date-fns/locale';
import {
  companyFormSchema,
  defaultValues,
} from '@/app/shared/info/food-industry/company/create/form-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@/app/shared/info/food-industry/company/create';
import toast from 'react-hot-toast';
import CaptchaField from '@/components/auth/captcha-field';
import { useCaptcha } from '@/hooks/use-captcha';
import { CAPTCHA_ERROR } from '@/utils/auth-captcha';

type FormValues = {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  isAgreed: boolean;
  otp: string;
};

const getInitialValues = (phoneNumber?: string) => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: phoneNumber || '',
  password: '',
  confirmPassword: '',
  isAgreed: false,
  otp: '',
});

const signUpFormSchema = z.object({
  firstName: z.string().min(1, { message: 'نام الزامی می‌باشد' }),
  lastName: z.string().min(1, { message: 'نام خانوادگی الزامی می‌باشد' }),
  email: z.string().email({ message: 'آدرس ایمیل اشتباه می‌باشد' }),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
  password: z
    .string()
    .min(8, { message: 'رمز عبور باید حداقل ۸ یا بیشتر از کاراکترها باشد.' })
    .max(32, { message: 'رمز عبور باید حداکثر ۳۲ کاراکتر باشد.' })
    .regex(new RegExp('.*[A-Z].*'), {
      message: 'حداقل یک حرف بزرگ مورد استفاده قرار گیرد.',
    })
    .regex(new RegExp('.*[a-z].*'), {
      message: 'حداقل یک حرف کوچک مورد استفاده قرار گیرد.',
    })
    .regex(new RegExp('.*\\d.*'), {
      message: 'حداقل یک عدد مورد استفاده قرار گیرد.',
    })
    .regex(/[^A-Za-z0-9]/, {
      message: 'حداقل یک علامت ویژه مورد استفاده قرار گیرد.',
    }),
  confirmPassword: z
    .string()
    .regex(new RegExp('.*[A-Z].*'), {
      message: 'حداقل یک حرف بزرگ مورد استفاده قرار گیرد.',
    })
    .regex(new RegExp('.*[a-z].*'), {
      message: 'حداقل یک حرف کوچک مورد استفاده قرار گیرد.',
    })
    .regex(new RegExp('.*\\d.*'), {
      message: 'حداقل یک عدد مورد استفاده قرار گیرد.',
    })
    .regex(/[^A-Za-z0-9]/, {
      message: 'حداقل یک علامت ویژه مورد استفاده قرار گیرد.',
    })
    .min(8, { message: 'رمز عبور باید حداقل ۸ یا بیشتر از کاراکترها باشد.' })
    .max(32, { message: 'رمز عبور باید حداکثر ۳۲ کاراکتر باشد.' }),
  isAgreed: z.boolean(),
  otp: z
    .string()
    .min(1, { message: 'رمز یکبار مصرف ارسالی به خود را وارد کنید' }),
});

export default function SignUpForm({
  initialPhoneNumber,
}: {
  initialPhoneNumber?: string;
}) {
  const initialValues = getInitialValues(initialPhoneNumber);
  const [reset, setReset] = useState({});
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const dispatch = useDispatch();
  const setErrorRef = useRef<any>(null);
  // @ts-ignore
  const { signUp, requestOtp } = useAuth();
  const captcha = useCaptcha({ autoFetch: true });

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
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
  }, [resendTimer]);

  // Format time as MM:SS
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

  // Handle resend OTP
  const handleResendOtp = async (phoneNumber: string) => {
    if (!canResend || isResending) return;

    if (!captcha.answer.trim()) {
      captcha.setError('کد کپچا الزامی است');
      return;
    }

    setIsResending(true);
    try {
      const result = await requestOtp(phoneNumber, captcha.getPayload());
      if (result?.success) {
        setResendTimer(120);
        setCanResend(false);
        await captcha.refresh();
      } else {
        await handleCaptchaFailure(result || {});
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('خطا در ارسال مجدد رمز یکبار مصرف');
      await captcha.refresh();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Form<FormValues>
        validationSchema={signUpFormSchema}
        resetValues={reset}
        onSubmit={async (data) => {
          console.log('Form data:', { ...data, password: '***', otp: '***' });
          console.log('Phone number from state:', phoneNumber);

          // Ensure phone number is set (from initialPhoneNumber or state)
          const phone = data.phone || phoneNumber || initialPhoneNumber;
          console.log('Using phone number:', phone);

          if (!phone) {
            toast.error('شماره همراه یافت نشد');
            return;
          }

          if (!captcha.answer.trim()) {
            captcha.setError('کد کپچا الزامی است');
            return;
          }

          setLoading(true);
          let m = { token: '', user: '' };

          const result = await signUp(
            phone,
            data.email,
            data.firstName,
            data.lastName,
            data.password,
            data.otp,
            m,
            setErrorRef.current,
            captcha.getPayload()
          );

          console.log('SignUp result:', m);
          if (result?.success) {
            // @ts-ignore
            dispatch(reduxLogin(m));
          } else {
            await handleCaptchaFailure(result || {});
          }
          setLoading(false);
        }}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({
          register,
          getValues,
          setValue,
          setError,
          watch,
          formState: { errors },
        }) => {
          // Store setError in ref so onSubmit can access it
          setErrorRef.current = setError;

          // Watch isAgreed to reactively enable/disable button
          const isAgreed = watch('isAgreed');

          return (
            <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
              <div
                dir="rtl"
                className="col-span-2 mx-auto flex w-full flex-col items-center justify-center"
              >
                <div
                  dir="ltr"
                  className="flex w-full max-w-md flex-col items-center justify-center gap-6"
                >
                  <PinCode
                    dir="ltr"
                    variant="outline"
                    length={6}
                    setValue={(value) => setValue('otp', String(value))}
                    size="lg"
                    color="success"
                    className="w-full justify-center"
                    error={errors.otp?.message}
                  />
                  <div className="flex w-full flex-col items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleResendOtp(getValues().phone)}
                      disabled={!canResend || isResending}
                      className={`
                                        w-full max-w-xs
                                        rounded-lg px-6
                                        py-3 text-base
                                        font-semibold
                                        shadow-md transition-all
                                        duration-300 hover:shadow-lg
                                        ${
                                          canResend
                                            ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 bg-gradient-to-r text-white'
                                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                        }
                                    `}
                    >
                      {isResending ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="h-5 w-5 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          در حال ارسال...
                        </span>
                      ) : canResend ? (
                        'ارسال مجدد رمز یکبار مصرف'
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          ارسال مجدد در
                          <span className="font-mono font-bold">
                            {formatTime(resendTimer)}
                          </span>
                        </span>
                      )}
                    </Button>
                    {!canResend && resendTimer > 0 && (
                      <Text className="text-center text-sm text-gray-500">
                        لطفاً تا پایان زمان صبر کنید
                      </Text>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2"></div>
              <Input
                type="text"
                size="lg"
                label="نام*"
                placeholder="نام را وارد کنید"
                className="[&>label>span]:font-medium"
                color="success"
                inputClassName="text-sm"
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              <Input
                type="text"
                size="lg"
                label="نام خانوادگی*"
                placeholder="نام خانوادگی را وارد کنید"
                className="[&>label>span]:font-medium"
                color="success"
                inputClassName="text-sm"
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
              <Input
                type="email"
                size="lg"
                label="ایمیل*"
                className="col-span-2 [&>label>span]:font-medium"
                inputClassName="text-sm"
                color="success"
                placeholder="مثال: info@foodkeys.com"
                {...register('email')}
                error={errors.email?.message}
                required
              />
              <Input
                type="number"
                size="lg"
                readOnly
                label="شماره همراه*"
                className="col-span-2 [&>label>span]:font-medium"
                inputClassName="text-sm bg-gray-100"
                color="success"
                placeholder="مثال: 09123456789"
                {...register('phone', {
                  onChange: (e) => setPhoneNumber(e.target.value),
                })}
                error={errors.phone?.message}
                required
              />
              <Password
                label="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
                size="lg"
                className="[&>label>span]:font-medium"
                color="success"
                inputClassName="text-sm"
                {...register('password')}
                error={errors.password?.message}
              />
              <Password
                label="تکرار رمز عبور"
                placeholder="تکرار رمز عبور را وارد کنید"
                size="lg"
                className="[&>label>span]:font-medium"
                color="success"
                inputClassName="text-sm"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              <div className="col-span-2">
                <CaptchaField
                  imageSrc={captcha.imageSrc}
                  answer={captcha.answer}
                  onAnswerChange={captcha.setAnswer}
                  onRefresh={captcha.refresh}
                  loading={captcha.loading}
                  error={captcha.error}
                  color="success"
                />
              </div>
              <div className="col-span-2 flex items-start ">
                <Checkbox
                  {...register('isAgreed')}
                  className="[&>label>span]:font-medium [&>label]:items-start"
                  label={
                    <>
                      با عضویت، شما به قوانین و مقررات ما موافقت کرده‌اید.{' '}
                      <Link
                        href="/"
                        className="font-medium text-[#129974] transition-colors hover:underline"
                      >
                        قوانین
                      </Link>{' '}
                      &{' '}
                      <Link
                        href="/"
                        className="font-medium text-[#129974] transition-colors hover:underline"
                      >
                        سیاست حفظ حریم خصوصی
                      </Link>
                    </>
                  }
                />
              </div>
              <Button
                size="lg"
                color="success"
                type="submit"
                className="group/btn col-span-2 mt-2"
                isLoading={loading}
                disabled={!isAgreed || loading}
              >
                <span>ثبت نام</span>{' '}
                <PiArrowLeftBold className="ms-2 mt-0.5 h-5 w-5 transition-all group-hover/btn:-translate-x-2" />
              </Button>
            </div>
          );
        }}
      </Form>
    </>
  );
}
