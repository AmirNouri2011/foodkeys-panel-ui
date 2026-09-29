'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  CheckCircle2,
  CircleAlert,
  Clipboard,
  CreditCard,
  Download,
  FileSearch,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from 'lucide-react';
import TablePagination from '@/components/controlled-table/table-pagination';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';
import useAxiosPrivate from '@/hooks/use-axios-private';
import cn from '@/utils/class-names';
import toast from 'react-hot-toast';

type PaymentStatusFilter = 'all' | 'success' | 'failed';

type Payment = {
  id?: string | number;
  createdAtStr?: string;
  createdAtTimeStr?: string;
  amount?: number | string;
  description?: string;
  paymentStatus?: string;
  paymentStatusColor?: string;
  refId?: string | number;
};

type PaymentResponse = {
  data: Payment[];
  totalItems: number;
};

const formatNumber = (value: number | string = 0) =>
  Number(value || 0).toLocaleString('fa-IR');

const normalizeStatus = (status = '') => status.trim().toLowerCase();

const isSuccessful = (payment: Payment) => {
  const status = normalizeStatus(payment.paymentStatus);
  return (
    status === 'success' ||
    status === 'successful' ||
    (status.includes('موفق') && !status.includes('ناموفق'))
  );
};

const isFailed = (payment: Payment) => {
  const status = normalizeStatus(payment.paymentStatus);
  return (
    status === 'failed' ||
    status === 'failure' ||
    status.includes('ناموفق') ||
    status.includes('لغو')
  );
};

