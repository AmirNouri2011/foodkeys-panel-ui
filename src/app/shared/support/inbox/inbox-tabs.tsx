'use client';
import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import cn from '@/utils/class-names';
import MessageDetails from '@/app/shared/support/inbox/message-details';
import { ticketStatsAtom } from '@/app/shared/support/inbox/message-list';
import styles from './support-theme.module.css';
export const supportNavItems = [
  { value: 'all-open', label: 'همه تیکت‌ها' },
  { value: 'open', label: 'در انتظار پاسخ' },
  { value: 'closed', label: 'بسته‌شده' },
] as const;
export const tabAtom = atom<string>('all-open');
export default function InboxTabs({ className }: { className?: string }) {
  return <MessageDetails className={cn(className)} />;
}
export function TabList() {
  const [tab, setTab] = useAtom(tabAtom);
  const [stats] = useAtom(ticketStatsAtom);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requestedTab = params.get('tab');
  useEffect(() => {
    setTab(
      supportNavItems.some((item) => item.value === requestedTab)
        ? requestedTab!
        : 'all-open'
    );
  }, [requestedTab, setTab]);
  const counts = [stats.totalTickets, stats.openTickets, stats.closedTickets];
  return (
    <nav aria-label="فیلتر وضعیت تیکت‌ها" className={styles.statusTabs}>
      {supportNavItems.map((item, index) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={tab === item.value}
          className={tab === item.value ? styles.selectedTab : undefined}
          onClick={() => {
            setTab(item.value);
            const next = new URLSearchParams(params.toString());
            next.set('tab', item.value);
            router.replace(pathname + '?' + next.toString(), { scroll: false });
          }}
        >
          {item.label}
          <span>{(counts[index] || 0).toLocaleString('fa-IR')}</span>
        </button>
      ))}
    </nav>
  );
}
