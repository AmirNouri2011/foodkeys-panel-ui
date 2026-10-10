'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import NotificationDropdown from '@/layouts/notification-dropdown';
import { useAuth } from '@/context/AuthContext';
import SettingsButton from '@/components/settings/settings-button';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useWindowScroll } from '@/hooks/use-window-scroll';
import HamburgerButton from '@/layouts/hydrogen/hamburger-button';
import cn from '@/utils/class-names';
import Logo from '@/components/logo';
import { Button } from 'rizzui';
import { useEffect } from 'react';
// import WalletTopUpModal from '@/components/wallet-top-up-modal';
import { PiPlusBold, PiSignOutBold, PiWalletDuotone } from 'react-icons/pi';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useNotifications } from '@/context/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredit } from '@/store/walletSlice';
import styles from './header.module.css';

const formatCredit = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(Number.isFinite(value) ? value : 0);

function HeaderMenuRight() {
  const auth = useAuth() as {
    logout: () => void;
    state: { token: string };
  } | null;
  const pathname = usePathname();
  const router = useRouter();
  const token = auth?.state.token;
  // const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const _axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const credit = useSelector((state: RootState) => state.wallet.credit);

  useEffect(() => {
    if (!token) return;
    let controller: AbortController | undefined;

    const fetchCredit = async () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const response = await _axios.get('/user/credit', {
          signal: request.signal,
        });
        const value = response.data.data;
        if (
          !request.signal.aborted &&
          response.data.status === 'SUCCESS' &&
          value !== null && value !== undefined && value !== ''
        ) {
          const nextCredit = Number(value);
          if (Number.isFinite(nextCredit)) dispatch(setCredit(nextCredit));
        }
      } catch (error) {
        if (!request.signal.aborted)
          console.error('Error fetching wallet credit:', error);
      }
    };

    const refresh = () => void fetchCredit();
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    // A callback may finish updating the balance after the panel has loaded.
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [_axios, dispatch, pathname, token]);

  return (
    <div className="ms-auto flex h-16 shrink-0 items-center gap-1 rounded-2xl border border-gray-200/70 bg-gray-0 p-2 text-gray-600 shadow-sm print:hidden sm:gap-2">
      {/* Notification Bell with unread badge (polling-driven) */}
      <NotificationDropdown>
        <ActionIcon
          aria-label={
            unreadCount > 0
              ? `اعلان‌ها؛ ${unreadCount} اعلان خوانده‌نشده`
              : 'اعلان‌ها'
          }
          variant="text"
          className="relative h-10 w-10 shrink-0 rounded-xl bg-transparent shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/40"
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
              className="absolute -end-0.5 -top-0.5 h-[18px] min-w-[18px] justify-center px-1 text-[10px] font-semibold leading-none"
            >
              <span dir="ltr">
                {unreadCount > 99 ? '۹۹+' : formatCredit(unreadCount)}
              </span>
            </Badge>
          ) : null}
        </ActionIcon>
      </NotificationDropdown>

      {/* Wallet summary and top-up action */}
      {/* <WalletTopUpModal isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
      <div className="flex h-12 items-center gap-2 rounded-xl bg-gray-50 px-1.5 sm:gap-3 sm:px-2">
        <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
          <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary lg:grid">
            <PiWalletDuotone aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1 whitespace-nowrap text-start">
            <span className="text-[10px] font-medium leading-3 text-gray-500">
              موجودی کیف پول
            </span>
            <div className="flex items-baseline gap-1.5 leading-4">
              <strong
                dir="ltr"
                className="text-sm font-bold tabular-nums text-gray-900"
              >
                {formatCredit(credit)}
              </strong>
              <span className="text-[10px] font-normal text-gray-500">
                تومان
              </span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="text"
          onClick={() => router.push('/finance/wallet')}
          className="border-primary/15 h-9 gap-1.5 whitespace-nowrap rounded-lg border bg-primary/10 px-2.5 text-xs font-semibold text-primary shadow-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-3"
          aria-label={`افزایش اعتبار؛ اعتبار فعلی ${formatCredit(
            credit
          )} تومان`}
        >
          <PiPlusBold aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">افزایش اعتبار</span>
          <span className="xs:hidden">افزایش</span>
        </Button>
      </div>

      <div
        aria-hidden="true"
        className="mx-0.5 hidden h-6 w-px bg-gray-200 sm:block"
      />
      <SettingsButton className="h-10 w-10 shrink-0 rounded-xl bg-transparent shadow-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-transparent md:h-10 md:w-10 [&>svg]:h-5 [&>svg]:animate-none" />
      <Button
        type="button"
        variant="text"
        size="sm"
        aria-label="خروج از حساب کاربری"
        onClick={() => auth?.logout()}
        className="h-10 shrink-0 gap-1.5 rounded-xl px-2 text-xs font-semibold text-red transition-colors hover:bg-red/10 focus-visible:ring-2 focus-visible:ring-red/40 sm:px-3"
      >
        <PiSignOutBold aria-hidden="true" className="h-[18px] w-[18px]" />
        <span>خروج</span>
      </Button>
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
      <div className="flex shrink-0 items-center xl:hidden">
        <HamburgerButton />
        <Link href={'/'} className="me-4 w-9 shrink-0 lg:me-5 xl:hidden">
          <Logo iconOnly={true} />
        </Link>
      </div>
      <HeaderMenuRight />
    </header>
  );
}
