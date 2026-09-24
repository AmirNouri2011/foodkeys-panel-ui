'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

import { STATIC_FILES_URL } from '@/config/api.config';
import cn from '@/utils/class-names';

function DropdownMenu() {
  const user = useSelector((state: RootState) => state.user);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const phone = user.phone || user.phoneNumbers?.[0] || user.phones?.[0];
  // @ts-ignore
  const { logout } = useAuth();

  return (
    <div className="w-[320px] text-left rtl:text-right">
      <div className="flex items-center gap-4 px-7 py-7">
        <Avatar
          // @ts-ignore
          src={(user.avatar && STATIC_FILES_URL + user.avatar) || ''}
          name={user.firstName || 'کاربر'}
          color="DEFAULT"
          className="!h-16 !w-16 shrink-0 border-2 border-white shadow-md"
        />
        <div className="min-w-0">
          <Text
            tag="h5"
            className="truncate text-xl font-extrabold text-gray-900 dark:text-white"
          >
            {fullName || 'کاربر فودکیز'}
          </Text>
          <div dir="ltr" className="mt-2 text-right">
            <Text className="text-base font-medium text-gray-600 dark:text-gray-400">
              {phone || 'شماره موبایل ثبت نشده'}
            </Text>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-5 dark:border-gray-700">
        <Button
          type="button"
          className="h-12 w-full justify-center rounded-xl text-base font-bold"
          variant="outline"
          color="danger"
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
