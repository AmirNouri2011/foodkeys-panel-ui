'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDownToLine,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { CLIENT_WEBSITE_URL, STATIC_FILES_URL } from '@/config/api.config';
import {
  businessEditHref,
  businessKindLabel,
  companiesCsv,
  companyStatuses,
  faNumber,
  paymentStatuses,
  type DashboardCompany,
} from './dashboard-data';
import { routes } from '@/config/routes';
import styles from './dashboard.module.css';
import type useBusinesses from './use-businesses';

function BusinessLogo({ item }: { item: DashboardCompany }) {
  const [failed, setFailed] = useState(false);
  const src =
    item.logo?.startsWith('https://') || item.logo?.startsWith('http://')
      ? item.logo
      : `${STATIC_FILES_URL}${item.logo}`;
  return (
    <span className={styles.companyLogo}>
      {item.logo && !failed ? (
        <Image
          src={src}
          alt=""
          width={40}
          height={40}
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <Building2 size={21} />
      )}
    </span>
  );
}

export default function BusinessList({
  query,
  onCreate,
  fullPage = false,
}: {
  query: ReturnType<typeof useBusinesses>;
  onCreate: () => void;
  fullPage?: boolean;
}) {
  const { input: search, setInput: setSearch, page, setPage, pageSize } = query;
  const visible = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = query.data?.pages ?? 1;
  const currentPage = page;
  const loading = query.isLoading || query.searching;
  const error = query.isError;
  const fetching = query.isFetching || query.searching;
  const onRetry = () => void query.refetch();
  function download() {
    const url = URL.createObjectURL(
      new Blob([companiesCsv(visible)], { type: 'text/csv;charset=utf-8;' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `foodkeys-businesses-page-${page}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      className={styles.panel}
      id="my-companies"
      aria-label="کسب‌وکارها و خدمات من"
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2>
            <Building2 size={18} />
            کسب‌وکارها و خدمات من
          </h2>
          <p>تمام شرکت‌ها، خدمات و آگهی‌های ثبت‌شده شما، در یک نگاه</p>
        </div>
        <button className={styles.smallButton} onClick={onCreate}>
          <Plus size={15} />
          ثبت جدید
        </button>
      </div>
      <div className={styles.companyToolbar}>
        <span className={styles.directoryScope}>
          <Building2 size={16} /> همه حوزه‌های فعالیت
        </span>
        <label className={styles.search}>
          <Search size={16} />
          <input
            type="search"
            aria-label="جست‌وجوی کسب‌وکار و خدمات"
            placeholder="جست‌وجوی کسب‌وکار یا خدمت…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              aria-label="پاک کردن جست‌وجو"
            >
              <X size={14} />
            </button>
          )}
        </label>
      </div>
      {loading ? (
        <div className={styles.feedback} role="status">
          <Loader2 size={24} className={styles.spin} />
          در حال دریافت کسب‌وکارها و خدمات…
        </div>
      ) : error ? (
        <div className={styles.feedback} role="status">
          <CircleHelp size={26} />
          <p>دریافت فهرست کسب‌وکارها و خدمات ممکن نشد.</p>
          <button className={styles.smallButton} onClick={onRetry}>
            تلاش دوباره
          </button>
        </div>
      ) : !visible.length ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Building2 size={29} />
          </span>
          <h3>
            {search
              ? 'نتیجه‌ای با این فیلتر پیدا نشد'
              : 'جای کسب‌وکارتان اینجاست'}
          </h3>
          <p>
            {search
              ? 'نام دیگری را جست‌وجو کنید یا همه موارد را ببینید.'
              : 'شرکت یا خدمت خود را ثبت کنید و حضور حرفه‌ای‌تان را بسازید.'}
          </p>
          {search ? (
            <button
              className={styles.smallButton}
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
            >
              نمایش همه
            </button>
          ) : (
            <button className={styles.smallButton} onClick={onCreate}>
              <Plus size={16} />
              ثبت کسب‌وکار یا خدمت
            </button>
          )}
        </div>
      ) : (
        <div className={styles.companyList}>
          {visible.map((item) => {
            const status = companyStatuses[item.companyStatus || ''] || {
              label: item.statusLabel || 'وضعیت نامشخص',
              tone: 'neutral',
            };
            const editHref = businessEditHref(item);
            const publicHref =
              item.companyStatus === 'PUBLISHED' &&
              item.subCategoryNameEn &&
              (item.kind === 'company' || item.hasDetailsPage)
                ? `${CLIENT_WEBSITE_URL}/view/${encodeURIComponent(
                    item.subCategoryNameEn
                  )}/details?id=${item.id}`
                : null;
            return (
              <article className={styles.companyRow} key={item.key}>
                <BusinessLogo item={item} />
                <div className={styles.companyIdentity}>
                  {editHref ? (
                    <Link href={editHref}>{item.companyName}</Link>
                  ) : (
                    <strong>{item.companyName}</strong>
                  )}
                  <span title={item.subCategory || ''}>
                    {item.subCategory?.replace(/^بانک اطلاعات\s*/, '') ||
                      (item.kind === 'service' ? 'خدمت و آگهی' : 'کسب‌وکار')}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[status.tone]}`}>
                  <i />
                  {status.label}
                </span>
                <span
                  className={styles.recordType}
                  title={item.categoryLabel || undefined}
                >
                  {businessKindLabel(item)}
                </span>
                <div className={styles.rowActions}>
                  {paymentStatuses.has(item.companyStatus || '') ? (
                    <Link
                      href={routes.subscriptionList}
                      title="بررسی اشتراک"
                      aria-label={`بررسی اشتراک ${item.companyName}`}
                    >
                      <CircleHelp size={16} />
                    </Link>
                  ) : (
                    publicHref && (
                      <a
                        href={publicHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="مشاهده صفحه عمومی"
                        aria-label={`مشاهده صفحه ${item.companyName}`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )
                  )}
                  {editHref && (
                    <Link
                      href={editHref}
                      title="ویرایش اطلاعات"
                      aria-label={`ویرایش ${item.companyName}`}
                    >
                      <Pencil size={16} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className={styles.companyFooter}>
        <span role="status">
          {!loading && !error
            ? total
              ? `نمایش ${faNumber(
                  (currentPage - 1) * pageSize + 1
                )} تا ${faNumber(
                  Math.min(currentPage * pageSize, total)
                )} از ${faNumber(total)} مورد`
              : 'بدون نتیجه'
            : 'شرکت‌ها، خدمات و آگهی‌ها'}
        </span>
        {pages > 1 && (
          <div className={styles.pagination}>
            <button
              aria-label="صفحه قبلی کسب‌وکارها"
              disabled={currentPage === 1 || fetching}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              aria-label="صفحه بعدی کسب‌وکارها"
              disabled={currentPage >= pages || fetching}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
        <button
          className={styles.exportButton}
          onClick={download}
          disabled={loading || error || !total || fetching}
        >
          <ArrowDownToLine size={15} />
          خروجی این صفحه
        </button>
      </div>
      {!fullPage && (
        <div className={styles.otherBusinesses}>
          <span>همه اطلاعات در یک جا</span>
          <Link href={routes.info.dashboard}>
            رفتن به فهرست کامل <ChevronLeft size={13} />
          </Link>
        </div>
      )}
    </section>
  );
}
