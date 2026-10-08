'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { routes } from '@/config/routes';
import { useQuery, useQueryClient } from 'react-query';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fa';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Empty, EmptyBoxIcon } from '@/components/ui/empty';
import { Loader } from '@/components/ui/loader';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import { useNotificationService } from '@/services/notification-service';
import {
  NOTIFICATIONS_PAGE_SIZE,
  NotificationItem,
  notificationKeys,
} from '@/config/notifications';
import {
  PiArchive,
  PiArrowLeft,
  PiBell,
  PiCheck,
  PiSpinnerGap,
  PiX,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import cn from '@/utils/class-names';
import styles from './notifications-list.module.css';

dayjs.extend(relativeTime);
dayjs.locale('fa');

function getDateParts(iso?: string) {
  if (!iso) return { absolute: 'زمان نامشخص', relative: '' };
  const date = dayjs(iso);
  if (!date.isValid()) return { absolute: 'زمان نامشخص', relative: '' };

  return {
    absolute: date.format('YYYY/MM/DD - HH:mm'),
    relative: date.fromNow(),
  };
}

function getPriority(priority?: string) {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return {
        label: 'اولویت بالا',
        className:
          'border-red/20 bg-red-lighter text-red-dark dark:border-red/30 dark:bg-red/10',
      };
    case 'LOW':
      return {
        label: 'اولویت پایین',
        className:
          'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-300',
      };
    case 'MEDIUM':
      return {
        label: 'اولویت متوسط',
        className:
          'border-orange/20 bg-orange-lighter text-orange-dark dark:border-orange/30 dark:bg-orange/10',
      };
    default:
      return null;
  }
}

function getTopicLabel(topic?: string) {
  switch (topic?.toUpperCase()) {
    case 'ADMIN_TOPIC':
      return 'مدیریتی';
    case 'CONSUMER_TOPIC':
      return 'حساب کاربری';
    default:
      return null;
  }
}

