'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  PiArrowLeft,
  PiArrowClockwise,
  PiMagnifyingGlass,
  PiStack,
  PiCheckCircle,
  PiClock,
  PiWarningCircle,
  PiHeadset,
  PiX,
  PiListBullets,
  PiSquaresFour,
  PiCaretLeft,
  PiCaretDown,
  PiInfo,
} from 'react-icons/pi';
import UpgradeStorage, {
  type SubscriptionItem,
} from '@/app/shared/bundle/upgrade-storage';
import styles from '@/app/shared/bundle/subscriptions.module.css';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { routes } from '@/config/routes';

type StatusFilter = 'ALL' | 'DISABLE' | 'ACTIVE' | 'PENDING';
const statuses = [
  {
    value: 'ALL',
    label: 'همه اشتراک‌ها',
    hint: 'تمام دسترسی‌های شما',
    icon: PiStack,
  },
  {
    value: 'ACTIVE',
    label: 'فعال',
    hint: 'آمادهٔ استفاده',
    icon: PiCheckCircle,
  },
  {
    value: 'PENDING',
    label: 'در انتظار تأیید',
    hint: 'در حال بررسی درخواست',
    icon: PiClock,
  },
  {
    value: 'DISABLE',
    label: 'غیرفعال',
    hint: 'دسترسی غیرفعال است',
    icon: PiWarningCircle,
  },
] as const;

function normalizeSearch(value: string) {
  return value
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[,٬]/g, '')
    .replace(/[\u200c\s]+/g, ' ')
    .trim()
    .toLowerCase();
}
const isRenewable = (item: SubscriptionItem) =>
  item.subscriptionStatus === 'DISABLE' &&
  item.renewable !== false &&
  item.subCategoryId != null;
const number = (value: number) => value.toLocaleString('fa-IR');

