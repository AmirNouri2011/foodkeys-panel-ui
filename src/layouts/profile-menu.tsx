'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { IoMdRefreshCircle } from 'react-icons/io';
import WalletSection from '../layouts/wallet-section';
const menuItems = [
  {
    name: 'تنطیمات حساب کاربری',
    href: routes.profile,
  },
  // {
  //   name: 'تنطیمات حساب کاربری',
  //   href: routes.forms.profileSettings,
  // },
  {
    name: 'پیام‌ها و اعلانات',
    href: routes.notifications,
  },
  {
    name: 'تاریخچه فعالیت',
    href: routes.activities,
  },
];

import { STATIC_FILES_URL } from '@/config/api.config';
import cn from '@/utils/class-names';

function DropdownMenu() {
  const user = useSelector((state: RootState) => state.user);
  // const [actualCredit, setActualCredit] = useState(0);
  // const _axios = useAxiosPrivate();

  // useEffect(() => {
  //   const fetchWalletCredit = async () => {
  //     try {
  //       const response = await _axios.get('/user/credit');
  //       if (response.data.status === 'SUCCESS') {
  //         setActualCredit(response.data.data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching wallet credit:', error);
  //     }
  //   };
  //   fetchWalletCredit();
  // }, []);
  // @ts-ignore
  const { logout } = useAuth();
  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          // @ts-ignore
          src={(user.avatar && STATIC_FILES_URL + user.avatar) || ''}
          name={user.firstName || 'کاربر'}
          color="DEFAULT"
        />
        <div className="ms-3">
          <Text tag="h6" className="font-semibold">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-gray-600">{user.username}</Text>
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        <WalletSection />
        {/* <div className="flex flex-row items-center justify-between border-b border-gray-300 px-2.5 pb-5 pt-1">
          <div>کیف پول: {wallet.credit} تومان</div>
          <div>
            <IoMdRefreshCircle size="30" />
          </div>
        </div> */}

        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-600 focus-visible:ring-0"
          variant="text"
          onClick={logout}
        >
          خروج
        </Button>
      </div>
    </div>
  );
}

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
} = {}) {
  const user = useSelector((state: RootState) => state.user);

  return (
    <Popover
      content={() => <DropdownMenu />}
      shadow="sm"
      placement="bottom-end"
      className="z-50 p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100"
    >
      <button
        aria-label="حساب کاربری"
        className={cn(
          'w-9 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
          buttonClassName
        )}
      >
        <Avatar
          src={(user.avatar && STATIC_FILES_URL + user.avatar) || ''}
          name={user.firstName || 'کاربر'}
          color="DEFAULT"
          className={cn(
            '!h-9 w-9 border-2 bg-white shadow-md dark:bg-white sm:!h-10 sm:w-10',
            avatarClassName
          )}
        />
      </button>
    </Popover>
  );
}