function NotificationRow({
  item,
  onOpen,
  isMovingToArchive,
  onArchiveAnimationEnd,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  isMovingToArchive: boolean;
  onArchiveAnimationEnd: () => void;
}) {
  const date = getDateParts(item.createdAt);
  const priority = getPriority(item.priority);
  const topicLabel = getTopicLabel(item.topic);

  return (
    <div
      className={cn(styles.row, isMovingToArchive && styles.archiving)}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && isMovingToArchive) {
          onArchiveAnimationEnd();
        }
      }}
    >
      <div className="min-h-0 overflow-hidden">
        <article
          role="button"
          tabIndex={isMovingToArchive ? -1 : 0}
          aria-disabled={isMovingToArchive}
          onClick={() => onOpen(item)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen(item);
            }
          }}
          className={cn(
            'group relative cursor-pointer overflow-hidden rounded-2xl border bg-white px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-22px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-5',
            'dark:bg-gray-50',
            item.isRead
              ? 'border-gray-200'
              : 'border-primary/20 bg-primary-lighter/10 shadow-[inset_-3px_0_0_rgb(var(--primary-default))]'
          )}
        >
          {isMovingToArchive ? (
            <div className={styles.archiveOverlay} role="status">
              <PiArchive className="h-5 w-5" />
              <span>به بایگانی منتقل شد</span>
            </div>
          ) : null}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div
              className={cn(
                'relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl [&>svg]:h-5 [&>svg]:w-5',
                item.isRead
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-primary text-white shadow-[0_8px_20px_-10px_rgb(var(--primary-default))]'
              )}
            >
              <RingBellSolidIcon />
              {!item.isRead ? (
                <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text
                      tag="h3"
                      className={cn(
                        'line-clamp-1 text-sm text-gray-900 sm:text-base',
                        item.isRead ? 'font-semibold' : 'font-bold'
                      )}
                    >
                      {item.title || 'اعلان جدید'}
                    </Text>
                    {!item.isRead ? (
                      <span className="rounded-full bg-primary-lighter px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
                        خوانده‌نشده
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-600">
                    {item.message || 'برای مشاهده جزئیات این اعلان کلیک کنید.'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400">
                <time dateTime={item.createdAt} title={date.absolute}>
                  {date.relative || date.absolute}
                </time>
                {date.relative ? (
                  <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
                ) : null}
                {date.relative ? (
                  <span className="hidden sm:inline">{date.absolute}</span>
                ) : null}
                {priority ? (
                  <Badge
                    size="sm"
                    variant="outline"
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px]',
                      priority.className
                    )}
                  >
                    {priority.label}
                  </Badge>
                ) : null}
                {topicLabel ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    {topicLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <PiArrowLeft className="mt-3 hidden h-4 w-4 shrink-0 text-gray-300 transition group-hover:-translate-x-0.5 group-hover:text-primary md:block" />
          </div>
        </article>
      </div>
    </div>
  );
}

function NotificationDetailsModal({
  isOpen,
  item,
  isLoading,
  isError,
  onClose,
  onRetry,
}: {
  isOpen: boolean;
  item: NotificationItem | null;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
}) {
  const date = getDateParts(item?.createdAt);
  const priority = getPriority(item?.priority);
  const topicLabel = getTopicLabel(item?.topic);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      onClose={onClose}
      overlayClassName="bg-gray-900/45 backdrop-blur-sm"
      containerClassName="overflow-hidden rounded-3xl bg-white dark:bg-gray-50"
    >
      <div dir="rtl" role="dialog" aria-labelledby="notification-modal-title">
        <header className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-l from-primary-lighter/60 via-white to-white px-5 py-5 dark:via-gray-50 dark:to-gray-50 sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -start-10 -top-14 h-36 w-36 rounded-full border-[24px] border-primary/5" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_-12px_rgb(var(--primary-default))] [&>svg]:h-6 [&>svg]:w-6">
                <RingBellSolidIcon />
              </div>
              <div className="min-w-0 pt-0.5">
                <span className="mb-1 block text-xs font-medium text-primary">
                  جزئیات اعلان
                </span>
                <Text
                  tag="h2"
                  id="notification-modal-title"
                  className="text-lg font-bold leading-7 text-gray-900 sm:text-xl"
                >
                  {item?.title || 'اعلان'}
                </Text>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-50"
              aria-label="بستن جزئیات اعلان"
            >
              <PiX className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {isLoading ? (
            <div className="min-h-52 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
              <Loader size="lg" />
              در حال دریافت جزئیات اعلان…
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red/20 bg-red-lighter p-6 text-center text-red-dark">
              <p className="font-semibold">جزئیات اعلان دریافت نشد</p>
              <p className="mt-1 text-sm opacity-80">لطفاً دوباره تلاش کنید.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRetry}
              >
                تلاش مجدد
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 text-xs text-gray-500">
                <time dateTime={item?.createdAt}>{date.absolute}</time>
                {priority ? (
                  <Badge
                    size="sm"
                    variant="outline"
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px]',
                      priority.className
                    )}
                  >
                    {priority.label}
                  </Badge>
                ) : null}
                {topicLabel ? (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                    {topicLabel}
                  </span>
                ) : null}
              </div>

              <section>
                <h3 className="mb-2 text-xs font-semibold text-gray-500">
                  متن اعلان
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800 sm:text-[15px]">
                  {item?.message || 'متنی برای این اعلان ثبت نشده است.'}
                </p>
              </section>

              <section className="border-primary/15 rounded-2xl border bg-primary-lighter/20 p-4 sm:p-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  توضیحات تکمیلی
                </h3>
                <p
                  className={cn(
                    'whitespace-pre-wrap text-sm leading-7',
                    item?.description ? 'text-gray-700' : 'text-gray-400'
                  )}
                >
                  {item?.description ||
                    'توضیحات تکمیلی برای این اعلان ثبت نشده است.'}
                </p>
              </section>
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-7">
          <Button variant="outline" size="sm" onClick={onClose}>
            بستن
          </Button>
        </footer>
      </div>
    </Modal>
  );
}

