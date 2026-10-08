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
  PiShieldCheck,
  PiX,
} from 'react-icons/pi';
import UpgradeStorage, {
  type SubscriptionItem,
} from '@/app/shared/bundle/upgrade-storage';
import styles from '@/app/shared/bundle/subscriptions.module.css';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import useAxiosPrivate from '@/hooks/use-axios-private';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';

type StatusFilter = 'ALL' | 'DISABLE' | 'ACTIVE' | 'PENDING';
const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'همه اشتراک‌ها', value: 'ALL' },
  { label: 'فعال', value: 'ACTIVE' },
  { label: 'غیرفعال', value: 'DISABLE' },
  { label: 'در انتظار تایید', value: 'PENDING' },
];

function normalizeSearch(value: string) {
  return value
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .trim()
    .toLowerCase();
}

export default function ProfileSettingsFormPage() {
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<SelectOption | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');
  const [renewalOnly, setRenewalOnly] = useState(false);
  const [sort, setSort] = useState('priority');
  const listRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const axios = useAxiosPrivate();

  useEffect(() => {
    let current = true;
    async function fetchSubscriptions() {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await axios.get('/subscription');
        if (response.data.status !== 'SUCCESS')
          throw new Error('Unable to load subscriptions');
        if (current) setItems(response.data.data ?? []);
      } catch {
        if (current) setHasError(true);
      } finally {
        if (current) setIsLoading(false);
      }
    }
    fetchSubscriptions();
    return () => {
      current = false;
    };
  }, [axios, reloadKey]);

  useEffect(() => {
    let current = true;
    async function fetchCategories() {
      try {
        const response = await axios.get('/subcategory/options');
        if (current && response.data.status === 'SUCCESS')
          setCategories(response.data.data ?? []);
      } catch {
        // Categories from the subscriptions keep the filter usable if options fail.
      }
    }
    fetchCategories();
    return () => {
      current = false;
    };
  }, [axios]);

  const categoryOptions = useMemo(() => {
    const options = new Map<string, SelectOption>();
    const categoryNames = new Map(
      categories.map((category) => [String(category.value), category])
    );
    items.forEach((item) => {
      if (
        item.subCategoryId != null &&
        !options.has(String(item.subCategoryId))
      ) {
        options.set(String(item.subCategoryId), {
          ...(categoryNames.get(String(item.subCategoryId)) ?? {
            name: item.subCategoryName || 'بانک اطلاعاتی',
            value: item.subCategoryId,
          }),
        });
      }
    });
    return [
      { name: 'همه بانک‌های اطلاعاتی', value: '' },
      ...Array.from(options.values()),
    ];
  }, [categories, items]);

  const scopedItems = useMemo(() => {
    const search = normalizeSearch(query);
    return items.filter((item) => {
      if (
        categoryFilter &&
        String(item.subCategoryId) !== String(categoryFilter.value)
      )
        return false;
      if (
        renewalOnly &&
        (item.subscriptionStatus !== 'DISABLE' || item.renewable === false)
      )
        return false;
      return (
        !search ||
        normalizeSearch(
          `${item.subCategoryName ?? ''} ${item.bundleTitle ?? ''}`
        ).includes(search)
      );
    });
  }, [items, categoryFilter, query, renewalOnly]);
  const counts = useMemo(
    () => ({
      ALL: scopedItems.length,
      DISABLE: scopedItems.filter(
        (item) => item.subscriptionStatus === 'DISABLE'
      ).length,
      ACTIVE: scopedItems.filter((item) => item.subscriptionStatus === 'ACTIVE')
        .length,
      PENDING: scopedItems.filter(
        (item) => item.subscriptionStatus === 'PENDING'
      ).length,
    }),
    [scopedItems]
  );
  const filteredItems = scopedItems
    .filter(
      (item) =>
        statusFilter === 'ALL' || item.subscriptionStatus === statusFilter
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
        if (item.subscriptionStatus === 'DISABLE' && item.renewable !== false)
          return 0;
        if (item.subscriptionStatus === 'ACTIVE') return 1;
        if (item.subscriptionStatus === 'PENDING') return 2;
        return 3;
      };
      return priority(a) - priority(b);
    });
  const renewalCount = items.filter(
    (item) => item.subscriptionStatus === 'DISABLE' && item.renewable !== false
  ).length;
  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    Boolean(categoryFilter) ||
    Boolean(query.trim()) ||
    renewalOnly;
  const overview = [
    {
      label: 'کل اشتراک‌ها',
      value: 'ALL' as const,
      count: items.length,
      icon: PiStack,
      tone: 'total',
      hint: 'تمام بانک‌های شما',
    },
    {
      label: 'اشتراک فعال',
      value: 'ACTIVE' as const,
      count: items.filter((item) => item.subscriptionStatus === 'ACTIVE')
        .length,
      icon: PiCheckCircle,
      tone: 'active',
      hint: 'آمادهٔ استفاده',
    },
    {
      label: 'اشتراک غیرفعال',
      value: 'DISABLE' as const,
      count: items.filter((item) => item.subscriptionStatus === 'DISABLE')
        .length,
      icon: PiWarningCircle,
      tone: 'inactive',
      hint: 'نیازمند بررسی وضعیت',
    },
    {
      label: 'در انتظار تأیید',
      value: 'PENDING' as const,
      count: items.filter((item) => item.subscriptionStatus === 'PENDING')
        .length,
      icon: PiClock,
      tone: 'pending',
      hint: 'در انتظار فعال‌سازی',
    },
  ];

  function clearFilters() {
    setStatusFilter('ALL');
    setCategoryFilter(null);
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
          <span aria-hidden="true">/</span>
          <span>مدیریت اشتراک</span>
        </nav>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <PiShieldCheck aria-hidden="true" /> فضای اشتراک‌های شما
            </span>
            <div className={styles.headingLine}>
              <div>
                <h1 className={styles.pageTitle}>مدیریت اشتراک</h1>
                <p className={styles.pageDescription}>
                  همهٔ دسترسی‌ها، در یک نگاه.
                  <span>
                    وضعیت اشتراک‌ها را ببینید، امکانات را بررسی کنید و به‌موقع
                    تمدید کنید.
                  </span>
                </p>
              </div>
            </div>
            <div className={styles.heroActions}>
              <a href="#subscriptions" className={styles.heroAction}>
                مشاهدهٔ اشتراک‌ها <PiArrowLeft aria-hidden="true" />
              </a>
              <Link href={routes.support.ticket} className={styles.heroSupport}>
                <PiHeadset aria-hidden="true" /> راهنمایی و پشتیبانی
              </Link>
            </div>
          </div>
          <div className={styles.heroArtwork} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.artCard}>
              <PiStack />
              <span>اشتراک‌های فودکیز</span>
              <i />
              <i />
              <span className={styles.artCheck}>
                <PiCheckCircle /> مدیریت یکپارچهٔ دسترسی‌ها
              </span>
            </div>
            <span className={styles.artFloat}>
              <PiShieldCheck />
            </span>
          </div>
        </div>
      </header>

      <section aria-label="خلاصهٔ وضعیت اشتراک‌ها" className={styles.overview}>
        {overview.map(({ label, value, count, icon: Icon, tone, hint }) => (
          <button
            key={value}
            type="button"
            className={styles.statCard}
            data-tone={tone}
            onClick={() => showStatus(value)}
            disabled={isLoading || hasError}
          >
            <span className={styles.statIcon}>
              <Icon aria-hidden="true" />
            </span>
            <span className={styles.statContent}>
              <span>{label}</span>
              <strong>
                {isLoading || hasError ? '—' : count.toLocaleString('fa-IR')}
              </strong>
              <small>{hint}</small>
            </span>
            <PiArrowLeft className={styles.statArrow} aria-hidden="true" />
          </button>
        ))}
      </section>

      {!isLoading && !hasError && renewalCount > 0 && (
        <section
          aria-label="اشتراک‌های نیازمند تمدید"
          className={styles.renewalNotice}
        >
          <div className={styles.noticeContent}>
            <span className={styles.noticeIcon}>
              <PiWarningCircle aria-hidden="true" />
            </span>
            <div>
              <h2>
                {renewalCount.toLocaleString('fa-IR')} اشتراک غیرفعال، قابل
                تمدید است
              </h2>
              <p>
                با تمدید اشتراک، دوباره به اطلاعات بانک موردنظر دسترسی داشته
                باشید.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.noticeAction}
            onClick={() => showStatus('DISABLE', true)}
          >
            بررسی و تمدید <PiArrowLeft aria-hidden="true" />
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
            <span className={styles.panelIcon}>
              <PiStack aria-hidden="true" />
            </span>
            <div>
              <h2>اشتراک‌های من</h2>
              <p>مدیریت دسترسی شما به بانک‌های اطلاعاتی</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="به‌روزرسانی اشتراک‌ها"
            className={styles.refreshButton}
            disabled={isLoading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <PiArrowClockwise aria-hidden="true" />
            <span>به‌روزرسانی</span>
          </button>
        </div>
        <div className={styles.panelTop}>
          <div className={styles.filters}>
            <div className={styles.searchField}>
              <label htmlFor="subscription-search">جست‌وجو در اشتراک‌ها</label>
              <div className={styles.searchInput}>
                <PiMagnifyingGlass aria-hidden="true" />
                <input
                  id="subscription-search"
                  type="search"
                  placeholder="نام بانک یا پلن را بنویسید…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <SelectBox
              label="بانک اطلاعاتی"
              value={categoryFilter ?? categoryOptions[0]}
              options={categoryOptions}
              onChange={(selected: SelectOption) =>
                setCategoryFilter(selected.value !== '' ? selected : null)
              }
              className={styles.bankFilter}
              labelClassName={styles.filterLabel}
              selectClassName={styles.bankSelect}
              dropdownClassName={styles.bankDropdown}
            />
          </div>
        </div>
        <div className={styles.tabsLine}>
          <div
            role="group"
            aria-label="فیلتر وضعیت اشتراک"
            className={styles.statusTabs}
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  styles.tab,
                  statusFilter === option.value && styles.selectedTab
                )}
              >
                {option.label}
                <span>
                  {isLoading || hasError
                    ? '—'
                    : counts[option.value].toLocaleString('fa-IR')}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.resultsLine}>
          <div className={styles.resultInfo}>
            <span role="status">
              {isLoading
                ? 'در حال دریافت اشتراک‌ها…'
                : hasError
                ? 'دریافت اطلاعات ناموفق بود'
                : `${filteredItems.length.toLocaleString(
                    'fa-IR'
                  )} اشتراک از ${items.length.toLocaleString('fa-IR')} اشتراک`}
            </span>
            {renewalOnly && (
              <button
                type="button"
                className={styles.filterChip}
                onClick={() => setRenewalOnly(false)}
              >
                قابل تمدید <PiX aria-label="حذف فیلتر قابل تمدید" />
              </button>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={styles.clearFilters}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <label className={styles.sortField}>
            مرتب‌سازی:
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="مرتب‌سازی اشتراک‌ها"
            >
              <option value="priority">اولویت تمدید</option>
              <option value="active">ابتدا فعال‌ها</option>
              <option value="name">نام بانک اطلاعاتی</option>
            </select>
          </label>
        </div>
        {hasError && !isLoading ? (
          <div role="alert" className={styles.emptyState}>
            <PiStack aria-hidden="true" />
            <h3>اطلاعات اشتراک‌ها دریافت نشد</h3>
            <p>دوباره تلاش کنید تا وضعیت و اعتبار اشتراک‌ها نمایش داده شود.</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className={styles.secondaryAction}
            >
              تلاش دوباره
            </button>
          </div>
        ) : (
          <UpgradeStorage
            items={filteredItems}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            prioritizeRenewals={false}
          />
        )}
      </section>
      <footer className={styles.helpFooter}>
        <PiHeadset aria-hidden="true" />
        <span>دربارهٔ اشتراک یا فعال‌سازی به راهنمایی نیاز دارید؟</span>
        <Link href={routes.support.ticket}>
          ارتباط با پشتیبانی <PiArrowLeft aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
