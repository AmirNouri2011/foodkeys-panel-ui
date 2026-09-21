'use client';
import SignInForm from './sign-in-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import Image from 'next/image';
import UnderlineShape from '@/components/shape/underline';
import loginImage from 'public/foodkeysLogin.png';
import { useState } from 'react';
import AuthWrapperTwo from '../shared/auth-layout/auth-wrapper-two';
import OtpForm from '../otp/otp-form';
import OtpRegistrationForm from './otp-registration-form';

export default function Login() {
  const [step, setStep] = useState<'INITIAL' | 'PASSWORD' | 'SIGNUP'>(
    'PASSWORD'
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [registrationExpiresAt, setRegistrationExpiresAt] = useState(0);
  const [passwordCaptchaVisible, setPasswordCaptchaVisible] = useState(false);

  const handleRegistrationToken = (token: string) => {
    setRegistrationToken(token);
    setRegistrationExpiresAt(Date.now() + 12 * 60 * 1000);
  };

  const handleRegistrationExpired = () => {
    setRegistrationToken('');
    setRegistrationExpiresAt(0);
    setStep('INITIAL');
  };

  return (
    <>
      {step === 'INITIAL' && (
        <AuthWrapperOne
          setStep={setStep}
          title={
            <>
              <span className="relative inline-block">
                خوش آمدید!{' '}
                <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-[#129974] md:w-28 xl:-bottom-1.5 xl:w-36" />
              </span>
            </>
          }
          description="با حضور موثر کسب و کارتان در سایت مرجع صنایع غذایی و کشاورزی، یک قدم از رقبایتان جلوتر باشید."
          bannerTitle="ساده‌ترین روش برای مدیریت فضای کاری خود."
          bannerDescription="لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ است."
          isSocialLoginActive={true}
          pageImage={
            <div className="relative mx-auto w-full max-w-[320px]">
              <Image
                src={loginImage}
                alt="پنل مرجع صنایع غذایی و کشاورزی ایران"
                className="h-auto w-full object-contain drop-shadow-xl"
                priority
              />
            </div>
          }
        >
          <OtpForm
            setStep={setStep}
            setPhoneNumber={setPhoneNumber}
            setRegistrationToken={handleRegistrationToken}
            initialPhoneNumber={phoneNumber}
          />
        </AuthWrapperOne>
      )}
      {step === 'SIGNUP' && (
        <AuthWrapperOne
          setStep={setStep}
          title={
            <>
              <span className="relative inline-block">
                تکمیل ثبت‌نام
                <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-28 text-[#129974] xl:-bottom-1.5 xl:w-36" />
              </span>
            </>
          }
          description="شماره موبایل شما تأیید شد. اطلاعات زیر را برای ساخت حساب کاربری تکمیل کنید."
          eyebrow="ساخت حساب کاربری"
          bannerTitle="ساده‌ترین روش برای مدیریت فضای کاری خود."
          bannerDescription="لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و "
          isSocialLoginActive={false}
          pageImage={
            <div className="relative mx-auto w-full max-w-[320px]">
              <Image
                src={loginImage}
                alt="پنل مرجع صنایع غذایی و کشاورزی ایران"
                className="h-auto w-full object-contain drop-shadow-xl"
                priority
              />
            </div>
          }
        >
          <OtpRegistrationForm
            phoneNumber={phoneNumber}
            registrationToken={registrationToken}
            expiresAt={registrationExpiresAt}
            onRegistrationExpired={handleRegistrationExpired}
          />
        </AuthWrapperOne>
      )}
      {step === 'PASSWORD' && (
        <AuthWrapperTwo
          setStep={setStep}
          isCaptchaVisible={passwordCaptchaVisible}
          title={
            <>
              <span className="relative inline-block">
                خوش آمدید!{' '}
                <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-[#129974] md:w-28 xl:-bottom-1.5 xl:w-36" />
              </span>
            </>
          }
          description="با حضور موثر کسب و کارتان در سایت مرجع صنایع غذایی و کشاورزی، یک قدم از رقبایتان جلوتر باشید."
          bannerTitle="ساده‌ترین روش برای مدیریت فضای کاری خود."
          bannerDescription="لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ است."
          pageImage={
            <div className="relative mx-auto w-full max-w-[320px]">
              <Image
                src={loginImage}
                alt="پنل مرجع صنایع غذایی و کشاورزی ایران"
                className="h-auto w-full object-contain drop-shadow-xl"
                priority
              />
            </div>
          }
        >
          <SignInForm
            step={'PASSWORD'}
            onCaptchaVisibilityChange={setPasswordCaptchaVisible}
          />
        </AuthWrapperTwo>
      )}
    </>
  );
}