export default function SubscriptionListPage() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [renewalOnly, setRenewalOnly] = useState(false);
  const [sort, setSort] = useState('priority');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const listRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const axios = useAxiosPrivate();

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    async function fetchSubscriptions() {
      try {
        const response = await axios.get('/subscription', {
          signal: controller.signal,
        });
        if (
          response.data.status !== 'SUCCESS' ||
          !Array.isArray(response.data.data ?? [])
        )
          throw new Error('Unable to load subscriptions');
        if (!controller.signal.aborted) {
          setItems(response.data.data ?? []);
          setLastUpdated(new Date());
        }
      } catch {
        if (!controller.signal.aborted) setHasError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void fetchSubscriptions();
    return () => controller.abort();
  }, [axios, reloadKey]);

  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();
    items.forEach((item) => {
      if (item.subCategoryId != null)
        categories.set(
          String(item.subCategoryId),
          item.subCategoryName || 'بانک اطلاعاتی'
        );
    });
    return Array.from(categories, ([value, label]) => ({ value, label }));
  }, [items]);

  const scopedItems = useMemo(() => {
    const terms = normalizeSearch(query).split(' ').filter(Boolean);
    return items.filter((item) => {
      if (categoryFilter && String(item.subCategoryId) !== categoryFilter)
        return false;
      const text = normalizeSearch(
        `${item.subCategoryName ?? ''} ${item.bundleTitle ?? ''}`
      );
      return terms.every((term) => text.includes(term));
    });
  }, [items, query, categoryFilter]);

  const filteredItems = useMemo(
    () =>
      scopedItems
        .filter(
          (item) =>
            (statusFilter === 'ALL' ||
              item.subscriptionStatus === statusFilter) &&
            (!renewalOnly || isRenewable(item))
        )
        .sort((a, b) => {
          if (sort === 'name')
            return (a.subCategoryName || '').localeCompare(
              b.subCategoryName || '',
              'fa'
            );
          const priority = (item: SubscriptionItem) => {
            if (sort === 'active')
              return item.subscriptionStatus === 'ACTIVE' ? 0 : 1;
            if (isRenewable(item)) return 0;
            if (item.subscriptionStatus === 'ACTIVE') return 1;
            if (item.subscriptionStatus === 'PENDING') return 2;
            return 3;
          };
          return priority(a) - priority(b);
        }),
    [scopedItems, statusFilter, renewalOnly, sort]
  );

  const renewalCount = items.filter(isRenewable).length;
  const hasActiveFilters =
    statusFilter !== 'ALL' || !!categoryFilter || !!query.trim() || renewalOnly;
  const initialLoading = isLoading && !lastUpdated;
  const unavailable = !lastUpdated;

  function clearFilters() {
    setStatusFilter('ALL');
    setCategoryFilter('');
    setQuery('');
    setRenewalOnly(false);
  }
  function showStatus(status: StatusFilter, onlyRenewable = false) {
    clearFilters();
    setStatusFilter(status);
    setRenewalOnly(onlyRenewable);
    listRef.current?.scrollIntoView({ block: 'start' });
    listRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className={styles.theme} dir="rtl">
      <header className={styles.pageHeader}>
        <nav aria-label="مسیر صفحه" className={styles.breadcrumb}>
          <Link href="/">میز کار</Link>
          <PiCaretLeft aria-hidden="true" />
          <span aria-current="page">اشتراک‌های من</span>
        </nav>
        <div className={styles.headingLine}>
          <div>
            <span className={styles.eyebrow}>مدیریت دسترسی‌ها</span>
            <h1 className={styles.pageTitle}>
              اشتراک‌های من
              <span className={styles.titleDot} aria-hidden="true">
                .
              </span>
            </h1>
            <p className={styles.pageDescription}>
              وضعیت، امکانات و اعتبار اشتراک‌هایتان را یک‌جا مدیریت کنید.
            </p>
          </div>
          <Link href={routes.support.ticket} className={styles.supportAction}>
            <PiHeadset aria-hidden="true" />
            راهنمایی و پشتیبانی
            <PiArrowLeft aria-hidden="true" />
          </Link>
        </div>
      </header>
      <section aria-label="خلاصهٔ وضعیت اشتراک‌ها" className={styles.overview}>
        {statuses.map(({ value, label, hint, icon: Icon }) => (
          <button
            type="button"
            key={value}
            className={styles.statCard}
            data-tone={value}
            onClick={() => showStatus(value)}
            disabled={unavailable}
          >
            <span className={styles.statTop}>
              <span>{value === 'ALL' ? 'مجموع اشتراک‌ها' : label}</span>
              <Icon aria-hidden="true" />
            </span>
            <span className={styles.statBottom}>
              <strong>
                {unavailable
                  ? '—'
                  : number(
                      value === 'ALL'
                        ? items.length
                        : items.filter(
                            (item) => item.subscriptionStatus === value
                          ).length
                    )}
              </strong>
              <PiArrowLeft aria-hidden="true" />
            </span>
            <span className={styles.statHint}>{hint}</span>
          </button>
        ))}
      </section>
      {!unavailable && renewalCount > 0 && (
        <section
          aria-label="اشتراک‌های قابل تمدید"
          className={styles.renewalNotice}
        >
          <span className={styles.noticeIcon}>
            <PiArrowClockwise aria-hidden="true" />
          </span>
          <p>
            <strong>{number(renewalCount)} اشتراک شما قابل تمدید است.</strong>
            <span> برای دسترسی دوباره، پلن مناسب خود را انتخاب کنید.</span>
          </p>
          <button type="button" onClick={() => showStatus('DISABLE', true)}>
            بررسی و تمدید
            <PiArrowLeft aria-hidden="true" />
          </button>
        </section>
      )}
      <section
        id="subscriptions"
        ref={listRef}
        tabIndex={-1}
        aria-label="فهرست اشتراک‌های شما"
        className={styles.panel}
      >
        <div className={styles.panelTitleRow}>
          <div className={styles.panelHeading}>
            <PiStack aria-hidden="true" />
            <h2>فهرست اشتراک‌ها</h2>
            <span>{unavailable ? '—' : number(items.length)}</span>
          </div>
          <div className={styles.updateControls}>
            {lastUpdated && (
              <span className={styles.updateTime}>
                آخرین به‌روزرسانی{' '}
                {lastUpdated.toLocaleTimeString('fa-IR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Tehran',
                })}
              </span>
            )}
            <button
              type="button"
              className={styles.refreshButton}
              aria-label="به‌روزرسانی اشتراک‌ها"
              disabled={isLoading}
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <PiArrowClockwise
                aria-hidden="true"
                className={isLoading ? styles.spinning : undefined}
              />
              <span>به‌روزرسانی</span>
            </button>
          </div>
        </div>
        <div
          role="group"
          aria-label="فیلتر وضعیت اشتراک"
          className={styles.statusTabs}
        >
          {statuses.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={statusFilter === value}
              className={styles.tab}
              onClick={() => {
                setStatusFilter(value);
                setRenewalOnly(false);
              }}
            >
              {value !== 'ALL' && <i aria-hidden="true" data-tone={value} />}
              {label}
              <span>
                {unavailable
                  ? '—'
                  : number(
                      value === 'ALL'
                        ? scopedItems.length
                        : scopedItems.filter(
                            (item) => item.subscriptionStatus === value
                          ).length
                    )}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.toolbar}>
          <div className={styles.searchInput}>
            <PiMagnifyingGlass aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="جست‌وجو در اشتراک‌ها"
              placeholder="جست‌وجوی نام بانک یا پلن اشتراک…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="پاک کردن جست‌وجو"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                <PiX aria-hidden="true" />
              </button>
            )}
          </div>
          <div className={styles.selectField}>
            <select
              aria-label="بانک اطلاعاتی"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">همه بانک‌های اطلاعاتی</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <PiCaretDown aria-hidden="true" />
          </div>
          <div
            role="group"
            aria-label="شیوه نمایش اشتراک‌ها"
            className={styles.viewToggle}
          >
            <button
              type="button"
              aria-label="نمایش فهرستی"
              title="نمایش فهرستی"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <PiListBullets aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="نمایش کارتی"
              title="نمایش کارتی"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <PiSquaresFour aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={styles.resultsLine}>
          <div className={styles.resultInfo}>
            <span role="status" aria-live="polite">
              {initialLoading ? (
                'در حال دریافت اشتراک‌ها…'
              ) : unavailable ? (
                'دریافت اطلاعات ناموفق بود'
              ) : isLoading ? (
                'در حال به‌روزرسانی…'
              ) : (
                <>
                  نمایش <b>{number(filteredItems.length)}</b> از{' '}
                  {number(items.length)} اشتراک
                </>
              )}
            </span>
            {renewalOnly && (
              <button
                type="button"
                className={styles.filterChip}
                onClick={() => setRenewalOnly(false)}
                aria-label="حذف فیلتر قابل تمدید"
              >
                قابل تمدید
                <PiX aria-hidden="true" />
              </button>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearFilters}
                onClick={clearFilters}
              >
                حذف فیلترها
                <PiX aria-hidden="true" />
              </button>
            )}
          </div>
          <label className={styles.sortField}>
            مرتب‌سازی:
            <select
              aria-label="مرتب‌سازی اشتراک‌ها"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="priority">اولویت تمدید</option>
              <option value="active">ابتدا فعال‌ها</option>
              <option value="name">نام بانک اطلاعاتی</option>
            </select>
          </label>
        </div>
        {hasError && lastUpdated && (
          <div role="alert" className={styles.refreshError}>
            <PiInfo aria-hidden="true" />
            به‌روزرسانی انجام نشد؛ آخرین اطلاعات دریافتی نمایش داده می‌شود.
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              تلاش دوباره
            </button>
          </div>
        )}
        {hasError && unavailable ? (
          <div role="alert" className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <PiWarningCircle aria-hidden="true" />
            </span>
            <h3>اطلاعات اشتراک‌ها دریافت نشد</h3>
            <p>اتصال خود را بررسی کنید و دوباره تلاش کنید.</p>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <PiArrowClockwise aria-hidden="true" />
              تلاش دوباره
            </button>
          </div>
        ) : (
          <UpgradeStorage
            items={filteredItems}
            isLoading={initialLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            view={view}
          />
        )}
        {!unavailable && filteredItems.length > 0 && (
          <div className={styles.panelFooter}>
            <PiInfo aria-hidden="true" />
            برای مشاهدهٔ امکانات و وضعیت دسترسی، «جزئیات» هر اشتراک را باز کنید.
          </div>
        )}
      </section>
      <section
        className={styles.helpSection}
        aria-labelledby="subscription-help-title"
      >
        <div className={styles.helpIntro}>
          <span className={styles.helpIcon}>
            <PiHeadset aria-hidden="true" />
          </span>
          <div>
            <h2 id="subscription-help-title">پاسخ چند سؤال کوتاه</h2>
            <p>برای مدیریت راحت‌تر اشتراک‌ها</p>
          </div>
          <Link href={routes.support.ticket}>
            ارتباط با پشتیبانی
            <PiArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.faqGrid}>
          <details className={styles.faq}>
            <summary>
              چطور اشتراکم را تمدید کنم؟
              <PiCaretDown aria-hidden="true" />
            </summary>
            <p>
              روی «تمدید اشتراک» بزنید، پلن‌های موجود را بررسی کنید و مراحل خرید
              را ادامه دهید. اگر پلن فعلی قابل تمدید نیست، از «مشاهده پلن‌ها»
              استفاده کنید.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>
              «در انتظار تأیید» یعنی چه؟
              <PiCaretDown aria-hidden="true" />
            </summary>
            <p>
              درخواست شما هنوز تأیید نشده است. پس از تأیید، دسترسی فعال می‌شود.
              برای بررسی وضعیت درخواست می‌توانید با پشتیبانی ارتباط بگیرید.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>
              امکانات هر اشتراک را کجا ببینم؟
              <PiCaretDown aria-hidden="true" />
            </summary>
            <p>
              دکمهٔ «جزئیات» کنار هر اشتراک، امکانات همان پلن و توضیح وضعیت
              دسترسی شما را نمایش می‌دهد.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
