'use client';
import { numberToWords } from '@persian-tools/persian-tools';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Button, Modal } from 'rizzui';
import React, { RefObject, useEffect, useState } from 'react';
import { PiPlusBold, PiWalletFill } from 'react-icons/pi';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAxiosPrivate from '@/hooks/use-axios-private';
import addCreditImg2 from 'public/addCreditLogo.webp';
import { useNotifications } from '@/context/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredit } from '@/store/walletSlice';

const formatCredit = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(Number.isFinite(value) ? value : 0);

const normalizeAmount = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
    .slice(0, 14);

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
          aria-label="اعلان‌ها"
          variant="text"
          className="relative h-10 w-10 rounded-xl bg-transparent shadow-none transition-colors hover:bg-gray-100 dark:bg-transparent dark:hover:bg-gray-800"
        >
          <RingBellSolidIcon className="h-[18px] w-auto" />
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
      <WalletDropdown setIsOpen={setIsOpen} isOpen={isOpen}>
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
      </WalletDropdown>

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

// @ts-ignore
function WalletDropdown({
  children,
  setIsOpen,
  isOpen,
}: {
  children: JSX.Element & { ref?: RefObject<any> };
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}) {
  const _axios = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000000');
  const [amountError, setAmountError] = useState('');
  const numericAmount = Number(amount || 0);

  const handleDefaultAmountClick = (value: number) => {
    setAmount(String(value * 1_000_000));
    setAmountError('');
  };

  const handleSubmit = async () => {
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setAmountError('لطفاً یک مبلغ معتبر و بزرگ‌تر از صفر وارد کنید');
      return;
    }
    const startPayment = async () => {
      const API_URL = '/payment/start/3';
      try {
        const response = await _axios.post(API_URL, {
          amount: numericAmount * 10,
          redirectUrl: '/api/v1/client/panel/payment/callback',
          description: 'افزایش شارژ کیف پول',
          mobile: '09352388350',
          email: 'arminm4@gmail.com',
        });

        if (response.data.statusCode === 200) {
          return {
            data: response.data.data,
          };
        } else {
          toast.error('خطا در افزایش اعتبار');
        }
      } catch (error) {
        toast.error('خطا در افزایش اعتبار');
        console.error('Failed to start payment', error);
      }
    };
    setLoading(true);
    let response = await startPayment();
    if (response?.data?.url) window.location.href = response?.data?.url;
    else toast.error('خطا در افزایش اعتبار');
    setLoading(false);
  };
  const defaultAmounts = [1, 5, 10];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customSize="1080px"
      >
        <div className="m-auto rounded-xl bg-gray-50 px-7 pt-8 dark:bg-gray-100 dark:text-white">
          <div className="flex items-center justify-between">
            <h3>افزایش اعتبار کیف پول</h3>
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => setIsOpen(false)}
            >
              <HiXMark className="h-auto w-6" strokeWidth={1.8} />
            </ActionIcon>
          </div>
          <div className="from-blue-500 to-indigo-700 flex max-h-screen items-center justify-center gap-5 bg-gradient-to-br px-1 py-6 text-black dark:bg-gray-100 sm:px-4 lg:gap-20">
            <div className="flex w-full flex-col items-start justify-center md:w-3/5">
              <Input
                label="مبلغ"
                suffix="تومان"
                placeholder="10,000,000"
                inputClassName="text-center"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                dir="ltr"
                className="w-full  dark:text-white"
                value={amount}
                error={amountError}
                onChange={(e) => {
                  setAmount(normalizeAmount(e.target.value));
                  setAmountError('');
                }}
              />
              <div className="flex w-full items-center justify-center gap-1">
                {defaultAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="mt-7 w-full rounded-md border border-black px-[2px] py-2 text-xs shadow-lg transition-all duration-100 ease-in-out hover:bg-gray-200 active:scale-95 dark:bg-[#fff1] dark:text-white dark:hover:bg-[#ffffff34] sm:px-2 sm:text-base lg:px-5"
                    onClick={() => handleDefaultAmountClick(value)}
                  >
                    {value} میلیون تومان
                  </button>
                ))}
              </div>
              <hr className="mt-7 h-[2px] w-full bg-gray-100 " />
              <div className="mt-7 flex items-center justify-center gap-3">
                <Badge color="success" rounded="md">
                  به حروف
                </Badge>
                <p className="font-bold dark:text-white">
                  {numericAmount > 0
                    ? `${String(numberToWords(numericAmount))} تومان`
                    : 'مبلغی وارد نشده است'}
                </p>
              </div>
              <Button
                className="mt-7 w-full  rounded-md  bg-gradient-to-r from-[#a8ff78] to-[#78ffd6] px-5 py-2 text-xl text-black transition-all duration-200 ease-in-out hover:scale-105 active:scale-100"
                onClick={handleSubmit}
                isLoading={loading}
                type="button"
              >
                پرداخت
              </Button>
            </div>
            <div className="hidden w-2/5 items-center justify-center md:flex">
              <Image
                src={addCreditImg2 || null}
                alt="افزایش اعتبار"
                className="w-64"
              />
            </div>
          </div>
        </div>
      </Modal>
      {children}
    </>
  );
}
