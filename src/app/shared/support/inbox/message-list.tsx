'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { atomWithReset, atomWithStorage } from 'jotai/utils';
import { useRouter } from 'next/navigation';
import {
  PiArrowLeft,
  PiArrowRight,
  PiCaretDownBold,
  PiChatCircleDots,
  PiHash,
  PiMagnifyingGlass,
  PiX,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import Select from '@/components/ui/select';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import rangeMap from '@/utils/range-map';
import { routes } from '@/config/routes';
import { LineGroup, Skeleton } from '@/components/ui/skeleton';
import useAxiosPrivate from '@/hooks/use-axios-private';
import toast from 'react-hot-toast';
import { tabAtom } from './inbox-tabs';

interface MessageItemProps {
  message: any;
  className?: string;
}

export const messageIdAtom = atomWithStorage('messageId', '');
export const ticketInfoAtom = atomWithStorage<any | null>('ticketInfo', null);
export const dataAtom = atomWithReset<any[]>([]);
export const ticketStatsAtom = atomWithStorage('ticketStats', {
  totalTickets: 0,
  openTickets: 0,
  closedTickets: 0,
});

const statusStyles: Record<string, string> = {
  PENDING: 'border-orange-200 bg-orange-50 text-orange-700',
  ANSWERED: 'border-green-200 bg-green-50 text-green-700',
  CLOSED: 'border-gray-200 bg-gray-100 text-gray-600',
};

const departmentLabels: Record<string, string> = {
  MANAGEMENT: 'مدیریت',
  SUPPORT: 'پشتیبانی فنی',
  FINANCE: 'مالی و اعتباری',
};

const priorityLabels: Record<string, string> = {
  LOW: 'اولویت کم',
  Low: 'اولویت کم',
  MEDIUM: 'اولویت متوسط',
  Medium: 'اولویت متوسط',
  HIGH: 'اولویت بالا',
  High: 'اولویت بالا',
};

function getStatusLabel(message: any) {
  if (message.statusStr) return message.statusStr;
  if (message.status === 'ANSWERED') return 'پاسخ داده شده';
  if (message.status === 'CLOSED') return 'بسته';
  return 'در انتظار پاسخ';
}

export function MessageItem({ className, message }: MessageItemProps) {
  const router = useRouter();
  const isMobile = useMedia('(max-width: 1279px)', false);
  const [messageId, setMessageId] = useAtom(messageIdAtom);
  const [, setTicketInfo] = useAtom(ticketInfoAtom);
  const isActive = messageId === message.id;
  const department =
    message.departmentStr || departmentLabels[message.department] || 'پشتیبانی';
  const priority =
    message.priorityStr || priorityLabels[message.priority] || 'اولویت معمولی';

  function handleChange() {
    setMessageId(message.id);
    setTicketInfo(message);
    if (isMobile) {
      router.push(routes.support.messageDetails(message.id));
    }
  }

  return (
    <button
      type="button"
      onClick={handleChange}
      className={cn(
        'group relative w-full border-b border-gray-100 px-4 py-3.5 text-right transition-colors last:border-b-0 hover:bg-gray-50/80',
        isActive && 'bg-primary-lighter/40 hover:bg-primary-lighter/50',
        className
      )}
    >
      <span
        className={cn(
          'absolute inset-y-3 right-0 w-1 rounded-l-full bg-primary transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
      />
      <span className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 grid h-10 w-10 flex-none place-items-center rounded-xl border transition-colors',
            isActive
              ? 'border-primary/20 bg-primary text-white'
              : 'border-gray-200 bg-white text-gray-500 group-hover:text-primary'
          )}
        >
          <PiChatCircleDots className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <Text
              tag="h4"
              className="line-clamp-2 text-sm font-semibold leading-6 text-gray-900"
            >
              {message.subject}
            </Text>
            <span
              className={cn(
                'flex-none rounded-full border px-2 py-1 text-[10px] font-medium',
                statusStyles[message.status] || statusStyles.PENDING
              )}
            >
              {getStatusLabel(message)}
            </span>
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
            {message.ticketRefId && (
              <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                <PiHash className="h-3.5 w-3.5" />
                {message.ticketRefId}
              </span>
            )}
            <span>{department}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{priority}</span>
          </span>

          <span className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] text-gray-400">آخرین به‌روزرسانی</span>
            <span className="text-xs font-medium text-gray-600">
              {message.updatedAtStr || '—'}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

const sortOptions = {
  asc: 'asc',
  desc: 'desc',
} as const;

const options = [
  { value: sortOptions.desc, name: 'جدیدترین' },
  { value: sortOptions.asc, name: 'قدیمی‌ترین' },
];

interface InboxListProps {
  className?: string;
  refetchTickets?: number;
}

type SortByType = (typeof sortOptions)[keyof typeof sortOptions];

export default function MessageList({
  className,
  refetchTickets = 0,
}: InboxListProps) {
  const _axios = useAxiosPrivate();
  const [data, setData] = useAtom(dataAtom);
  const [, setMessageId] = useAtom(messageIdAtom);
  const [, setTicketStats] = useAtom(ticketStatsAtom);
  const [tab] = useAtom(tabAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortByType>(sortOptions.desc);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const latestRequestRef = useRef(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const visibleTickets = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fa-IR');
    if (!query) return data;

    return data.filter((ticket) =>
      [
        ticket.subject,
        ticket.ticketRefId,
        ticket.statusStr,
        ticket.departmentStr,
        departmentLabels[ticket.department],
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase('fa-IR').includes(query)
        )
    );
  }, [data, search]);

  useEffect(() => {
    const fetchTicketStats = async () => {
      try {
        const response = await _axios.get('/ticket/stats');
        if (response.data.status === 'SUCCESS') {
          setTicketStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching ticket stats:', error);
        toast.error('خطا در دریافت آمار تیکت‌ها');
      }
    };

    fetchTicketStats();
  }, [_axios, refetchTickets, setTicketStats]);

  useEffect(() => {
    setCurrentPage(1);
    setSearch('');
  }, [tab]);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const status =
          tab === 'open' ? 'PENDING' : tab === 'closed' ? 'CLOSED' : null;
        const response = await _axios.get('/ticket/', {
          params: { status, sortDir: sortBy, page: currentPage, size: pageSize },
        });

        if (requestId !== latestRequestRef.current) return;
        if (response.data.status === 'SUCCESS') {
          const tickets = response.data.data || [];
          const pageTickets =
            tickets.length > pageSize
              ? tickets.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize
                )
              : tickets;
          setData(pageTickets);
          setTotalItems(response.data.pagination?.totalElements || tickets.length);
          setMessageId(pageTickets[0]?.id || '');
        }
      } catch (error) {
        if (requestId !== latestRequestRef.current) return;
        console.error('Error fetching ticket data:', error);
        toast.error('خطا در دریافت تیکت‌ها');
      } finally {
        if (requestId === latestRequestRef.current) setIsLoading(false);
      }
    };

    fetchTickets();
  }, [
    _axios,
    currentPage,
    pageSize,
    refetchTickets,
    tab,
    sortBy,
    setData,
    setMessageId,
  ]);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-gray-50',
        className
      )}
    >
      <div className="border-b border-gray-100 px-4 py-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <Text tag="h3" className="text-base font-bold text-gray-900">
              درخواست‌های من
            </Text>
            <p className="mt-1 text-xs text-gray-500">
              {totalItems.toLocaleString('fa-IR')} تیکت در این بخش
            </p>
          </div>
          <Select
            size="sm"
            variant="outline"
            value={sortBy}
            options={options}
            getOptionValue={(option) => option.value}
            onChange={(option: SortByType) => setSortBy(option)}
            displayValue={(selected) =>
              options.find((option) => option.value === selected)?.name
            }
            suffix={<PiCaretDownBold className="h-3.5 w-3.5" />}
            selectClassName="min-w-[108px] text-xs"
            optionClassName="text-xs"
            dropdownClassName="p-2 w-32 left-0 right-auto"
          />
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو در عنوان یا شماره تیکت..."
          prefix={<PiMagnifyingGlass className="h-4 w-4 text-gray-400" />}
          suffix={
            search ? (
              <button
                type="button"
                aria-label="پاک کردن جستجو"
                onClick={() => setSearch('')}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <PiX className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
          inputClassName="text-sm"
        />
      </div>

      <div aria-live="polite">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {rangeMap(5, (index) => (
              <MessageLoader key={index} />
            ))}
          </div>
        ) : visibleTickets.length > 0 ? (
          visibleTickets.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        ) : (
          <div className="grid min-h-[280px] place-items-center p-6 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 text-gray-400">
                <PiChatCircleDots className="h-7 w-7" />
              </span>
              <Text tag="h4" className="mt-4 font-semibold text-gray-800">
                {search ? 'نتیجه‌ای پیدا نشد' : 'تیکتی در این بخش نیست'}
              </Text>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {search
                  ? 'عبارت دیگری را امتحان کنید یا جستجو را پاک کنید.'
                  : 'درخواست‌های مرتبط با این وضعیت اینجا نمایش داده می‌شوند.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && !search && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="gap-1 px-2.5"
          >
            <PiArrowRight className="h-4 w-4" />
            قبلی
          </Button>
          <span className="text-xs text-gray-500">
            صفحه {currentPage.toLocaleString('fa-IR')} از{' '}
            {totalPages.toLocaleString('fa-IR')}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="gap-1 px-2.5"
          >
            بعدی
            <PiArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

export function MessageLoader() {
  return (
    <div className="grid gap-3 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3 rounded" />
          <Skeleton className="h-2.5 w-1/3 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <LineGroup
        columns={4}
        className="mr-13 grid grid-cols-4 gap-1.5"
        skeletonClassName="h-2"
      />
    </div>
  );
}
