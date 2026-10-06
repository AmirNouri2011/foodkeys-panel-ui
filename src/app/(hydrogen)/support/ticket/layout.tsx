import type { ReactNode } from 'react';
import styles from '@/app/shared/support/inbox/support-theme.module.css';

export default function TicketLayout({ children }: { children: ReactNode }) {
  return <div className={styles.theme}>{children}</div>;
}