export default function PaymentTransactionsTable() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const axios = useAxiosPrivate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchValue.trim());
      setCurrentPage(1);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  const fetchPayments = async (): Promise<PaymentResponse> => {
    const response = await axios.get('/payment/me', {
      params: {
        pageNumber: currentPage,
        pageSize,
        filter: searchTerm,
      },
    });

    if (response.data.statusCode !== 200) {
      throw new Error('Failed to fetch payments');
    }

    return {
      data: response.data.data || [],
      totalItems: response.data.pagination?.totalElements || 0,
    };
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['payment-history', searchTerm, currentPage, pageSize],
    fetchPayments,
    { keepPreviousData: true }
  );

  const payments = useMemo(() => data?.data || [], [data?.data]);
  const successfulCount = payments.filter(isSuccessful).length;
  const failedCount = payments.filter(isFailed).length;
  const successfulAmount = payments
    .filter(isSuccessful)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const visiblePayments = useMemo(() => {
    if (statusFilter === 'success') return payments.filter(isSuccessful);
    if (statusFilter === 'failed') return payments.filter(isFailed);
    return payments;
  }, [payments, statusFilter]);

  const clearFilters = () => {
    setSearchValue('');
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    searchInputRef.current?.focus();
  };

  const copyReference = async (refId?: string | number) => {
    if (!refId) return;
    try {
      await navigator.clipboard.writeText(String(refId));
      toast.success('کد ارجاع کپی شد');
    } catch {
      toast.error('کپی کردن کد ارجاع انجام نشد');
    }
  };

  const exportPayments = () => {
    if (!visiblePayments.length) return;

    const rows = visiblePayments.map((payment) => [
      payment.createdAtStr || '',
      payment.createdAtTimeStr || '',
      payment.amount || 0,
      payment.description || '',
      payment.paymentStatus || '',
      payment.refId || '',
    ]);
    const csv = [
      ['تاریخ', 'ساعت', 'مبلغ (تومان)', 'توضیحات', 'وضعیت', 'کد ارجاع'],
      ...rows,
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <PaymentLoadingState />;

  if (isError) {
    return (
      <section
        className="rounded-2xl border border-red-lighter bg-white px-5 py-14 text-center shadow-sm dark:bg-gray-50"
        dir="rtl"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-lighter text-red">
          <CircleAlert className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-base font-bold text-gray-900">
          دریافت پرداخت‌ها انجام نشد
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          اتصال اینترنت یا دسترسی سرویس را بررسی کنید و دوباره تلاش کنید.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          تلاش دوباره
        </button>
      </section>
    );
  }

  return (
    <main className="space-y-5 pb-10" dir="rtl">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#176B57] via-[#115B4B] to-[#0D463B] p-5 text-white shadow-sm sm:p-7">
        <div className="absolute -left-12 -top-16 h-52 w-52 rounded-full border-[34px] border-white/5" />
        <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-white/[0.035]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="ring-white/15 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1">
              <ReceiptText className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                همه پرداخت‌ها، یک‌جا و شفاف
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/70">
                وضعیت پرداخت‌ها، مبلغ و کد ارجاع بانکی را بررسی کنید یا از
                اطلاعات نمایش‌داده‌شده خروجی بگیرید.
              </p>
            </div>
          </div>
          <Link
            href={routes.wallet.main}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#115B4B] shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#115B4B]"
          >
            <Plus className="h-4 w-4" />
            افزایش اعتبار
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<CreditCard className="h-5 w-5" />}
          label="کل پرداخت‌ها"
          value={formatNumber(data?.totalItems || 0)}
          hint={searchTerm ? 'نتیجه جست‌وجو' : 'تمام سوابق'}
          tone="primary"
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="پرداخت موفق"
          value={formatNumber(successfulCount)}
          hint="در این صفحه"
          tone="success"
        />
        <SummaryCard
          icon={<CircleAlert className="h-5 w-5" />}
          label="پرداخت ناموفق"
          value={formatNumber(failedCount)}
          hint="در این صفحه"
          tone="danger"
        />
        <SummaryCard
          icon={<WalletCards className="h-5 w-5" />}
          label="مبلغ موفق"
          value={formatNumber(successfulAmount)}
          hint="تومان · در این صفحه"
          tone="info"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-gray-50">
        <div className="border-b border-gray-100 p-4 dark:border-gray-200 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="جست‌وجو در کد ارجاع یا توضیحات…"
                aria-label="جست‌وجو در پرداخت‌ها"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-lighter dark:bg-gray-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  aria-label="پاک کردن جست‌وجو"
                  className="absolute left-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex flex-1 items-center rounded-xl bg-gray-100 p-1 sm:flex-none"
                role="group"
                aria-label="فیلتر وضعیت پرداخت"
              >
                <FilterButton
                  active={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                >
                  همه
                </FilterButton>
                <FilterButton
                  active={statusFilter === 'success'}
                  onClick={() => setStatusFilter('success')}
                >
                  موفق ({formatNumber(successfulCount)})
                </FilterButton>
                <FilterButton
                  active={statusFilter === 'failed'}
                  onClick={() => setStatusFilter('failed')}
                >
                  ناموفق ({formatNumber(failedCount)})
                </FilterButton>
              </div>
              <button
                type="button"
                onClick={exportPayments}
                disabled={!visiblePayments.length}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span className="hidden xs:inline">خروجی CSV</span>
                <span className="xs:hidden">خروجی</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative transition-opacity',
            isFetching && 'opacity-60'
          )}
        >
          {isFetching && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm">
              <Spinner size="sm" color="primary" />
            </div>
          )}

          {visiblePayments.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[780px] border-collapse text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500">
                      <th className="px-5 py-3.5">تاریخ پرداخت</th>
                      <th className="px-5 py-3.5">مبلغ</th>
                      <th className="px-5 py-3.5">توضیحات</th>
                      <th className="px-5 py-3.5">وضعیت</th>
                      <th className="px-5 py-3.5">کد ارجاع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visiblePayments.map((payment, index) => (
                      <PaymentRow
                        key={payment.id || `${payment.refId}-${index}`}
                        payment={payment}
                        onCopyReference={copyReference}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 md:hidden">
                {visiblePayments.map((payment, index) => (
                  <PaymentCard
                    key={payment.id || `${payment.refId}-${index}`}
                    payment={payment}
                    onCopyReference={copyReference}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              hasFilters={Boolean(searchTerm) || statusFilter !== 'all'}
              onClear={clearFilters}
            />
          )}
        </div>

        <div className="border-t border-gray-100 px-4 pb-5 dark:border-gray-200 sm:px-5">
          <TablePagination
            pageSize={pageSize}
            setPageSize={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
            total={data?.totalItems || 0}
            current={currentPage}
            onChange={(page) => setCurrentPage(page)}
            paginatorClassName="mt-5"
          />
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: 'primary' | 'success' | 'danger' | 'info';
}) {
  const tones = {
    primary: 'bg-primary-lighter text-primary',
    success: 'bg-green-lighter text-green-dark',
    danger: 'bg-red-lighter text-red',
    info: 'bg-blue-lighter text-blue',
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-50 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-2 truncate text-lg font-bold text-gray-900 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 truncate text-[11px] text-gray-400 sm:text-xs">
            {hint}
          </p>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            tones[tone]
          )}
        >
          {icon}
        </span>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:flex-none sm:text-sm',
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-800'
      )}
    >
      {children}
    </button>
  );
}

