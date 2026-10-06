'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PiArrowLeft,
  PiArrowClockwise,
  PiMagnifyingGlass,
  PiStack,
} from 'react-icons/pi';
import UpgradeStorage, {
  type SubscriptionItem,
} from '@/app/shared/bundle/upgrade-storage';
import styles from '@/app/shared/bundle/subscriptions.module.css';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import useAxiosPrivate from '@/hooks/use-axios-private';
import cn from '@/utils/class-names';

type StatusFilter = 'ALL' | 'DISABLE' | 'ACTIVE' | 'PENDING';
const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'همه اشتراک‌ها', value: 'ALL' },
  { label: 'غیرفعال', value: 'DISABLE' },
  { label: 'فعال', value: 'ACTIVE' },
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
      return (
        !search ||
        normalizeSearch(
          `${item.subCategoryName ?? ''} ${item.bundleTitle ?? ''}`
        ).includes(search)
      );
    });
  }, [items, categoryFilter, query]);
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
  const filteredItems = scopedItems.filter(
    (item) => statusFilter === 'ALL' || item.subscriptionStatus === statusFilter
  );
  const renewalCount = items.filter(
    (item) => item.subscriptionStatus === 'DISABLE' && item.renewable !== false
  ).length;
  const hasActiveFilters =
    statusFilter !== 'ALL' || Boolean(categoryFilter) || Boolean(query.trim());

  function clearFilters() {
    setStatusFilter('ALL');
    setCategoryFilter(null);
    setQuery('');
  }

  return (
    <div className={styles.theme}>
      <header className={styles.pageHeader}>
        <nav aria-label="مسیر صفحه" className={styles.breadcrumb}>
          <Link href="/">میز کار</Link>
          <span aria-hidden="true">/</span>
          <span>مدیریت اشتراک</span>
        </nav>
        <div className={styles.headingLine}>
          <div>
            <h1 className={styles.pageTitle}>مدیریت اشتراک</h1>
            <p className={styles.pageDescription}>
              دسترسی به بانک‌های اطلاعاتی و تمدید اشتراک‌ها، در یک جا.
            </p>
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
      </header>

      {!isLoading && !hasError && renewalCount > 0 && (
        <section
          aria-label="اشتراک‌های نیازمند تمدید"
          className={styles.renewalNotice}
        >
          <div className={styles.noticeContent}>
            <span className={styles.noticeIcon}>
              <PiStack aria-hidden="true" />
            </span>
            <div>
              <h2>
                {renewalCount.toLocaleString('fa-IR')} اشتراک شما نیاز به تمدید
                دارد
              </h2>
              <p>
                برای ادامه دسترسی، اشتراک موردنظر را از فهرست زیر تمدید کنید.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.noticeAction}
            onClick={() => {
              clearFilters();
              setStatusFilter('DISABLE');
            }}
          >
            مشاهده موارد
            <PiArrowLeft aria-hidden="true" />
          </button>
        </section>
      )}

      <section aria-label="فهرست اشتراک‌های شما" className={styles.panel}>
        <div className={styles.panelTop}>
          <div className={styles.panelHeading}>
            <h2>اشتراک‌های شما</h2>
            <span aria-live="polite">
              {isLoading
                ? 'در حال دریافت…'
                : hasError
                ? 'دریافت اطلاعات ناموفق بود'
                : `${filteredItems.length.toLocaleString('fa-IR')} اشتراک`}
            </span>
          </div>
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
            prioritizeRenewals={statusFilter === 'ALL'}
          />
        )}
      </section>
    </div>
  );
}