export default function NotificationsListView() {
  const service = useNotificationService();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('notification');
  const openedTargetRef = useRef<string | null>(null);
  const [page, setPage] = useState(1);
  const [archived, setArchived] = useState(false);
  const [pendingArchiveIds, setPendingArchiveIds] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(
    null
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery(
    notificationKeys.inbox(),
    service.getInbox
  );

  const { activeItems, archivedItems } = useMemo(
    () => ({
      activeItems: (data ?? []).filter(
        (item) =>
          (!item.isRead && !item.archived) ||
          pendingArchiveIds.has(String(item.id))
      ),
      archivedItems: (data ?? []).filter(
        (item) =>
          (item.isRead || item.archived) &&
          !pendingArchiveIds.has(String(item.id))
      ),
    }),
    [data, pendingArchiveIds]
  );
  const visibleItems = archived ? archivedItems : activeItems;
  const totalItems = visibleItems.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / NOTIFICATIONS_PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);
  const items = visibleItems.slice(
    (currentPage - 1) * NOTIFICATIONS_PAGE_SIZE,
    currentPage * NOTIFICATIONS_PAGE_SIZE
  );

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const {
    data: notificationDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useQuery(
    notificationKeys.detail(selectedItem?.id ?? 'modal'),
    () => service.getNotificationById(selectedItem!.id),
    { enabled: selectedItem !== null }
  );

  const handleOpen = useCallback(
    (item: NotificationItem) => {
      setSelectedItem(item);

      const inbox =
        queryClient.getQueryData<NotificationItem[]>(
          notificationKeys.inbox()
        ) ?? [];
      const targetItems = inbox.filter((notification) =>
        item.isRead || item.archived
          ? notification.isRead || notification.archived
          : !notification.isRead && !notification.archived
      );
      const index = targetItems.findIndex(
        (notification) => String(notification.id) === String(item.id)
      );
      setArchived(item.isRead || item.archived);
      if (index >= 0) setPage(Math.floor(index / NOTIFICATIONS_PAGE_SIZE) + 1);

      if (!item.isRead) {
        void service
          .markRead(item.id)
          .then(() => {
            // Keep the row until the details close so the user can see it leave.
            if (!item.archived) {
              setPendingArchiveIds((previous) =>
                new Set(previous).add(String(item.id))
              );
            }
            queryClient.setQueryData<NotificationItem[]>(
              notificationKeys.inbox(),
              (previous) =>
                previous?.map((notification) =>
                  String(notification.id) === String(item.id)
                    ? { ...notification, isRead: true }
                    : notification
                )
            );
            queryClient.invalidateQueries(notificationKeys.unreadCount());
            queryClient.invalidateQueries(notificationKeys.recent());
          })
          .catch(() =>
            toast.error('ثبت خوانده‌شدن اعلان انجام نشد؛ دوباره تلاش کنید')
          );
      }
    },
    [queryClient, service]
  );

  useEffect(() => {
    if (!targetId) {
      openedTargetRef.current = null;
      return;
    }
    if (openedTargetRef.current === targetId) return;
    if (!data) return;
    openedTargetRef.current = targetId;
    const item = data?.find(
      (notification) => String(notification.id) === targetId
    );
    handleOpen(
      item ?? {
        id: targetId,
        title: 'اعلان',
        message: '',
        isRead: false,
        archived: false,
      }
    );
  }, [targetId, data, handleOpen]);

  if (isLoading && !data) {
    return (
      <div className="min-h-80 flex items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red/20 bg-red-lighter p-8 text-center text-red-dark">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red/10">
          <PiBell className="h-6 w-6" />
        </div>
        <p className="font-semibold">دریافت اعلان‌ها با مشکل روبه‌رو شد</p>
        <p className="mt-1 text-sm opacity-80">
          لطفاً اتصال خود را بررسی و دوباره تلاش کنید.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={() => refetch()}
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <section className="border-primary/15 relative overflow-hidden rounded-2xl border bg-gradient-to-l from-primary-lighter/50 via-white to-white px-5 py-5 dark:via-gray-50 dark:to-gray-50 sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -start-16 -top-20 h-44 w-44 rounded-full bg-primary/5" />
          <div className="pointer-events-none absolute -bottom-24 start-20 h-40 w-40 rounded-full border-[28px] border-primary/5" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_30px_-14px_rgb(var(--primary-default))] [&>svg]:h-7 [&>svg]:w-7">
                <RingBellSolidIcon />
              </div>
              <div>
                <Text
                  tag="h2"
                  className="text-lg font-bold text-gray-900 sm:text-xl"
                >
                  صندوق اعلان‌های شما
                </Text>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  تازه‌ترین رویدادها و پیام‌های حساب کاربری را اینجا دنبال کنید.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-200 dark:bg-gray-50/80 lg:self-auto">
              <div className="text-end">
                <span className="block text-2xl font-black leading-none text-gray-900">
                  {totalItems.toLocaleString('fa-IR')}
                </span>
                <span className="mt-1 block text-[11px] text-gray-500">
                  {archived ? 'اعلان بایگانی‌شده' : 'اعلان فعال'}
                </span>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-lighter text-primary">
                {archived ? (
                  <PiArchive className="h-5 w-5" />
                ) : (
                  <PiBell className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3 dark:bg-gray-100/40 sm:p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full rounded-xl border border-gray-200 bg-white p-1 dark:bg-gray-50 sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setArchived(false);
                  setPage(1);
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition sm:flex-none',
                  !archived
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
                aria-pressed={!archived}
              >
                <PiBell className="h-4 w-4" />
                فعال
                <span className="rounded-full bg-gray-500/10 px-2 py-0.5 text-xs tabular-nums">
                  {activeItems.length.toLocaleString('fa-IR')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchived(true);
                  setPendingArchiveIds(new Set());
                  setPage(1);
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition sm:flex-none',
                  archived
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
                aria-pressed={archived}
              >
                <PiArchive className="h-4 w-4" />
                بایگانی‌شده
                <span className="rounded-full bg-gray-500/10 px-2 py-0.5 text-xs tabular-nums">
                  {archivedItems.length.toLocaleString('fa-IR')}
                </span>
              </button>
            </div>

            <div className="min-h-6 flex items-center gap-2 px-1 text-xs text-gray-400">
              {isFetching ? (
                <>
                  <PiSpinnerGap className="h-4 w-4 animate-spin" />
                  در حال به‌روزرسانی
                </>
              ) : (
                <>
                  <PiCheck className="h-4 w-4 text-green" />
                  همه اعلان‌ها به‌روز هستند
                </>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white dark:bg-gray-50">
              <Empty
                image={<EmptyBoxIcon className="h-28 w-28" />}
                text={
                  archived
                    ? 'هنوز اعلان خوانده‌شده یا بایگانی‌شده‌ای ندارید'
                    : 'در حال حاضر اعلان فعالی ندارید'
                }
                textClassName="text-sm font-medium text-gray-500"
                className="py-16"
              />
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-3 transition-opacity',
                isFetching && 'opacity-70'
              )}
            >
              {items.map((item) => (
                <NotificationRow
                  key={String(item.id)}
                  item={item}
                  onOpen={handleOpen}
                  isMovingToArchive={
                    !archived &&
                    selectedItem === null &&
                    pendingArchiveIds.has(String(item.id))
                  }
                  onArchiveAnimationEnd={() => {
                    setPendingArchiveIds((previous) => {
                      const next = new Set(previous);
                      next.delete(String(item.id));
                      return next;
                    });
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-1 pt-4 sm:flex-row"
              aria-label="صفحه‌بندی اعلان‌ها"
            >
              <span className="text-xs text-gray-500">
                صفحه {page.toLocaleString('fa-IR')} از{' '}
                {totalPages.toLocaleString('fa-IR')}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  قبلی
                </Button>
                <span className="min-w-9 flex h-9 items-center justify-center rounded-lg bg-gray-900 px-2 text-sm font-semibold text-white">
                  {page.toLocaleString('fa-IR')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  بعدی
                </Button>
              </div>
            </nav>
          ) : null}
        </section>
      </div>

      <NotificationDetailsModal
        isOpen={selectedItem !== null}
        item={notificationDetails ?? selectedItem}
        isLoading={isDetailsLoading}
        isError={isDetailsError}
        onClose={() => {
          setSelectedItem(null);
          if (targetId)
            router.replace(routes.notificationCenter, { scroll: false });
        }}
        onRetry={() => refetchDetails()}
      />
    </>
  );
}
