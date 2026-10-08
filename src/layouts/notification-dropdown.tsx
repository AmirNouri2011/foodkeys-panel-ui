'use client';

import { RefObject, useState } from 'react';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Popover } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import Link from 'next/link';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { PiCheck } from 'react-icons/pi';
import { useNotifications } from '@/context/NotificationContext';
import { routes } from '@/config/routes';
import { NotificationItem } from '@/config/notifications';
import { Empty, EmptyBoxIcon } from '@/components/ui/empty';
import { Loader } from '@/components/ui/loader';

dayjs.extend(relativeTime);

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  const d = dayjs(iso);
  return d.isValid() ? d.locale('fa').fromNow() : '';
}

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    recentItems,
    isLoading,
    markAllAsRead,
    openNotification,
    goToNotificationCenter,
  } = useNotifications();

  const hasUnread = recentItems.some((n) => !n.isRead);

  const handleItemClick = (item: NotificationItem) => {
    setIsOpen(false);
    openNotification(item);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  return (
    <div className="w-[320px] text-left rtl:text-right sm:w-[360px] 2xl:w-[420px]">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Text tag="h5">اعلان‌ها</Text>
        <button
          type="button"
          disabled={!hasUnread}
          onClick={() => void handleMarkAll()}
          className="text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          همه را به عنوان خوانده شده علامت بزن
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : recentItems.length === 0 ? (
        <Empty
          image={<EmptyBoxIcon className="h-24 w-24" />}
          text="اعلانی وجود ندارد"
          textClassName="text-sm text-gray-500"
          className="py-8"
        />
      ) : (
        <SimpleBar className="max-h-[420px]">
          <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
            {recentItems.map((item) => (
              <div
                key={String(item.id)}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleItemClick(item);
                }}
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                  <RingBellSolidIcon />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <div className="w-full">
                    <Text
                      tag="h6"
                      className="mb-0.5 w-11/12 truncate text-sm font-semibold"
                    >
                      {item.title || 'اعلان'}
                    </Text>
                    <span className="ms-auto block truncate pe-8 text-xs text-gray-500">
                      {item.message}
                    </span>
                    {item.createdAt ? (
                      <span className="mt-0.5 block text-[10px] text-gray-400">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    ) : null}
                  </div>
                  <div className="ms-auto flex-shrink-0">
                    {!item.isRead ? (
                      <Badge
                        renderAsDot
                        size="lg"
                        color="primary"
                        className="scale-90"
                      />
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                        <PiCheck className="h-auto w-[9px]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleBar>
      )}

      <Link
        href={routes.notificationCenter}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(false);
          goToNotificationCenter();
        }}
        className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
      >
        نمایش همه اعلان‌ها
      </Link>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: JSX.Element & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const { refresh, goToNotificationCenter } = useNotifications();

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) refresh();
      }}
      content={() => <NotificationsList setIsOpen={setIsOpen} />}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
      className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
    >
      {children}
    </Popover>
  );
}
