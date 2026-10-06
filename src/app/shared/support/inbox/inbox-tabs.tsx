'use client';

import { useTransition } from 'react';
import { atom, useAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import {
  PiCheckCircle,
  PiClockCountdown,
  PiFiles,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useCreateQueryString } from '@/hooks/use-create-query-string';
import MessageDetails from '@/app/shared/support/inbox/message-details';
import { ticketStatsAtom } from '@/app/shared/support/inbox/message-list';
import styles from './support-theme.module.css';

export const supportNavItems = [
  { value: 'all-open', label: 'همه تیکت‌ها' },
  { value: 'open', label: 'در حال پیگیری' },
  { value: 'closed', label: 'بسته‌شده' },
] as const;

export const tabAtom = atom<string>('open');

export default function InboxTabs({ className }: { className?: string }) {
  return <MessageDetails className={cn(className)} />;
}

export function TabList() {
  const [tab, setTab] = useAtom(tabAtom);
  const [ticketStats] = useAtom(ticketStatsAtom);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { createQueryString } = useCreateQueryString();

  const navItems = [
    {
      value: 'all-open',
      label: 'همه تیکت‌ها',
      hint: 'تمام درخواست‌های ثبت‌شده',
      count: ticketStats.totalTickets || 0,
      icon: PiFiles,
      accent: 'bg-primary-lighter text-primary',
    },
    {
      value: 'open',
      label: 'در حال پیگیری',
      hint: 'نیازمند پاسخ یا بررسی',
      count: ticketStats.openTickets || 0,
      icon: PiClockCountdown,
      accent: styles.pending,
    },
    {
      value: 'closed',
      label: 'بسته‌شده',
      hint: 'درخواست‌های پایان‌یافته',
      count: ticketStats.closedTickets || 0,
      icon: PiCheckCircle,
      accent: styles.answered,
    },
  ];

  function selectTab(nextTab: string) {
    router.push(pathname + '?' + createQueryString('tab', nextTab));
    startTransition(() => setTab(nextTab));
  }

  return (
    <nav
      aria-label="فیلتر وضعیت تیکت‌ها"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = tab === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            disabled={isPending}
            onClick={() => selectTab(item.value)}
            className={cn(
              'group relative overflow-hidden rounded-2xl border px-2 py-3 text-right transition-colors duration-200 sm:p-4',
              isActive
                ? 'border-primary/50 bg-primary-lighter/50 ring-1 ring-primary/10'
                : 'border-gray-200 bg-gray-0 hover:border-primary/30 hover:bg-gray-50 dark:bg-gray-50'
            )}
          >
            <span
              className={cn(
                'absolute inset-y-0 right-0 w-1 rounded-l-full transition-opacity',
                isActive ? 'bg-primary opacity-100' : 'opacity-0'
              )}
            />
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  'hidden h-11 w-11 flex-none place-items-center rounded-xl sm:grid',
                  item.accent
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
                  <span className="whitespace-nowrap text-[10px] font-semibold text-gray-900 sm:text-sm">
                    {item.label}
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-gray-900">
                    {item.count.toLocaleString('fa-IR')}
                  </span>
                </span>
                <span className="mt-1 hidden truncate text-xs text-gray-500 sm:block">
                  {item.hint}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
