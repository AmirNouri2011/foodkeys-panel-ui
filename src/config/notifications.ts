/**
 * Shared configuration and types for the in-app notification system.
 *
 * Delivery is polling-only (every 30s) as recommended by the backend
 * `POLLING_ONLY` delivery mode. No WebSocket transport is used on the
 * consumer (user) panel.
 */

/** Recommended polling interval for `/updates` and `/unread-count` (ms). */
export const NOTIFICATIONS_POLL_INTERVAL_MS = 30000;

/** localStorage key holding the cached recent notifications for the dropdown. */
export const NOTIFICATIONS_CACHE_KEY = 'user_notifications_cache';

/** localStorage key holding the ISO timestamp of the last polled moment. */
export const NOTIFICATIONS_LAST_SEEN_KEY = 'notifications_last_seen';

/** Number of items shown in the header dropdown. */
export const NOTIFICATIONS_DROPDOWN_SIZE = 8;

/** Default page size for the notifications list page. */
export const NOTIFICATIONS_PAGE_SIZE = 20;

/**
 * Normalized, UI-friendly notification shape. The backend DTO field names can
 * vary slightly across endpoints, so we defensively map the common variants.
 */
export interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  /** Optional extended body returned by the detail endpoint. */
  description?: string;
  isRead: boolean;
  archived: boolean;
  priority?: string;
  channelCode?: string;
  topic?: string;
  /** Optional deep link to navigate to when the notification is opened. */
  link?: string;
  /** ISO timestamp string (best-effort from several possible fields). */
  createdAt?: string;
  /** Original raw payload, kept for the detail view. */
  raw?: any;
}

export interface NotificationPage {
  data: NotificationItem[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Centralized react-query keys. Kept as a factory so the provider and the
 * pages agree on the exact keys used for caching and invalidation.
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  recent: () => [...notificationKeys.all, 'recent'] as const,
  updates: () => [...notificationKeys.all, 'updates'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  inbox: () => [...notificationKeys.lists(), 'inbox'] as const,
  list: (archived: boolean, page: number) =>
    [
      ...notificationKeys.all,
      'list',
      archived ? 'archive' : 'active',
      page,
    ] as const,
  detail: (id: number | string) =>
    [...notificationKeys.all, 'detail', String(id)] as const,
};

/** Map a raw backend notification payload into a normalized {@link NotificationItem}. */
export function normalizeNotification(raw: any): NotificationItem {
  return {
    id: raw?.id ?? raw?.notificationId ?? raw?.userNotificationId,
    title: raw?.title ?? raw?.subject ?? raw?.name ?? '',
    message: raw?.message ?? raw?.content ?? raw?.body ?? raw?.text ?? '',
    description:
      raw?.description ??
      raw?.details ??
      raw?.additionalDescription ??
      raw?.additionalInfo,
    isRead: Boolean(raw?.read ?? raw?.isRead ?? raw?.seen ?? false),
    archived: Boolean(raw?.archived ?? raw?.isArchived ?? false),
    priority: raw?.priority,
    channelCode: raw?.channelCode ?? raw?.channel,
    topic: raw?.topic,
    link: raw?.link ?? raw?.url ?? raw?.actionUrl ?? raw?.deepLink,
    createdAt:
      raw?.createdAt ??
      raw?.sentAt ??
      raw?.sendTime ??
      raw?.timestamp ??
      raw?.createdDate ??
      raw?.validFrom,
    raw,
  };
}
