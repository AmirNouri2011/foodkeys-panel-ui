'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getItem } from '@/utils/storage';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/config/routes';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import { useNotificationService } from '@/services/notification-service';
import {
  NOTIFICATIONS_CACHE_KEY,
  NOTIFICATIONS_DROPDOWN_SIZE,
  NOTIFICATIONS_LAST_SEEN_KEY,
  NOTIFICATIONS_POLL_INTERVAL_MS,
  NotificationItem,
  NotificationPage,
  notificationKeys,
} from '@/config/notifications';

interface NotificationContextValue {
  unreadCount: number;
  recentItems: NotificationItem[];
  isLoading: boolean;
  /** Force an immediate refresh of badge + dropdown. */
  refresh: () => void;
  /** Optimistically mark a single notification as read. */
  markAsRead: (id: number | string) => Promise<void>;
  /** Mark every currently-known notification as read. */
  markAllAsRead: () => Promise<void>;
  /** Archive a notification and drop it from the active lists. */
  archiveItem: (id: number | string) => Promise<void>;
  /** Navigate to the notifications list, invalidating cache only when needed. */
  goToNotificationCenter: () => void;
  /** Navigate directly to this notification's details. */
  openNotification: (item: NotificationItem) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

/* -------------------------------------------------------------------------- */
/* localStorage helpers (safe for SSR / disabled storage)                     */
/* -------------------------------------------------------------------------- */

function readLastSeen(): string | null {
  try {
    return typeof window !== 'undefined'
      ? window.localStorage.getItem(NOTIFICATIONS_LAST_SEEN_KEY)
      : null;
  } catch {
    return null;
  }
}

function writeLastSeen(value: string) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NOTIFICATIONS_LAST_SEEN_KEY, value);
    }
  } catch {
    /* ignore */
  }
}

function readCachedRecent(): NotificationPage | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const raw = window.localStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as NotificationPage) : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedRecent(page: NotificationPage) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        NOTIFICATIONS_CACHE_KEY,
        JSON.stringify(page)
      );
    }
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Inner provider (runs inside the QueryClientProvider)                       */
/* -------------------------------------------------------------------------- */

