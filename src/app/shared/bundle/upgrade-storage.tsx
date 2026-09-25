import Link from 'next/link';
import cn from '@/utils/class-names';
import {
  PiArrowLeftBold,
  PiBuildings,
  PiCalendarBlank,
  PiCheckBold,
  PiClockCountdown,
  PiFunnelSimple,
  PiInfo,
  PiWarningCircle,
} from 'react-icons/pi';

export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'DISABLE' | string;

export type SubscriptionItem = {
  id?: number | string;
  bundleTitle?: string;
  bundleFeatures?: string[];
  subscriptionStatus?: SubscriptionStatus;
  endDateStr?: string;
  subCategoryName?: string;
  subCategoryId?: number | string;
  color?: string;
};

type UpgradeStorageProps = {
  id?: number | string;
  items: SubscriptionItem[];
  className?: string;
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

const statusConfig = {
  ACTIVE: {
    label: 'فعال',
    description: 'دسترسی شما برقرار است',
    badge: 'bg-green-lighter/60 text-green-dark ring-green-lighter',
    accent: 'bg-green',
    iconWrap: 'bg-green-lighter/60 text-green-dark',
    icon: PiCheckBold,
    action: 'تمدید اشتراک',
  },
  PENDING: {
    label: 'در انتظار تایید',
    description: 'درخواست شما در حال بررسی است',
    badge: 'bg-orange-lighter/60 text-orange-dark ring-orange-lighter',
    accent: 'bg-orange',
    iconWrap: 'bg-orange-lighter/60 text-orange-dark',
    icon: PiClockCountdown,
    action: 'در انتظار بررسی',
  },
  DISABLE: {
    label: 'غیرفعال',
    description: 'برای ادامه، اشتراک را دوباره فعال کنید',
    badge: 'bg-red-lighter/60 text-red-dark ring-red-lighter',
    accent: 'bg-red',
    iconWrap: 'bg-red-lighter/60 text-red-dark',
    icon: PiWarningCircle,
    action: 'فعال‌سازی دوباره',
  },
};

function SubscriptionSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
      <div className="animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div className="h-11 w-11 rounded-xl bg-gray-100" />
          <div className="h-7 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="mt-5 h-5 w-3/4 rounded bg-gray-100" />
        <div className="mt-3 h-4 w-full rounded bg-gray-100" />
        <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
        <div className="mt-6 h-20 rounded-xl bg-gray-50" />
        <div className="mt-5 h-11 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function UpgradeStorage({
  id,
  items,
  className,
  isLoading = false,
  hasActiveFilters = false,
  onClearFilters,
}: UpgradeStorageProps) {
  if (isLoading) {
    return (
      <div className={cn('mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SubscriptionSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className={cn(
          'mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-5 text-center',
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
          <PiFunnelSimple className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-900">
          {hasActiveFilters ? 'نتیجه‌ای با این فیلترها پیدا نشد' : 'هنوز اشتراکی ندارید'}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          {hasActiveFilters
            ? 'فیلترها را تغییر دهید تا سایر اشتراک‌های خود را ببینید.'
            : 'بعد از خرید اشتراک یک بانک اطلاعاتی، وضعیت دسترسی شما در این بخش نمایش داده می‌شود.'}
        </p>
        {hasActiveFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            پاک کردن فیلترها
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {items.map((item, index) => {
        const statusKey =
          item.subscriptionStatus === 'PENDING'
            ? 'PENDING'
            : item.subscriptionStatus === 'DISABLE'
              ? 'DISABLE'
              : 'ACTIVE';
        const status = statusConfig[statusKey];
        const StatusIcon = status.icon;
        const href = `/bundle/${id || item.subCategoryId}/buy`;

        return (
          <article
            key={item.id ?? `${item.subCategoryId}-${index}`}
            className="group relative flex min-h-[410px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
          >
            <div className={cn('absolute inset-x-0 top-0 h-1', status.accent)} />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', status.iconWrap)}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
                  status.badge
                )}
              >
                {status.label}
              </span>
            </div>

            <div className="mt-4 min-h-[92px]">
              <div className="mb-2 flex items-start gap-2 text-xs font-medium leading-5 text-gray-500">
                <PiBuildings className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="line-clamp-2">
                  {item.subCategoryName || 'بانک اطلاعاتی'}
                </span>
              </div>
              <h4 className="line-clamp-2 text-base font-bold leading-7 text-gray-1000">
                {item.bundleTitle || 'اشتراک بانک اطلاعاتی'}
              </h4>
            </div>

            <div className={cn('mt-4 rounded-xl px-4 py-3', status.iconWrap)}>
              <p className="text-sm font-bold">{status.description}</p>
              {item.endDateStr && (
                <div className="mt-1.5 flex items-center gap-2 text-xs font-medium opacity-80">
                  <PiCalendarBlank className="h-4 w-4" />
                  <span>
                    {statusKey === 'PENDING' ? 'تاریخ ثبت‌شده' : 'تاریخ پایان'}: {' '}
                    <bdi>{item.endDateStr}</bdi>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex-1 border-t border-gray-100 pt-4">
              <p className="mb-2.5 text-xs font-semibold text-gray-500">امکانات این اشتراک</p>
              <ul className="space-y-2.5">
                {(item.bundleFeatures ?? []).slice(0, 4).map((feature, featureIndex) => (
                  <li
                    key={`${item.id ?? index}-feature-${featureIndex}`}
                    className="flex items-start gap-2 text-sm leading-6 text-gray-700"
                  >
                    <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-lighter/60 text-green-dark">
                      <PiCheckBold className="h-2.5 w-2.5" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              {statusKey === 'PENDING' ? (
                <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-lighter/60 px-4 text-sm font-semibold text-orange-dark ring-1 ring-inset ring-orange-lighter">
                  <PiInfo className="h-4 w-4" />
                  پس از تایید، دسترسی شما فعال می‌شود
                </div>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition',
                    statusKey === 'ACTIVE'
                      ? 'bg-gray-1000 text-white hover:bg-gray-800'
                      : 'bg-red text-white hover:bg-red-dark'
                  )}
                >
                  {status.action}
                  <PiArrowLeftBold className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
