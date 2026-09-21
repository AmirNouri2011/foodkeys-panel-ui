import ForgetPasswordForm from './forget-password-form';
import UnderlineShape from '@/components/shape/underline';
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import loginImage from 'public/foodkeysLogin.png';

export default function SignIn() {
  return (
    <AuthWrapperOne
      // setStep={}
      title={
        <>
          بازنشانی{' '}
          <span className="relative inline-block">
            رمز عبور!
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-[#129974] md:w-28 xl:-bottom-1.5 xl:w-36" />
          </span>
        </>
      }
      bannerTitle="ساده‌ترین روش برای مدیریت فضای کاری خود."
      bannerDescription="لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و "
      description="شماره موبایل حساب کاربری خود را وارد کنید تا کد بازیابی برای شما ارسال شود."
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
      <ForgetPasswordForm />
    </AuthWrapperOne>
  );
}
