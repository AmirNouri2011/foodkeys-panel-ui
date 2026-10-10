'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';
import styles from './subscriptions.module.css';
import {
  PiArrowLeft,
  PiBuildings,
  PiCaretDown,
  PiCheck,
  PiCheckCircle,
  PiClock,
  PiInfo,
  PiStack,
  PiWarningCircle,
  PiCalendarBlank,
  PiArrowClockwise,
  PiPackage,
  PiFactory,
  PiFlask,
  PiPlant,
  PiGear,
  PiBriefcase,
  PiTruck,
  PiHeadset,
  PiMagnifyingGlass,
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
  renewable?: boolean;
};
type UpgradeStorageProps = {
  id?: number | string;
  items: SubscriptionItem[];
  className?: string;
  isLoading?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  prioritizeRenewals?: boolean;
  view?: 'list' | 'grid';
};
const statusConfig = {
  ACTIVE: {
    label: 'فعال',
    icon: PiCheckCircle,
    description:
      'اشتراک شما فعال است و می‌توانید از امکانات این پلن استفاده کنید.',
  },
  PENDING: {
    label: 'در انتظار تأیید',
    icon: PiClock,
    description:
      'درخواست شما در انتظار تأیید است. پس از تأیید، دسترسی فعال می‌شود.',
  },
  DISABLE: {
    label: 'غیرفعال',
    icon: PiWarningCircle,
    description:
      'این اشتراک غیرفعال است. برای دسترسی دوباره، پلن‌های موجود را بررسی کنید.',
  },
  UNKNOWN: {
    label: 'وضعیت نامشخص',
    icon: PiInfo,
    description:
      'وضعیت این اشتراک مشخص نیست. برای بررسی دسترسی با پشتیبانی ارتباط بگیرید.',
  },
};
const persianDigits = (text: string) =>
  text.replace(/[0-9]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
function bankAppearance(name: string) {
  if (/بسته\s*بندی/.test(name)) return { icon: PiPackage, tone: 'violet' };
  if (/آزمایشگاه|تحقیقاتی/.test(name)) return { icon: PiFlask, tone: 'blue' };
  if (/ماشین|تجهیزات/.test(name)) return { icon: PiGear, tone: 'slate' };
  if (/استخدام/.test(name)) return { icon: PiBriefcase, tone: 'violet' };
  if (/دام|زراع|باغ|کشاورز|خام/.test(name))
    return { icon: PiPlant, tone: 'green' };
  if (/پخش|عمده|بنکدار/.test(name)) return { icon: PiTruck, tone: 'amber' };
  if (/تولیدکنند/.test(name)) return { icon: PiFactory, tone: 'green' };
  return { icon: PiBuildings, tone: 'slate' };
}
function SubscriptionRow({
  item,
  id,
}: {
  item: SubscriptionItem;
  id?: number | string;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const statusKey =
    item.subscriptionStatus === 'DISABLE'
      ? 'DISABLE'
      : item.subscriptionStatus === 'PENDING'
      ? 'PENDING'
      : item.subscriptionStatus === 'ACTIVE'
      ? 'ACTIVE'
      : 'UNKNOWN';
  const status = statusConfig[statusKey];
  const StatusIcon = status.icon;
  const bankName = item.subCategoryName || 'بانک اطلاعاتی';
  const bankId = id ?? item.subCategoryId;
  const { icon: BankIcon, tone } = bankAppearance(bankName);
  const canChoosePlan =
    (statusKey === 'ACTIVE' || statusKey === 'DISABLE') && bankId != null;
  const actionLabel =
    item.renewable === false ? 'مشاهده پلن‌ها' : 'تمدید اشتراک';
  return (
    <article
      className={styles.row}
      data-subscription-status={statusKey}
      data-expanded={expanded}
    >
      <div className={styles.rowMain}>
        <div className={styles.identity}>
          <span className={styles.bankIcon} data-tone={tone}>
            <BankIcon aria-hidden="true" />
          </span>
          <div className={styles.identityText}>
            <h3>{bankName}</h3>
            <p>{persianDigits(item.bundleTitle || 'اشتراک بانک اطلاعاتی')}</p>
          </div>
        </div>
        <div className={styles.expiry}>
          <span>
            <PiCalendarBlank aria-hidden="true" />
            پایان اعتبار
          </span>
          <bdi>{persianDigits(item.endDateStr || 'ثبت نشده')}</bdi>
        </div>
        <div className={styles.statusCell}>
          <span className={styles.status}>
            <StatusIcon aria-hidden="true" />
            {status.label}
          </span>
          {item.renewable === false && statusKey !== 'PENDING' && (
            <small>پلن غیرقابل تمدید</small>
          )}
        </div>
        <div className={styles.rowAction}>
          {canChoosePlan ? (
            <Link
              href={`/bundle/${bankId}/buy`}
              aria-label={`${actionLabel} ${bankName}`}
              className={
                statusKey === 'DISABLE' && item.renewable !== false
                  ? styles.primaryAction
                  : styles.secondaryAction
              }
            >
              {actionLabel}
              <PiArrowLeft aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href={
                statusKey === 'PENDING'
                  ? routes.support.createTicket
                  : routes.support.ticket
              }
              aria-label={`پیگیری ${bankName}`}
              className={styles.secondaryAction}
            >
              <PiHeadset aria-hidden="true" />
              {statusKey === 'PENDING' ? 'پیگیری درخواست' : 'بررسی وضعیت'}
            </Link>
          )}
          <button
            type="button"
            className={styles.detailsToggle}
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={`جزئیات اشتراک ${bankName}`}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'بستن جزئیات' : 'جزئیات'}
            <PiCaretDown aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id={detailsId} hidden={!expanded} className={styles.detailsBody}>
        <div className={styles.featuresHeading}>
          <PiStack aria-hidden="true" />
          <h4>امکانات اشتراک</h4>
          <span>
            {(item.bundleFeatures?.length ?? 0).toLocaleString('fa-IR')} امکان
          </span>
        </div>
        {item.bundleFeatures?.length ? (
          <ul className={styles.features}>
            {item.bundleFeatures.map((feature, index) => (
              <li key={index}>
                <PiCheck aria-hidden="true" />
                <span>{persianDigits(feature)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noFeatures}>
            امکانات این پلن هنوز ثبت نشده است.
          </p>
        )}
        <p className={styles.statusDescription}>
          <StatusIcon aria-hidden="true" />
          {status.description}
          {item.renewable === false &&
            canChoosePlan &&
            ' پلن فعلی قابل تمدید نیست؛ می‌توانید سایر پلن‌ها را مشاهده کنید.'}
        </p>
      </div>
    </article>
  );
}
export default function UpgradeStorage({
  id,
  items,
  className,
  isLoading = false,
  hasActiveFilters = false,
  onClearFilters,
  prioritizeRenewals = false,
  view = 'grid',
}: UpgradeStorageProps) {
  if (isLoading)
    return (
      <div
        role="status"
        aria-label="در حال دریافت اشتراک‌ها"
        className={cn(styles.list, className)}
      >
        {[0, 1, 2, 3].map((index) => (
          <div key={index} aria-hidden="true" className={styles.skeletonRow}>
            <i />
            <div>
              <i />
              <i />
            </div>
            <i />
            <i />
          </div>
        ))}
      </div>
    );
  if (!items.length)
    return (
      <div className={cn(styles.list, styles.emptyState, className)}>
        <span className={styles.emptyIcon}>
          {hasActiveFilters ? (
            <PiMagnifyingGlass aria-hidden="true" />
          ) : (
            <PiStack aria-hidden="true" />
          )}
        </span>
        <h3>
          {hasActiveFilters
            ? 'اشتراکی با این مشخصات پیدا نشد'
            : 'اولین اشتراک شما از اینجا شروع می‌شود'}
        </h3>
        <p>
          {hasActiveFilters
            ? 'نام دیگری را جست‌وجو کنید یا فیلترها را بردارید.'
            : 'پس از تهیهٔ اشتراک یک بانک اطلاعاتی، امکانات و وضعیت دسترسی شما اینجا نمایش داده می‌شود.'}
        </p>
        {hasActiveFilters && onClearFilters ? (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onClearFilters}
          >
            نمایش همه اشتراک‌ها
            <PiArrowClockwise aria-hidden="true" />
          </button>
        ) : (
          <Link href={routes.support.ticket} className={styles.secondaryAction}>
            <PiHeadset aria-hidden="true" />
            راهنمای انتخاب اشتراک
          </Link>
        )}
      </div>
    );
  const renewals = items.filter(
    (item) => item.subscriptionStatus === 'DISABLE'
  );
  const remaining = items.filter(
    (item) => item.subscriptionStatus !== 'DISABLE'
  );
  const groups =
    prioritizeRenewals && renewals.length && remaining.length
      ? [
          { title: 'اشتراک‌های غیرفعال', items: renewals },
          { title: 'سایر اشتراک‌ها', items: remaining },
        ]
      : [{ title: '', items }];
  return (
    <div className={cn(styles.list, className)} data-view={view}>
      {view === 'list' && (
        <div className={styles.columnHead} aria-hidden="true">
          <span>بانک اطلاعاتی و پلن</span>
          <span>اعتبار اشتراک</span>
          <span>وضعیت دسترسی</span>
          <span>مدیریت اشتراک</span>
        </div>
      )}
      {groups.map((group) => (
        <div key={group.title} className={styles.listGroup}>
          {group.title && (
            <div className={styles.groupHeading}>
              <h3>{group.title}</h3>
              <span>{group.items.length.toLocaleString('fa-IR')} اشتراک</span>
            </div>
          )}
          <div className={styles.rows}>
            {group.items.map((item, index) => (
              <SubscriptionRow
                key={item.id ?? `${item.subCategoryId}-${index}`}
                item={item}
                id={id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