function NotificationInner({ children }: { children: React.ReactNode }) {
  const service = useNotificationService();
  const queryClient = useQueryClient();
  const router = useRouter();

  // AuthContext is loosely typed in this codebase.
  const auth = useAuth() as { state?: { token?: string } } | null;
  const token =
    auth?.state?.token || Cookies.get('fkToken') || getItem('token') || '';
  const enabled = Boolean(token);

  // Tracks the last polled moment and which ids we've already toasted.
  const sinceRef = useRef<string | null>(readLastSeen());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstUpdateRef = useRef(true);
  /** True when polling delivered new items that haven't been consumed by the list page yet. */
  const hasPendingListRefreshRef = useRef(false);

  const [, forceRender] = useState(0);

  const markAsRead = useCallback(
    async (id: number | string) => {
      const recentKey = notificationKeys.recent();
      const prev = queryClient.getQueryData<NotificationPage>(recentKey);
      const wasUnread =
        prev?.data?.find((n) => String(n.id) === String(id))?.isRead === false;

      // Optimistic UI
      if (prev) {
        queryClient.setQueryData<NotificationPage>(recentKey, {
          ...prev,
          data: prev.data.map((n) =>
            String(n.id) === String(id) ? { ...n, isRead: true } : n
          ),
        });
      }
      if (wasUnread) {
        queryClient.setQueryData<number>(notificationKeys.unreadCount(), (c) =>
          Math.max(0, (Number(c) || 0) - 1)
        );
      }

      try {
        await service.markRead(id);
      } catch {
        /* server persists asynchronously; ignore transient errors */
      } finally {
        queryClient.invalidateQueries(notificationKeys.unreadCount());
        queryClient.invalidateQueries(notificationKeys.detail(id));
        queryClient.invalidateQueries(notificationKeys.lists());
      }
    },
    [queryClient, service]
  );

  /** Open a notification then navigate to the notifications page. */
  const goToNotificationCenter = useCallback(() => {
    if (hasPendingListRefreshRef.current) {
      queryClient.invalidateQueries(notificationKeys.lists());
      hasPendingListRefreshRef.current = false;
    }
    router.push(routes.notificationCenter);
  }, [queryClient, router]);

  const openNotification = useCallback(
    (item: NotificationItem) => {
      if (item?.id == null) return;
      router.push(
        `${routes.notificationCenter}?notification=${encodeURIComponent(
          String(item.id)
        )}`
      );
    },
    [router]
  );

  /** Show a toast card for a freshly delivered notification. */
  const showNotificationToast = useCallback(
    (item: NotificationItem) => {
      toast.custom(
        (t) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              toast.dismiss(t.id);
              openNotification(item);
            }}
            className={`pointer-events-auto flex w-[360px] max-w-[92vw] cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-right shadow-lg transition-all dark:border-gray-300 dark:bg-gray-100 ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-lighter text-primary [&>svg]:h-[18px] [&>svg]:w-auto">
              <RingBellSolidIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 truncate text-sm font-semibold text-gray-900">
                {item.title || 'اعلان جدید'}
              </p>
              <p className="line-clamp-2 text-xs text-gray-600">
                {item.message}
              </p>
            </div>
          </div>
        ),
        { duration: 6000, position: 'top-center' }
      );
    },
    [openNotification]
  );

  /* ---------------------------------------------------------------------- */
  /* Badge count — polled every 30s                                          */
  /* ---------------------------------------------------------------------- */
  const unreadCountQuery = useQuery(
    notificationKeys.unreadCount(),
    () => service.getUnreadCount(),
    {
      enabled,
      refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
      staleTime: 0,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* Recent list — feeds the header dropdown                                 */
  /* ---------------------------------------------------------------------- */
  const recentQuery = useQuery(
    notificationKeys.recent(),
    service.getActiveRecent,
    {
      enabled,
      staleTime: 10 * 60 * 1000,
      refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
      initialData: readCachedRecent,
      onSuccess: (page) => writeCachedRecent(page),
    }
  );

  // Observe the page's cache as well, so successful reads disappear immediately
  // even when a server refetch still returns the old asynchronous read status.
  const inboxQuery = useQuery(notificationKeys.inbox(), service.getInbox, {
    enabled: false,
  });
  const recentItems = useMemo(() => {
    const inboxById = new Map(
      (inboxQuery.data ?? []).map((item) => [String(item.id), item])
    );
    return (recentQuery.data?.data ?? [])
      .filter((item) => {
        const latest = inboxById.get(String(item.id));
        return (
          !item.isRead && !item.archived && !latest?.isRead && !latest?.archived
        );
      })
      .slice(0, NOTIFICATIONS_DROPDOWN_SIZE);
  }, [recentQuery.data, inboxQuery.data]);

  useEffect(() => {
    if (recentQuery.data)
      writeCachedRecent({ ...recentQuery.data, data: recentItems });
  }, [recentQuery.data, recentItems]);

  /* ---------------------------------------------------------------------- */
  /* Updates poll — drives toasts + cache invalidation                       */
  /* ---------------------------------------------------------------------- */
  const advanceSince = useCallback((updates: NotificationItem[]) => {
    let newest = 0;
    updates.forEach((n) => {
      const t = n.createdAt ? Date.parse(n.createdAt) : NaN;
      if (!Number.isNaN(t) && t > newest) newest = t;
    });
    const next = newest
      ? new Date(newest).toISOString()
      : new Date().toISOString();
    sinceRef.current = next;
    writeLastSeen(next);
  }, []);

  useQuery(
    notificationKeys.updates(),
    () => service.getUpdates(sinceRef.current),
    {
      enabled,
      refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
      staleTime: 0,
      onSuccess: (updates) => {
        // Seed the baseline on the first poll so we don't toast a backlog
        // that accumulated while the panel was closed.
        if (isFirstUpdateRef.current) {
          isFirstUpdateRef.current = false;
          updates.forEach((n) => seenIdsRef.current.add(String(n.id)));
          advanceSince(updates);
          return;
        }

        const fresh = updates.filter(
          (n) => !seenIdsRef.current.has(String(n.id))
        );
        fresh.forEach((n) => seenIdsRef.current.add(String(n.id)));
        advanceSince(updates);

        if (!fresh.length) return;

        hasPendingListRefreshRef.current = true;

        // Toast each freshly delivered (still-unread) notification. Cap the
        // number of individual toasts to avoid flooding the screen.
        const toToast = fresh.filter((n) => !n.isRead);
        const MAX_TOASTS = 4;
        toToast.slice(0, MAX_TOASTS).forEach((n) => showNotificationToast(n));
        if (toToast.length > MAX_TOASTS) {
          toast.success(`${toToast.length} اعلان جدید دریافت شد`, {
            duration: 5000,
          });
        }

        // New data arrived: refresh badge + dropdown caches immediately.
        queryClient.invalidateQueries(notificationKeys.unreadCount());
        queryClient.invalidateQueries(notificationKeys.recent());
        // List cache is invalidated lazily via goToNotificationCenter when the
        // user actually navigates to /notifications.
      },
    }
  );

  /* ---------------------------------------------------------------------- */
  /* Mutations                                                               */
  /* ---------------------------------------------------------------------- */
  const markAllAsRead = useCallback(async () => {
    const recentKey = notificationKeys.recent();
    const prev = queryClient.getQueryData<NotificationPage>(recentKey);
    const unread = (prev?.data ?? []).filter((n) => !n.isRead);
    if (!unread.length) return;

    if (prev) {
      queryClient.setQueryData<NotificationPage>(recentKey, {
        ...prev,
        data: prev.data.map((n) => ({ ...n, isRead: true })),
      });
    }
    queryClient.setQueryData<number>(notificationKeys.unreadCount(), (count) =>
      Math.max(0, (Number(count) || 0) - unread.length)
    );

    const results = await Promise.allSettled(
      unread.map((n) => service.markRead(n.id))
    );
    const readIds = new Set(
      unread
        .filter((_, index) => results[index].status === 'fulfilled')
        .map((item) => String(item.id))
    );
    queryClient.setQueryData<NotificationItem[]>(
      notificationKeys.inbox(),
      (items) =>
        items?.map((item) =>
          readIds.has(String(item.id)) ? { ...item, isRead: true } : item
        )
    );
    if (prev) {
      queryClient.setQueryData<NotificationPage>(recentKey, {
        ...prev,
        data: prev.data.map((item) =>
          readIds.has(String(item.id)) ? { ...item, isRead: true } : item
        ),
      });
    }
    if (readIds.size < unread.length)
      toast.error('خوانده‌شدن بعضی اعلان‌ها ثبت نشد؛ دوباره تلاش کنید');

    queryClient.invalidateQueries(notificationKeys.unreadCount());
    queryClient.invalidateQueries(notificationKeys.recent());
  }, [queryClient, service]);

  const archiveItem = useCallback(
    async (id: number | string) => {
      const recentKey = notificationKeys.recent();
      const prev = queryClient.getQueryData<NotificationPage>(recentKey);
      if (prev) {
        queryClient.setQueryData<NotificationPage>(recentKey, {
          ...prev,
          data: prev.data.filter((n) => String(n.id) !== String(id)),
        });
      }
      try {
        await service.archive(id);
      } finally {
        queryClient.invalidateQueries(notificationKeys.recent());
        queryClient.invalidateQueries(notificationKeys.lists());
        queryClient.invalidateQueries(notificationKeys.unreadCount());
      }
    },
    [queryClient, service]
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries(notificationKeys.unreadCount());
    queryClient.invalidateQueries(notificationKeys.recent());
    // Trigger a re-render so consumers relying on derived values update.
    forceRender((n) => n + 1);
  }, [queryClient]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      unreadCount: Number(unreadCountQuery.data) || 0,
      recentItems,
      isLoading: recentQuery.isLoading || unreadCountQuery.isLoading,
      refresh,
      markAsRead,
      markAllAsRead,
      archiveItem,
      goToNotificationCenter,
      openNotification,
    }),
    [
      unreadCountQuery.data,
      unreadCountQuery.isLoading,
      recentItems,
      recentQuery.isLoading,
      refresh,
      markAsRead,
      markAllAsRead,
      archiveItem,
      goToNotificationCenter,
      openNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Public provider — owns a QueryClient shared by the header and pages         */
/* -------------------------------------------------------------------------- */

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationInner>{children}</NotificationInner>
    </QueryClientProvider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return ctx;
}