function PaymentRow({
  payment,
  onCopyReference,
}: {
  payment: Payment;
  onCopyReference: (refId?: string | number) => void;
}) {
  return (
    <tr className="group transition hover:bg-primary-lighter/20">
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-800">
          {payment.createdAtStr || '—'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {payment.createdAtTimeStr ? `ساعت ${payment.createdAtTimeStr}` : '—'}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="whitespace-nowrap font-bold text-gray-900">
          {formatNumber(payment.amount)}
          <span className="mr-1 text-xs font-normal text-gray-400">تومان</span>
        </p>
      </td>
      <td className="max-w-[260px] px-5 py-4 text-gray-600">
        <p className="truncate" title={payment.description || undefined}>
          {payment.description || 'بدون توضیحات'}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge payment={payment} />
      </td>
      <td className="px-5 py-4">
        <ReferenceCode
          refId={payment.refId}
          onCopyReference={onCopyReference}
        />
      </td>
    </tr>
  );
}

function PaymentCard({
  payment,
  onCopyReference,
}: {
  payment: Payment;
  onCopyReference: (refId?: string | number) => void;
}) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-gray-900">
            {formatNumber(payment.amount)}
            <span className="mr-1 text-xs font-normal text-gray-400">
              تومان
            </span>
          </p>
          <p className="mt-1.5 text-xs text-gray-500">
            {payment.createdAtStr || '—'}
            {payment.createdAtTimeStr && ` · ساعت ${payment.createdAtTimeStr}`}
          </p>
        </div>
        <StatusBadge payment={payment} />
      </div>
      <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-100">
        <p className="text-xs text-gray-400">توضیحات</p>
        <p className="mt-1 text-sm leading-6 text-gray-700">
          {payment.description || 'بدون توضیحات'}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400">کد ارجاع</span>
        <ReferenceCode
          refId={payment.refId}
          onCopyReference={onCopyReference}
        />
      </div>
    </article>
  );
}

function StatusBadge({ payment }: { payment: Payment }) {
  const successful = isSuccessful(payment);
  const failed = isFailed(payment);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        successful && 'bg-green-lighter text-green-dark',
        failed && 'bg-red-lighter text-red-dark',
        !successful && !failed && 'bg-orange-lighter text-orange-dark'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          successful && 'bg-green',
          failed && 'bg-red',
          !successful && !failed && 'bg-orange'
        )}
      />
      {payment.paymentStatus || 'در انتظار بررسی'}
    </span>
  );
}

function ReferenceCode({
  refId,
  onCopyReference,
}: {
  refId?: string | number;
  onCopyReference: (refId?: string | number) => void;
}) {
  if (!refId) return <span className="text-gray-300">—</span>;

  return (
    <button
      type="button"
      onClick={() => onCopyReference(refId)}
      title="کپی کد ارجاع"
      className="group/code inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-xs font-medium text-gray-700 transition hover:border-primary-light hover:bg-primary-lighter hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span dir="ltr">{refId}</span>
      <Clipboard className="h-3.5 w-3.5 text-gray-400 transition group-hover/code:text-primary" />
    </button>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="px-5 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <FileSearch className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-gray-900">
        {hasFilters
          ? 'پرداختی با این مشخصات پیدا نشد'
          : 'هنوز پرداختی ثبت نشده است'}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {hasFilters
          ? 'عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.'
          : 'پس از اولین پرداخت، جزئیات آن در این بخش نمایش داده می‌شود.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          پاک کردن همه فیلترها
        </button>
      )}
    </div>
  );
}

function PaymentLoadingState() {
  return (
    <div
      className="space-y-5 pb-10"
      dir="rtl"
      aria-label="در حال بارگذاری پرداخت‌ها"
    >
      <div className="h-36 animate-pulse rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100 lg:w-96" />
        <div className="min-h-56 mt-5 grid place-items-center">
          <div className="text-center">
            <Spinner size="xl" color="primary" />
            <p className="mt-4 text-sm text-gray-500">
              در حال دریافت پرداخت‌ها…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
