'use client';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { TabList } from '@/app/shared/support/inbox/inbox-tabs';
import SupportInbox from '@/app/shared/support/inbox';
import styles from '@/app/shared/support/inbox/support-theme.module.css';
export default function SupportInboxPage() {
  return (
    <div dir="rtl">
      <header className={styles.inboxHeader}>
        <div>
          <h1>تیکت‌های من</h1>
          <p>درخواست‌ها و پاسخ‌های پشتیبانی را اینجا دنبال کنید.</p>
        </div>
        <Link href={routes.support.createTicket} className={styles.newTicket}>
          <PiPlusBold />
          ثبت تیکت جدید
        </Link>
      </header>
      <TabList />
      <SupportInbox refetchTickets={0} />
    </div>
  );
}
