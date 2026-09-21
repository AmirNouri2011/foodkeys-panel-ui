'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PiSealCheckFill } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { STATIC_FILES_URL } from '@/config/api.config';
import { Text } from '@/components/ui/text';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { RootState } from '@/store/store';
import { setUserInfo } from '@/store/userSlice';
import { setCredit } from '@/store/walletSlice';
import PersonalInfoView from './personal-info';
import noPic from '@public/mockProfile.webp';

export default function ProfileSettingsView() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const _axios = useAxiosPrivate();
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    const fetchUserInfo = async () => {
      try {
        const response = await _axios.get('/user/me');
        if (active && response.data.status === 'SUCCESS') {
          setUser(response.data.data);
          dispatch(setUserInfo(response.data.data));
          dispatch(setCredit(response.data.data.credit));
        }
      } catch (error) {
        if (active) toast.error('خطا در دریافت اطلاعات کاربر');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUserInfo();
    return () => { active = false; };
  }, [_axios, dispatch]);

  const userInfo = useSelector((state: RootState) => state.user);

  if (loading) return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-500">در حال دریافت اطلاعات پروفایل…</div>;
  if (!user) return <div className="rounded-2xl border border-red-200 bg-white p-8 text-red-600">اطلاعات پروفایل دریافت نشد. لطفاً صفحه را دوباره بارگذاری کنید.</div>;

  return (
    <>
      <ProfileHeader userInfo={userInfo} description="اطلاعات شخصی و راه‌های ارتباطی خود را ویرایش کنید" />
      <PersonalInfoView user={user} />
    </>
  );
}

export function ProfileHeader({ userInfo, description, children }: React.PropsWithChildren<{ userInfo: any; description?: string }>) {
  return (
    <div className="-mx-4 rounded-b-2xl bg-gradient-to-l from-primary/10 via-white to-gray-50 px-4 py-7 md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 xl:-mx-6 xl:px-6 3xl:-mx-[33px] 3xl:px-[33px] 4xl:px-10 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg dark:border-gray-700">
          <Image src={userInfo?.avatar ? STATIC_FILES_URL + userInfo.avatar : noPic} alt="عکس پروفایل" fill sizes="80px" className="object-cover" />
        </div>
        <div>
          <Text tag="h2" className="mb-1 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            {[userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ') || 'پروفایل من'}
            <PiSealCheckFill className="h-5 w-5 text-primary" />
          </Text>
          {description && <Text className="text-sm text-gray-500">{description}</Text>}
        </div>
        {children}
      </div>
    </div>
  );
}
