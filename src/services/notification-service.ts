'use client';

import { useCallback, useMemo } from 'react';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { NOTIFICATIONS_API_URL } from '@/config/api.config';
import {
  NotificationItem,
  NotificationPage,
  NOTIFICATIONS_DROPDOWN_SIZE,
  normalizeNotification,
} from '@/config/notifications';

/**
 * REST client for the redesigned notification system.
 *
 * Endpoints live at the server root (`/api/v1/notifications`). Because we pass
 * absolute URLs, axios ignores its configured `baseURL` (the client-panel
 * path) while the auth interceptor still attaches the bearer token.
 */
export const useNotificationService = () => {
  const axios = useAxiosPrivate();

  /** Badge count — `GET /unread-count` → `{ data: number }`. */
  const getUnreadCount = useCallback(async (): Promise<number> => {
    const res = await axios.get(`${NOTIFICATIONS_API_URL}/unread-count`);
    const payload = res?.data;
    const value =
      typeof payload === 'number'
        ? payload
        : payload?.data ?? payload?.count ?? 0;
    return Number(value) || 0;
  }, [axios]);

  /**
   * Lightweight polling — `GET /updates?since=`. Returns only notifications
   * newer than `since`. Used to drive toasts and badge/dropdown refreshes.
   */
  const getUpdates = useCallback(
    async (since?: string | null): Promise<NotificationItem[]> => {
      const qs = since ? `?since=${encodeURIComponent(since)}` : '';
      const res = await axios.get(`${NOTIFICATIONS_API_URL}/updates${qs}`);
      const list = res?.data?.data ?? res?.data ?? [];
      return (Array.isArray(list) ? list : []).map(normalizeNotification);
    },
    [axios]
  );

  /** Paginated list — `GET /` (active) or `GET /archive` (archived). */
  const getNotifications = useCallback(
    async (
      page = 1,
      size = 20,
      archived = false
    ): Promise<NotificationPage> => {
      const path = archived ? '/archive' : '';
      const res = await axios.get(
        `${NOTIFICATIONS_API_URL}${path}?pageNumber=${page}&pageSize=${size}`
      );
      const payload = res?.data ?? {};
      const list = payload?.data ?? [];
      const pagination = payload?.pagination ?? {};
      return {
        data: (Array.isArray(list) ? list : []).map(normalizeNotification),
        totalItems:
          pagination?.totalElements ?? pagination?.total ?? list?.length ?? 0,
        pageNumber: pagination?.pageNumber ?? page,
        pageSize: pagination?.pageSize ?? size,
        totalPages: pagination?.totalPages ?? 1,
      };
    },
    [axios]
  );

  /** Fill the dropdown with active items, skipping older read notifications. */
  const getActiveRecent = useCallback(async (): Promise<NotificationPage> => {
    const first = await getNotifications(1, 100, false);
    const active = first.data.filter((item) => !item.isRead && !item.archived);
    for (
      let page = 2;
      page <= first.totalPages && active.length < NOTIFICATIONS_DROPDOWN_SIZE;
      page += 1
    ) {
      const next = await getNotifications(page, 100, false);
      active.push(
        ...next.data.filter((item) => !item.isRead && !item.archived)
      );
    }
    return { ...first, data: active.slice(0, NOTIFICATIONS_DROPDOWN_SIZE) };
  }, [getNotifications]);

  /** Complete inbox for read-based tabs and their total counts. */
  const getInbox = useCallback(async (): Promise<NotificationItem[]> => {
    // The API partitions by manual archive status, not read status. Load both
    // partitions before regrouping so counts and pagination include older reads.
    const loadPartition = async (archived: boolean) => {
      const first = await getNotifications(1, 100, archived);
      const items = [...first.data];
      for (let page = 2; page <= first.totalPages; page += 1) {
        const next = await getNotifications(page, 100, archived);
        items.push(...next.data);
      }
      return archived
        ? items.map((item) => ({ ...item, archived: true }))
        : items;
    };
    const partitions = await Promise.all([
      loadPartition(false),
      loadPartition(true),
    ]);
    return Array.from(
      new Map(partitions.flat().map((item) => [String(item.id), item])).values()
    ).sort(
      (a, b) =>
        (Date.parse(b.createdAt ?? '') || 0) -
        (Date.parse(a.createdAt ?? '') || 0)
    );
  }, [getNotifications]);

  /** Full detail — `GET /{id}`. */
  const getNotificationById = useCallback(
    async (id: number | string): Promise<NotificationItem> => {
      const res = await axios.get(`${NOTIFICATIONS_API_URL}/${id}`);
      return normalizeNotification(res?.data?.data ?? res?.data);
    },
    [axios]
  );

  /** Mark read — `POST /{id}/read` (async / fire-and-forget on the server). */
  const markRead = useCallback(
    async (id: number | string): Promise<void> => {
      await axios.post(`${NOTIFICATIONS_API_URL}/${id}/read`);
    },
    [axios]
  );

  /** Archive — `POST /{id}/archive`. */
  const archive = useCallback(
    async (id: number | string): Promise<void> => {
      await axios.post(`${NOTIFICATIONS_API_URL}/${id}/archive`);
    },
    [axios]
  );

  return useMemo(
    () => ({
      getUnreadCount,
      getUpdates,
      getNotifications,
      getInbox,
      getActiveRecent,
      getNotificationById,
      markRead,
      archive,
    }),
    [
      getUnreadCount,
      getUpdates,
      getNotifications,
      getInbox,
      getActiveRecent,
      getNotificationById,
      markRead,
      archive,
    ]
  );
};

export type NotificationService = ReturnType<typeof useNotificationService>;
