'use client';

import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@public/fkLogo.png';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  PiCheckCircleFill,
  PiDeviceMobile,
  PiLockKeyFill,
  PiShieldCheckFill,
} from 'react-icons/pi';

export default function AuthWrapperTwo({
  children,
  title,
  description,
  pageImage,
  setStep,
  isCaptchaVisible = false,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  bannerTitle?: string;
  bannerDescription?: string;
  description?: string;
  pageImage?: React.ReactNode;
  isSocialLoginActive?: boolean;
  isSignIn?: boolean;
  setStep: (arg: 'INITIAL' | 'PASSWORD' | 'SIGNUP') => void;
  isCaptchaVisible?: boolean;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f6] px-4 py-5 sm:px-6 sm:py-8 lg:flex lg:h-screen lg:min-h-[640px] lg:items-center lg:px-8 lg:py-4">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#129974]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_-32px_rgba(15,69,54,0.28)] lg:h-[calc(100vh-32px)] lg:max-h-[760px] lg:min-h-[608px] lg:grid-cols-[0.9fr_1.1fr]">
        <section className={`flex items-center px-6 sm:px-10 lg:px-12 xl:px-16 ${isCaptchaVisible ? 'py-4 lg:py-3' : 'py-8 lg:py-6'}`}>
          <div className="mx-auto w-full max-w-md">
            <Link href="/" className={`inline-flex items-center gap-3 ${isCaptchaVisible ? 'mb-2' : 'mb-6 lg:mb-5'}`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f4] ring-1 ring-[#129974]/10">
                <Image
                  className="h-8 w-8"
                  src={logoImg}
                  alt="مرجع صنایع غذایی و کشاورزی ایران"
                  priority
                />
              </span>
              <span className="text-sm font-black leading-6 text-gray-900 sm:text-base">
                مرجع صنایع غذایی و کشاورزی ایران
              </span>
            </Link>

            <div className={isCaptchaVisible ? 'mb-3' : 'mb-6 lg:mb-5'}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#edf8f4] px-3 py-1.5 text-xs font-semibold text-[#0d765a]">
                <PiLockKeyFill className="h-4 w-4" />
                ورود امن با رمز عبور
              </div>
              <Text
                tag="h1"
                className="mb-2 text-[28px] font-black leading-tight text-gray-900 sm:text-[34px]"
              >
                {title}
              </Text>
              <Text className={`max-w-sm text-sm leading-7 text-gray-500 sm:text-[15px] ${isCaptchaVisible ? 'hidden' : ''}`}>
                {description}
              </Text>
            </div>

            {children}

            <div className={`${isCaptchaVisible ? 'my-3' : 'my-5'} flex items-center gap-4 text-xs text-gray-400 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200`}>
              یا
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('INITIAL')}
              className={`${isCaptchaVisible ? 'h-9' : 'h-11'} w-full border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-all hover:border-[#129974]/40 hover:bg-[#f4fbf8] hover:text-[#0d765a]`}
            >
              <PiDeviceMobile className="me-2 h-5 w-5" />
              ورود با رمز یکبار مصرف
            </Button>

            <div className={`${isCaptchaVisible ? 'hidden' : 'mt-5 flex'} items-center justify-center gap-2 text-xs text-gray-400`}>
              <PiShieldCheckFill className="h-4 w-4 text-[#129974]" />
              اطلاعات ورود شما به‌صورت امن محافظت می‌شود
            </div>
          </div>
        </section>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b5f49] via-[#107e60] to-[#129974] p-9 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5" />

          <div className="relative z-10 max-w-md">
            <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              پنل اختصاصی کسب‌وکارها
            </span>
            <h2 className="text-[28px] font-black leading-[1.55] !text-white xl:text-[32px]">
              کسب‌وکار خود را حرفه‌ای‌تر مدیریت کنید
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
              به خدمات، درخواست‌ها و اطلاعات کسب‌وکارتان در یک فضای یکپارچه دسترسی داشته باشید.
            </p>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">
            {pageImage}
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 text-xs font-medium text-white/90">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <PiCheckCircleFill className="h-5 w-5 shrink-0 text-orange-300" />
              دسترسی سریع و ساده
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <PiShieldCheckFill className="h-5 w-5 shrink-0 text-orange-300" />
              ورود امن و مطمئن
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
