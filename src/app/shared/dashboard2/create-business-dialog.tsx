'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ClipboardList,
  Loader2,
  Search,
  Sprout,
  Store,
  X,
} from 'lucide-react';
import { routes } from '@/config/routes';
import { useServiceSubcategories } from '@/hooks/use-service-subcategories';
import { normalizeSearch } from './dashboard-data';
import styles from './dashboard.module.css';

export default function CreateBusinessDialog({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { subcategories, loading } = useServiceSubcategories();
  const [step, setStep] = useState<'type' | 'service'>('type');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setStep('type');
      setSearch('');
    }
  }, [open]);

  const query = normalizeSearch(search);
  const visibleServices = subcategories.filter((item) =>
    normalizeSearch(
      `${item.subCategoryDisplayName} ${item.subCategoryDescription}`
    ).includes(query)
  );
  const navigate = (href: string) => {
    router.push(href);
    window.setTimeout(() => {
      onClose();
      onNavigate?.();
    }, 0);
  };

  return (
    <Dialog open={open} onClose={onClose} className={styles.dialog}>
      <div className={styles.dialogBackdrop} aria-hidden="true" />
      <div className={styles.dialogPosition}>
        <Dialog.Panel
          className={`${styles.dialogPanel} ${
            step === 'service' ? styles.dialogPanelWide : ''
          }`}
          dir="rtl"
        >
          <div className={styles.dialogHeading}>
            {step === 'service' ? (
              <button
                type="button"
                className={styles.dialogBack}
                onClick={() => {
                  setStep('type');
                  setSearch('');
                }}
                aria-label="بازگشت به انتخاب نوع ثبت"
              >
                <ArrowRight size={18} />
                بازگشت
              </button>
            ) : (
              <span className={`${styles.iconBox} ${styles.green}`}>
                <Building2 size={24} />
              </span>
            )}
            <button onClick={onClose} aria-label="بستن انتخاب حوزه کسب‌وکار">
              <X size={20} />
            </button>
          </div>
          <Dialog.Title as="h2">
            {step === 'service'
              ? 'چه خدمتی می‌خواهید ثبت کنید؟'
              : 'چه چیزی می‌خواهید ثبت کنید؟'}
          </Dialog.Title>
          <Dialog.Description>
            {step === 'service'
              ? 'یکی از دسته‌های خدمات را انتخاب کنید تا مستقیماً فرم ثبت آن باز شود.'
              : 'حوزه فعالیت را انتخاب کنید تا فرم مناسب شما باز شود.'}
          </Dialog.Description>
          {step === 'type' ? (
            <div className={styles.createOptions}>
              <button
                type="button"
                onClick={() => navigate(routes.info.foodIndustryAdd)}
              >
                <Store size={23} />
                <div>
                  <strong>شرکت صنایع غذایی</strong>
                  <small>تولید، تأمین، بسته‌بندی و ماشین‌آلات</small>
                </div>
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate(routes.info.agricultureIndustryAdd)}
              >
                <Sprout size={23} />
                <div>
                  <strong>شرکت صنعت کشاورزی</strong>
                  <small>تولیدات و کسب‌وکارهای کشاورزی</small>
                </div>
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => setStep('service')}>
                <ClipboardList size={23} />
                <div>
                  <strong>خدمت یا آگهی</strong>
                  <small>درخواست، نمایندگی، استخدام و خدمات تخصصی</small>
                </div>
                <ChevronLeft size={18} />
              </button>
            </div>
          ) : (
            <div className={styles.servicePicker}>
              <label className={styles.dialogSearch}>
                <Search size={17} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جست‌وجوی نوع خدمت…"
                  aria-label="جست‌وجوی نوع خدمت"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="پاک کردن جست‌وجوی خدمات"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              {loading && (
                <div className={styles.dialogLoadingCompact} role="status">
                  <Loader2 size={22} className={styles.spin} />
                  در حال به‌روزرسانی دسته‌های خدمات…
                </div>
              )}
              {visibleServices.length ? (
                <div className={styles.serviceGrid}>
                  {visibleServices.map((item) => (
                    <button
                      type="button"
                      key={item.subCategoryId}
                      onClick={() =>
                        navigate(
                          routes.info.serviceIndustrySubCategoryCreate(
                            item.subCategoryName
                          )
                        )
                      }
                    >
                      <span className={styles.serviceChoiceIcon}>
                        <ClipboardList size={19} />
                      </span>
                      <div>
                        <strong>{item.subCategoryDisplayName}</strong>
                        {item.subCategoryDescription && (
                          <small>{item.subCategoryDescription}</small>
                        )}
                      </div>
                      <ChevronLeft size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.dialogEmpty} role="status">
                  {loading
                    ? 'در حال جست‌وجو میان خدمات…'
                    : 'خدمتی با این عنوان پیدا نشد.'}
                </div>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
