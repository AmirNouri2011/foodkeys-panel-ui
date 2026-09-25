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
      accent: 'bg-blue-lighter text-blue-dark',
    },
    {
      value: 'open',
      label: 'در حال پیگیری',
      hint: 'نیازمند پاسخ یا بررسی',
      count: ticketStats.openTickets || 0,
      icon: PiClockCountdown,
      accent: 'bg-orange-lighter text-orange-dark',
    },
    {
      value: 'closed',
      label: 'بسته‌شده',
      hint: 'درخواست‌های پایان‌یافته',
      count: ticketStats.closedTickets || 0,
      icon: PiCheckCircle,
      accent: 'bg-green-lighter text-green-dark',
    },
  ];

  function selectTab(nextTab: string) {
    router.push(pathname + '?' + createQueryString('tab', nextTab));
    startTransition(() => setTab(nextTab));
  }

  return (
    <nav
      aria-label="فیلتر وضعیت تیکت‌ها"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
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
              'group relative overflow-hidden rounded-2xl border bg-white p-4 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-50',
              isActive
                ? 'border-primary ring-2 ring-primary/10'
                : 'border-gray-200 hover:border-gray-300'
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
                  'grid h-11 w-11 flex-none place-items-center rounded-xl',
                  item.accent
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-gray-900">
                    {item.count.toLocaleString('fa-IR')}
                  </span>
                </span>
                <span className="mt-1 block truncate text-xs text-gray-500">
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
