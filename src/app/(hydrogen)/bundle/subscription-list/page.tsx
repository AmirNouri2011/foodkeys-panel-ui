'use client';

import UpgradeStorage, {
  type SubscriptionItem,
} from '@/app/shared/bundle/upgrade-storage';
import PageHeader from '@/app/shared/page-header';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import useAxiosPrivate from '@/hooks/use-axios-private';
import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiCheckCircleFill,
  PiClockCountdownFill,
  PiStackFill,
  PiWarningCircleFill,
} from 'react-icons/pi';

const pageHeader = {
  title: 'مدیریت اشتراک',
  breadcrumb: [
    {
      href: routes.info.dashboard,
      name: 'مدیریت اطلاعات',
    },
    {
      name: 'مدیریت اشتراک',
    },
  ],
};

type StatusFilter = 'همه' | 'فعال' | 'در انتظار تایید' | 'غیرفعال';

const statusOptions: {
  label: StatusFilter;
  value: string;
}[] = [
  { label: 'همه', value: 'ALL' },
  { label: 'فعال', value: 'ACTIVE' },
  { label: 'در انتظار تایید', value: 'PENDING' },
  { label: 'غیرفعال', value: 'DISABLE' },
];

export default function ProfileSettingsFormPage() {
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<SelectOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('همه');
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const _axios = useAxiosPrivate();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        const selectedStatus = statusOptions.find(
          (option) => option.label === statusFilter
        )?.value;

        if (selectedStatus && selectedStatus !== 'ALL') {
          params.set('status', selectedStatus);
        }
        if (categoryFilter?.value) {
          params.set('subCategoryId', String(categoryFilter.value));
        }

        const response = await _axios.get(
          `/subscription${params.toString() ? `?${params.toString()}` : ''}`
        );

        if (response.data.status === 'SUCCESS') {
          const subscriptions: SubscriptionItem[] = response.data.data ?? [];
          setItems(subscriptions);

          if (statusFilter === 'همه') {
            setCounts({
              all: subscriptions.length,
              active: subscriptions.filter(
                (item) => item.subscriptionStatus === 'ACTIVE'
              ).length,
              pending: subscriptions.filter(
                (item) => item.subscriptionStatus === 'PENDING'
              ).length,
              inactive: subscriptions.filter(
                (item) => item.subscriptionStatus === 'DISABLE'
              ).length,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error(<Text tag="b">خطا در دریافت اطلاعات اشتراک</Text>);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [_axios, statusFilter, categoryFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await _axios.get('/subcategory/options');
        if (response.data.status === 'SUCCESS') {
          setCategories(response.data.data ?? []);
        } else {
          toast.error(<Text tag="b">خطا در دریافت دسته‌بندی‌ها</Text>);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(<Text tag="b">خطا در دریافت دسته‌بندی‌ها</Text>);
      }
    };

    fetchCategories();
  }, [_axios]);

  const summaryItems = [
    {
      label: 'اشتراک فعال',
      value: counts.active,
      icon: PiCheckCircleFill,
      className: 'bg-green-lighter/60 text-green-dark ring-green-lighter',
    },
    {
      label: 'در انتظار تایید',
      value: counts.pending,
      icon: PiClockCountdownFill,
      className: 'bg-orange-lighter/60 text-orange-dark ring-orange-lighter',
    },
    {
      label: 'غیرفعال',
      value: counts.inactive,
      icon: PiWarningCircleFill,
      className: 'bg-red-lighter/60 text-red-dark ring-red-lighter',
    },
  ];

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <section className="relative mt-2 overflow-hidden rounded-2xl border border-green-lighter bg-gradient-to-l from-green-lighter/40 via-white to-blue-lighter/30 p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-blue-lighter/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-green-lighter/40 blur-3xl" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-green-dark ring-1 ring-green-lighter">
              <PiStackFill className="h-4 w-4" />
              مرکز اشتراک‌های شما
            </div>
            <h2 className="max-w-2xl text-xl font-bold leading-9 text-gray-1000 sm:text-2xl">
              وضعیت دسترسی به بانک‌های اطلاعاتی، یک‌جا و شفاف
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
              اینجا می‌توانید ببینید هر اشتراک به کدام بانک تعلق دارد، تا چه زمانی
              اعتبار دارد و برای ادامه دسترسی چه کاری لازم است.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {summaryItems.map((summary) => {
              const Icon = summary.icon;
              return (
                <div
                  key={summary.label}
                  className={cn(
                    'rounded-xl p-3 ring-1 ring-inset sm:p-4',
                    summary.className
                  )}
                >
                  <Icon className="mb-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <strong className="block text-xl font-bold sm:text-2xl">
                    {isLoading ? '—' : summary.value.toLocaleString('fa-IR')}
                  </strong>
                  <span className="mt-1 block text-[11px] font-medium leading-5 sm:text-xs">
                    {summary.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-1000">اشتراک‌های من</h3>
              {!isLoading && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {counts.all.toLocaleString('fa-IR')}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              برای دیدن اشتراک موردنظر، وضعیت یا بانک اطلاعاتی را انتخاب کنید.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-end">
            <div className="flex min-h-11 w-full items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 sm:w-auto">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.label)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm',
                    statusFilter === option.label
                      ? 'bg-white text-gray-1000 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <SelectBox
              aria-label="فیلتر بر اساس بانک اطلاعاتی"
              options={[{ name: 'همه بانک‌ها', value: '' }, ...categories]}
              value={categoryFilter}
              onChange={(selected: SelectOption) => {
                setStatusFilter('همه');
                setCategoryFilter(selected.value ? selected : null);
              }}
              className="w-full sm:w-64"
              placeholder="همه بانک‌ها"
              selectClassName="!h-11 !rounded-xl"
            />
          </div>
        </div>

        <UpgradeStorage
          items={items}
          isLoading={isLoading}
          hasActiveFilters={statusFilter !== 'همه' || Boolean(categoryFilter)}
          onClearFilters={() => {
            setStatusFilter('همه');
            setCategoryFilter(null);
          }}
        />
      </section>
    </>
  );
}
