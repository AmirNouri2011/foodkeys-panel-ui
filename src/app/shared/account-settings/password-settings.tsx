'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { PiCheckBold, PiCheckCircleFill, PiLockKey, PiShieldCheck, PiXBold } from 'react-icons/pi';
import { Modal } from 'rizzui';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Password } from '@/components/ui/password';
import { ProfileHeader } from './profile-settings';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useAuth } from '@/context/AuthContext';

const newPasswordSchema = z.string()
  .min(1, 'رمز عبور جدید الزامی است')
  .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
  .max(32, 'رمز عبور باید حداکثر ۳۲ کاراکتر باشد')
  .regex(/[A-Z]/, 'حداقل یک حرف بزرگ انگلیسی لازم است')
  .regex(/[a-z]/, 'حداقل یک حرف کوچک انگلیسی لازم است')
  .regex(/[0-9]/, 'حداقل یک عدد لازم است')
  .regex(/[^A-Za-z0-9]/, 'حداقل یک علامت ویژه لازم است');

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: newPasswordSchema,
  confirmedPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
}).superRefine((data, context) => {
  if (data.newPassword && data.newPassword === data.currentPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['newPassword'], message: 'رمز جدید باید با رمز فعلی متفاوت باشد' });
  }
  if (data.confirmedPassword && data.confirmedPassword !== data.newPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmedPassword'], message: 'تکرار رمز با رمز جدید یکسان نیست' });
  }
});

type PasswordFormTypes = z.infer<typeof passwordFormSchema>;
type ServerError = { formikField?: string; field?: string; message?: string };

