'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import BusinessList from '@/app/shared/dashboard2/business-list';
import CreateBusinessDialog from '@/app/shared/dashboard2/create-business-dialog';
import useBusinesses from '@/app/shared/dashboard2/use-businesses';
import styles from '@/app/shared/dashboard2/dashboard.module.css';

export default function BusinessDirectoryPage() {
  const query = useBusinesses(12);
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <div className={styles.dashboard} dir="rtl">
      <div className={styles.pageTop}>
        <div>
          <div className={styles.eyebrow}>
            <Building2 size={14} /> مدیریت کسب‌وکار
          </div>
          <h1>کسب‌وکارها و خدمات ثبت‌شده</h1>
        </div>
      </div>
      <BusinessList
        query={query}
        onCreate={() => setCreateOpen(true)}
        fullPage
      />
      <CreateBusinessDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
