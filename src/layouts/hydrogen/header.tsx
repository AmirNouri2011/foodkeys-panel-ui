'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import SearchWidget from '@/components/search/search';
import NotificationDropdown from '@/layouts/notification-dropdown';
import ProfileMenu from '@/layouts/profile-menu';
import SettingsButton from '@/components/settings/settings-button';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useWindowScroll } from '@/hooks/use-window-scroll';
import HamburgerButton from '@/layouts/hydrogen/hamburger-button';
import cn from '@/utils/class-names';
import Logo from '@/components/logo';
import { Button } from 'rizzui';
import { useEffect, useState } from 'react';
import WalletTopUpModal from '@/components/wallet-top-up-modal';
import { PiPlusBold, PiWalletFill } from 'react-icons/pi';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useNotifications } from '@/context/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredit } from '@/store/walletSlice';
import styles from './header.module.css';

const formatCredit = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(Number.isFinite(value) ? value : 0);

function HeaderMenuRight() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const _axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const credit = useSelector((state: RootState) => state.wallet.credit);

  useEffect(() => {
    let active = true;

    const fetchCredit = async () => {
      try {
        const response = await _axios.get('/user/credit');
        if (active && response.data.status === 'SUCCESS') {
          const nextCredit = Number(response.data.data);
          if (Number.isFinite(nextCredit)) dispatch(setCredit(nextCredit));
        }
      } catch (error) {
        console.error('Error fetching wallet credit:', error);
      }
    };

    fetchCredit();
    return () => {
      active = false;
    };
  }, [_axios, dispatch]);

  return (
    <div className="ms-auto flex h-14 shrink-0 items-center gap-1 rounded-2xl border border-gray-200/80 bg-white/90 p-1.5 text-gray-700 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90 print:hidden">
      {/* Notification Bell with unread badge (polling-driven) */}
      <NotificationDropdown>
        <ActionIcon
          aria-label={
            unreadCount > 0
              ? `اعلان‌ها؛ ${unreadCount} اعلان خوانده‌نشده`
              : 'اعلان‌ها'
          }
          variant="text"
          className="relative h-10 w-10 rounded-xl bg-transparent shadow-none transition-colors hover:bg-gray-100 dark:bg-transparent dark:hover:bg-gray-800"
        >
          <RingBellSolidIcon
            aria-hidden="true"
            className={cn(
              'h-[18px] w-auto',
              unreadCount > 0 && styles.unreadBell
            )}
          />
          {unreadCount > 0 ? (
            <Badge
              size="sm"
              color="danger"
              enableOutlineRing
              className="absolute -right-1 -top-1 min-w-[18px] justify-center px-1 text-[10px] leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
        </ActionIcon>
      </NotificationDropdown>

      {/* Prominent wallet credit and top-up action */}
      <WalletTopUpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="flex h-11 items-center gap-2 rounded-xl border border-primary/20 bg-gradient-to-l from-primary-lighter/70 to-primary-lighter/25 px-1.5 dark:from-primary/20 dark:to-primary/5 sm:px-2">
        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black text-white shadow-sm">
            <PiWalletFill className="h-[18px] w-[18px]" />
          </span>
          <div className="flex items-baseline gap-1 whitespace-nowrap leading-none">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              اعتبار شما:
            </span>
            <strong className="text-sm font-extrabold text-gray-900 dark:text-white xl:text-base">
              {formatCredit(credit)}
            </strong>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              تومان
            </span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-8 gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-bold shadow-sm sm:px-3"
          aria-label={`افزایش اعتبار؛ اعتبار فعلی ${formatCredit(
            credit
          )} تومان`}
        >
          <PiPlusBold className="h-4 w-4" />
          <span className="hidden xs:inline">افزایش اعتبار</span>
          <span className="xs:hidden">افزایش</span>
        </Button>
      </div>

      <div className="mx-0.5 hidden h-6 w-px bg-gray-200 dark:bg-gray-700 sm:block" />
      <SettingsButton className="h-10 w-10 rounded-xl bg-transparent shadow-none hover:bg-gray-100 dark:bg-transparent dark:hover:bg-gray-800" />
      <ProfileMenu
        buttonClassName="grid h-10 w-10 place-items-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        avatarClassName="!h-8 !w-8 border-0 shadow-none sm:!h-8 sm:!w-8"
      />
    </div>
  );
}

export default function Header() {
  const isMounted = useIsMounted();
  const windowScroll = useWindowScroll();
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center gap-3 border-b border-gray-100/80 bg-gray-0/90 px-4 py-3 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-50/80 print:hidden md:px-5 lg:px-6 3xl:px-8 4xl:px-10',
        ((isMounted && windowScroll.y) as number) > 2 ? 'card-shadow' : ''
      )}
    >
      <div className="flex min-w-0 flex-1 items-center xl:max-w-2xl">
        <HamburgerButton />
        <Link href={'/'} className="me-4 w-9 shrink-0 lg:me-5 xl:hidden">
          <Logo iconOnly={true} />
        </Link>
        <SearchWidget />
      </div>
      <HeaderMenuRight />
    </header>
  );
}