function ValidationRule({ valid, children }: { valid: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${valid ? 'font-medium text-green-dark dark:text-green-light' : 'text-gray-500'}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${valid ? 'bg-green text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
        {valid ? <PiCheckBold aria-hidden="true" className="h-2.5 w-2.5" /> : <PiXBold aria-hidden="true" className="h-2.5 w-2.5" />}
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function PasswordSettingsView({ settings }: { settings?: PasswordFormTypes }) {
  const userInfo = useSelector((state: RootState) => state.user);
  const api = useAxiosPrivate();
  const { logout } = useAuth();
  const [successOpen, setSuccessOpen] = useState(false);
  const { control, handleSubmit, reset, setError, trigger, formState: { errors, isSubmitting } } = useForm<PasswordFormTypes>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmedPassword: '',
      ...settings,
    },
  });
  const currentPassword = useWatch({ control, name: 'currentPassword' }) || '';
  const newPassword = useWatch({ control, name: 'newPassword' }) || '';
  const confirmedPassword = useWatch({ control, name: 'confirmedPassword' }) || '';

  useEffect(() => {
    if (newPassword) void trigger('newPassword');
    if (confirmedPassword) void trigger('confirmedPassword');
  }, [currentPassword, newPassword, confirmedPassword, trigger]);

  const onSubmit = async (data: PasswordFormTypes) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmedPassword,
      });
      if (response.data?.status && response.data.status !== 'SUCCESS') {
        toast.error(response.data.message || 'تغییر رمز عبور انجام نشد');
        return;
      }
      reset();
      setSuccessOpen(true);
    } catch (error) {
      const backend = axios.isAxiosError(error) ? error.response?.data : undefined;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const fieldErrors: ServerError[] = Array.isArray(backend?.error) ? backend.error : [];
      let hasFieldError = false;
      for (const item of fieldErrors) {
        const field = item.formikField || item.field;
        const name = field === 'oldPassword' ? 'currentPassword' : field === 'confirmNewPassword' ? 'confirmedPassword' : field;
        if (name === 'currentPassword' || name === 'newPassword' || name === 'confirmedPassword') {
          setError(name, { type: 'server', message: item.message || 'مقدار واردشده معتبر نیست' }, { shouldFocus: true });
          hasFieldError = true;
        }
      }
      if (!hasFieldError && status === 400) {
        setError('currentPassword', { type: 'server', message: backend?.message || 'رمز عبور فعلی صحیح نیست' }, { shouldFocus: true });
      }
      toast.error(backend?.message || (hasFieldError ? 'لطفاً خطاهای فرم را بررسی کنید' : 'خطا در تغییر رمز عبور؛ دوباره تلاش کنید'));
    }
  };

  const continueToLogin = () => {
    setSuccessOpen(false);
    logout();
  };

  return (
    <>
      <ProfileHeader userInfo={userInfo} description="امنیت حساب کاربری و تغییر رمز عبور" />
      <div className="mx-auto mt-6 max-w-screen-2xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-6 dark:border-gray-700 dark:bg-gray-800/50 sm:px-8">
            <span className="rounded-xl bg-primary/10 p-3 text-primary"><PiShieldCheck className="h-6 w-6" /></span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">تغییر رمز عبور</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">برای حفظ امنیت حساب، رمز جدیدی انتخاب کنید که قبلاً استفاده نکرده‌اید.</p>
            </div>
          </div>
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 sm:px-8">
            <div className="grid max-w-3xl gap-6">
              <Controller control={control} name="currentPassword" render={({ field }) => (
                <Password label="رمز عبور فعلی *" placeholder="رمز فعلی را وارد کنید" autoComplete="current-password" {...field} value={field.value || ''} error={errors.currentPassword?.message} />
              )} />
              <ul aria-live="polite" className="-mt-3 grid gap-1">
                <ValidationRule valid={currentPassword.length > 0}>رمز عبور فعلی وارد شده است (درستی آن پس از ثبت بررسی می‌شود)</ValidationRule>
              </ul>
              <div className="border-t border-dashed border-gray-200 pt-6 dark:border-gray-700">
                <Controller control={control} name="newPassword" render={({ field }) => (
                  <Password label="رمز عبور جدید *" placeholder="رمز جدید را وارد کنید" autoComplete="new-password" {...field} value={field.value || ''} error={errors.newPassword?.message} />
                )} />
                <ul aria-live="polite" className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                  <ValidationRule valid={newPassword.length >= 8 && newPassword.length <= 32}>بین ۸ تا ۳۲ کاراکتر</ValidationRule>
                  <ValidationRule valid={/[A-Z]/.test(newPassword)}>حرف بزرگ انگلیسی</ValidationRule>
                  <ValidationRule valid={/[a-z]/.test(newPassword)}>حرف کوچک انگلیسی</ValidationRule>
                  <ValidationRule valid={/[0-9]/.test(newPassword)}>عدد</ValidationRule>
                  <ValidationRule valid={/[^A-Za-z0-9]/.test(newPassword)}>علامت ویژه</ValidationRule>
                  <ValidationRule valid={!!newPassword && !!currentPassword && newPassword !== currentPassword}>متفاوت از رمز فعلی</ValidationRule>
                </ul>
              </div>
              <Controller control={control} name="confirmedPassword" render={({ field }) => (
                <Password label="تکرار رمز عبور جدید *" placeholder="رمز جدید را دوباره وارد کنید" autoComplete="new-password" {...field} value={field.value || ''} error={errors.confirmedPassword?.message} />
              )} />
              <ul aria-live="polite" className="-mt-3 grid gap-1">
                <ValidationRule valid={!!confirmedPassword && confirmedPassword === newPassword}>تکرار رمز با رمز جدید یکسان است</ValidationRule>
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => reset()}>پاک کردن فرم</Button>
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="gap-2"><PiLockKey className="h-5 w-5" /> ذخیره رمز جدید</Button>
            </div>
          </form>
        </div>
      </div>
      <Modal isOpen={successOpen} onClose={continueToLogin} className="flex items-center justify-center p-4" backdropClassName="bg-gray-900/55 backdrop-blur-sm">
        <div dir="rtl" className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl dark:bg-gray-900">
          <PiCheckCircleFill className="mx-auto mb-4 h-14 w-14 text-green" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">رمز عبور تغییر کرد</h3>
          <p className="mt-3 text-sm leading-7 text-gray-500">برای ادامه، لطفاً با رمز جدید دوباره وارد حساب خود شوید.</p>
          <Button type="button" className="mt-6 w-full" onClick={continueToLogin}>ورود دوباره</Button>
        </div>
      </Modal>
    </>
  );
}
