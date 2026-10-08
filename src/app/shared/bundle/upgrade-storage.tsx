import Link from 'next/link';
import cn from '@/utils/class-names';
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
};
const statusConfig = {
  ACTIVE: { label: 'فعال', icon: PiCheckCircle, action: 'تمدید اشتراک' },
  PENDING: { label: 'در انتظار تایید', icon: PiClock, action: '' },
  DISABLE: { label: 'غیرفعال', icon: PiWarningCircle, action: 'تمدید اشتراک' },
  UNKNOWN: { label: 'وضعیت نامشخص', icon: PiInfo, action: '' },
};

function SubscriptionRow({
  item,
  id,
}: {
  item: SubscriptionItem;
  id?: number | string;
}) {
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
  const needsRenewal = statusKey === 'DISABLE';
  const bankName = item.subCategoryName || 'بانک اطلاعاتی';
  const bankId = id ?? item.subCategoryId;
  return (
    <article className={styles.row} data-subscription-status={statusKey}>
      <div className={styles.cardTop}>
        <span className={styles.bankIcon}>
          <PiBuildings aria-hidden="true" />
        </span>
        <span className={styles.status}>
          <StatusIcon aria-hidden="true" />
          {status.label}
        </span>
      </div>
      <div className={styles.rowMain}>
        <div className={styles.identity}>
          <div className={styles.identityText}>
            <h3>{bankName}</h3>
            <p>{item.bundleTitle || 'اشتراک بانک اطلاعاتی'}</p>
          </div>
        </div>
        <div className={styles.rowMeta}>
          <div className={styles.expiry}>
            <span>
              <PiCalendarBlank aria-hidden="true" /> پایان اعتبار
            </span>
            <bdi>{item.endDateStr || 'ثبت نشده'}</bdi>
          </div>
        </div>
      </div>
      {!!item.bundleFeatures?.length && (
        <details className={styles.details}>
          <summary aria-label={`جزئیات اشتراک ${bankName}`}>
            <span>
              امکانات اشتراک{' '}
              <span className={styles.featureCount}>
                {item.bundleFeatures.length.toLocaleString('fa-IR')}
              </span>
            </span>
            <PiCaretDown aria-hidden="true" />
          </summary>
          <div className={styles.detailsBody}>
            <ul>
              {item.bundleFeatures.map((feature, index) => (
                <li key={index}>
                  <PiCheck aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
      <div className={styles.rowAction}>
        {status.action && bankId != null ? (
          item.renewable === false ? (
            <div className={styles.unavailable}>
              <button type="button" disabled className={styles.disabledAction}>
                امکان تمدید ندارد
              </button>
              <span>این پلن قابل تمدید نیست.</span>
            </div>
          ) : (
            <Link
              href={`/bundle/${bankId}/buy`}
              aria-label={`${status.action} ${bankName}`}
              className={
                needsRenewal ? styles.primaryAction : styles.secondaryAction
              }
            >
              <PiArrowClockwise aria-hidden="true" />
              {status.action}
              <PiArrowLeft aria-hidden="true" />
            </Link>
          )
        ) : (
          <p className={styles.pendingNote}>
            <PiInfo aria-hidden="true" />
            {statusKey === 'PENDING'
              ? 'پس از تایید، دسترسی فعال می‌شود.'
              : 'اطلاعات دسترسی در حال بررسی است.'}
          </p>
        )}
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
}: UpgradeStorageProps) {
  if (isLoading)
    return (
      <div
        role="status"
        aria-label="در حال دریافت اشتراک‌ها"
        className={cn(styles.list, className)}
      >
        {[0, 1, 2].map((index) => (
          <div key={index} aria-hidden="true" className={styles.skeletonRow}>
            <div />
            <div />
            <div />
          </div>
        ))}
      </div>
    );
  if (!items.length)
    return (
      <div className={cn(styles.list, styles.emptyState, className)}>
        <PiStack aria-hidden="true" />
        <h3>
          {hasActiveFilters
            ? 'اشتراکی با این مشخصات پیدا نشد'
            : 'هنوز اشتراکی ندارید'}
        </h3>
        <p>
          {hasActiveFilters
            ? 'جست‌وجو یا فیلترها را تغییر دهید تا اشتراک موردنظر نمایش داده شود.'
            : 'پس از تهیه اشتراک یک بانک اطلاعاتی، وضعیت و اعتبار آن اینجا نمایش داده می‌شود.'}
        </p>
        {hasActiveFilters && onClearFilters && (
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={onClearFilters}
          >
            نمایش همه اشتراک‌ها
          </button>
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
    <div className={cn(styles.list, className)}>
      {groups.map((group) => (
        <div key={group.title} className={styles.listGroup}>
          {group.title && (
            <div className={styles.groupHeading}>
              <h3>{group.title}</h3>
              <span>{group.items.length.toLocaleString('fa-IR')} اشتراک</span>
            </div>
          )}
          <div className={styles.cardGrid}>
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
