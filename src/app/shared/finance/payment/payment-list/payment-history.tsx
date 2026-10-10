'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { useQuery } from 'react-query';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  FileSearch,
  LifeBuoy,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react';
import { routes } from '@/config/routes';
import useAxiosPrivate from '@/hooks/use-axios-private';
import toast from 'react-hot-toast';
import {
  filterPayments,
  formatNumber,
  getStatus,
  paymentAmount,
  paymentsCsv,
  type Payment,
  type Sort,
  type Status,
} from './payment-utils';
import styles from './payments.module.css';

const statusLabels = {
  all: 'همه پرداخت‌ها',
  success: 'موفق',
  failed: 'ناموفق',
  other: 'سایر وضعیت‌ها',
};
const statusIcons = {
  success: CheckCircle2,
  failed: CircleAlert,
  other: Clock3,
};

export default function PaymentTransactionsTable() {
  const axios = useAxiosPrivate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<Payment | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isFetching, isError, refetch } = useQuery<Payment[]>(
    ['payment-history-complete'],
    async ({ signal }) => {
      // Read each server page so filters, summaries and CSV share the same complete dataset.
      const payments: Payment[] = [];
      let pageNumber = 1;
      let total = 0;
      do {
        const response = await axios.get('/payment/me', {
          params: { pageNumber, pageSize: 100, filter: '' },
          signal,
        });
        if (
          response.data.statusCode !== 200 ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error('Failed to fetch payments');
        }
        const batch: Payment[] = response.data.data;
        total = Number(response.data.pagination?.totalElements ?? batch.length);
        if (
          !Number.isFinite(total) ||
          total < 0 ||
          (!batch.length && payments.length < total)
        ) {
          throw new Error('Incomplete payment history');
        }
        payments.push(...batch);
        pageNumber += 1;
      } while (payments.length < total);
      return payments;
    },
    { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false }
  );

  const payments = useMemo(() => data ?? [], [data]);
  const counts = useMemo(
    () =>
      payments.reduce(
        (result, payment) => {
          result[getStatus(payment)] += 1;
          return result;
        },
        { all: payments.length, success: 0, failed: 0, other: 0 }
      ),
    [payments]
  );
  const successful = payments.filter(
    (payment) => getStatus(payment) === 'success'
  );
  const totalAmount = successful.reduce(
    (sum, payment) => sum + (paymentAmount(payment) ?? 0),
    0
  );
  const hasUnknownAmount = successful.some(
    (payment) => paymentAmount(payment) === null
  );
  const filtered = useMemo(
    () => filterPayments(payments, search, status, sort),
    [payments, search, status, sort]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * pageSize;
  const visible = filtered.slice(offset, offset + pageSize);
  const hasFilters = Boolean(search.trim()) || status !== 'all';
  const ready = data !== undefined;

  function resetFilters() {
    setSearch('');
    setStatus('all');
    setPage(1);
    searchRef.current?.focus();
  }

  function exportPayments() {
    if (!filtered.length || isFetching) return;
    const url = URL.createObjectURL(
      new Blob([paymentsCsv(filtered)], { type: 'text/csv;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `foodkeys-payments-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`خروجی ${formatNumber(filtered.length)} پرداخت آماده شد`);
  }

  return (
    <div className={styles.page} dir="rtl">
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
        <Link href={routes.wallet.main}>امور مالی</Link>
        <ChevronLeft aria-hidden="true" />
        <span aria-current="page">سوابق پرداخت</span>
      </nav>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>مدیریت پرداخت‌های شما</span>
          <h1>
            سوابق پرداخت<span className={styles.titleDot}>.</span>
          </h1>
          <p>
            هر پرداخت، با تمام جزئیات. سوابق مالی‌تان را به‌سادگی دنبال کنید.
          </p>
        </div>
        <Link href={routes.wallet.main} className={styles.primaryButton}>
          <Plus size={18} aria-hidden="true" /> افزایش اعتبار{' '}
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
      </header>

      <section
        className={styles.summary}
        aria-label="خلاصه تمام سوابق پرداخت"
        aria-busy={isLoading}
      >
        <article className={styles.amountCard}>
          <div className={styles.cardTop}>
            <span>مجموع پرداخت‌های موفق</span>
            <span className={styles.amountIcon}>
              <Wallet size={20} />
            </span>
          </div>
          <p className={styles.amountValue}>
            {ready && !hasUnknownAmount ? formatNumber(totalAmount) : '—'}
            <span>تومان</span>
          </p>
          <div className={styles.amountFoot}>
            <span>
              <CheckCircle2 size={14} />{' '}
              {ready
                ? `${formatNumber(counts.success)} پرداخت موفق`
                : 'در حال دریافت سوابق'}
            </span>
            <span>تمام سوابق</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.cardTop}>
            <span>تعداد پرداخت‌ها</span>
            <span className={styles.statIcon}>
              <ReceiptText size={20} />
            </span>
          </div>
          <p className={styles.statValue}>
            {ready ? formatNumber(counts.all) : '—'}
            <span>تراکنش</span>
          </p>
          <p className={styles.statHint}>همه پرداخت‌های ثبت‌شده در حساب شما</p>
        </article>
        <article className={styles.statCard}>
          <div className={styles.cardTop}>
            <span>پرداخت‌های ناموفق</span>
            <span className={styles.failedIcon}>
              <CircleAlert size={20} />
            </span>
          </div>
          <p className={styles.statValue}>
            {ready ? formatNumber(counts.failed) : '—'}
            <span>تراکنش</span>
          </p>
          <button
            className={styles.textButton}
            onClick={() => {
              setStatus('failed');
              setPage(1);
            }}
            disabled={!ready}
          >
            بررسی پرداخت‌ها <ArrowLeft size={15} />
          </button>
        </article>
      </section>

      <section className={styles.history} aria-labelledby="payment-list-title">
        <div className={styles.listHeading}>
          <div className={styles.listTitle}>
            <span className={styles.listIcon}>
              <ReceiptText size={20} />
            </span>
            <div>
              <h2 id="payment-list-title">تاریخچه پرداخت‌ها</h2>
              <p>جست‌وجو، بررسی وضعیت و دریافت جزئیات</p>
            </div>
          </div>
          <div className={styles.listActions}>
            <button
              className={styles.iconButton}
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="به‌روزرسانی پرداخت‌ها"
              title="به‌روزرسانی پرداخت‌ها"
            >
              <RefreshCw
                size={17}
                className={isFetching ? styles.spinning : ''}
              />
            </button>
            <button
              className={styles.secondaryButton}
              onClick={exportPayments}
              disabled={!filtered.length || isFetching}
              title="خروجی تمام نتایج مطابق جست‌وجو و فیلتر فعلی"
            >
              <Download size={16} />
              <span>خروجی نتایج</span>
              <span className={styles.csvLabel}>CSV</span>
            </button>
          </div>
        </div>
        <div
          className={styles.tabs}
          role="group"
          aria-label="فیلتر وضعیت پرداخت"
        >
          {(Object.keys(statusLabels) as Status[])
            .filter((key) => key !== 'other' || counts.other > 0)
            .map((key) => (
              <button
                key={key}
                aria-pressed={status === key}
                className={status === key ? styles.activeTab : styles.tab}
                onClick={() => {
                  setStatus(key);
                  setPage(1);
                }}
              >
                {key !== 'all' && (
                  <span className={`${styles.statusDot} ${styles[key]}`} />
                )}
                {statusLabels[key]}
                <span className={styles.tabCount}>
                  {ready ? formatNumber(counts[key]) : '—'}
                </span>
              </button>
            ))}
        </div>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={19} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="جست‌وجوی کد ارجاع، مبلغ یا توضیحات…"
              aria-label="جست‌وجو در تمام پرداخت‌ها"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                  searchRef.current?.focus();
                }}
                aria-label="پاک کردن جست‌وجو"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <label className={styles.sort}>
            <SlidersHorizontal size={16} />
            <span className={styles.srOnly}>مرتب‌سازی پرداخت‌ها</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as Sort);
                setPage(1);
              }}
            >
              <option value="newest">جدیدترین پرداخت‌ها</option>
              <option value="oldest">قدیمی‌ترین پرداخت‌ها</option>
              <option value="highest">بیشترین مبلغ</option>
              <option value="lowest">کمترین مبلغ</option>
            </select>
          </label>
        </div>
        {hasFilters && (
          <div className={styles.filterSummary}>
            <span role="status">
              {formatNumber(filtered.length)} نتیجه در تمام سوابق
              {status !== 'all' && ` · ${statusLabels[status]}`}
            </span>
            <button onClick={resetFilters}>
              پاک کردن فیلترها <X size={13} />
            </button>
          </div>
        )}
        {isError && ready && (
          <div className={styles.errorBanner} role="alert">
            <CircleAlert size={17} />
            <span>
              به‌روزرسانی انجام نشد؛ آخرین اطلاعات دریافت‌شده را می‌بینید.
            </span>
            <button onClick={() => refetch()}>تلاش دوباره</button>
          </div>
        )}
        <div aria-busy={isFetching}>
          {isLoading ? (
            <LoadingState />
          ) : isError && !ready ? (
            <div className={styles.empty} role="alert">
              <span className={styles.emptyIcon}>
                <CircleAlert size={30} />
              </span>
              <h3>دریافت سوابق انجام نشد</h3>
              <p>ارتباط با سرویس برقرار نشد. لطفاً دوباره تلاش کنید.</p>
              <button
                className={styles.secondaryButton}
                onClick={() => refetch()}
              >
                <RefreshCw size={16} /> تلاش دوباره
              </button>
            </div>
          ) : !visible.length ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                {hasFilters ? (
                  <FileSearch size={30} />
                ) : (
                  <ReceiptText size={30} />
                )}
              </span>
              <h3>
                {hasFilters
                  ? 'پرداختی با این مشخصات پیدا نشد'
                  : 'داستان پرداخت‌های شما از اینجا شروع می‌شود'}
              </h3>
              <p>
                {hasFilters
                  ? 'عبارت جست‌وجو یا وضعیت را تغییر دهید و دوباره بررسی کنید.'
                  : 'پس از اولین پرداخت، مبلغ، وضعیت و کد ارجاع آن را اینجا می‌بینید.'}
              </p>
              {hasFilters ? (
                <button
                  className={styles.secondaryButton}
                  onClick={resetFilters}
                >
                  نمایش همه پرداخت‌ها <ArrowLeft size={16} />
                </button>
              ) : (
                <Link
                  className={styles.primaryButton}
                  href={routes.wallet.main}
                >
                  رفتن به کیف پول <ArrowLeft size={16} />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.srOnly}>
                    سوابق پرداخت؛ همه مبالغ به تومان هستند
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">پرداخت / توضیحات</th>
                      <th scope="col">
                        مبلغ <span>(تومان)</span>
                      </th>
                      <th scope="col">تاریخ و ساعت</th>
                      <th scope="col">وضعیت</th>
                      <th scope="col">کد ارجاع</th>
                      <th scope="col">
                        <span className={styles.srOnly}>جزئیات</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((payment, index) => (
                      <tr
                        key={payment.id ?? `${payment.refId}-${offset + index}`}
                      >
                        <td>
                          <div className={styles.paymentIdentity}>
                            <span className={styles.paymentIcon}>
                              <ArrowDownLeft size={19} />
                            </span>
                            <div>
                              <strong>
                                {payment.description || 'پرداخت آنلاین'}
                              </strong>
                              <span>
                                {payment.description
                                  ? 'پرداخت ثبت‌شده در حساب'
                                  : 'توضیحی ثبت نشده است'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Money payment={payment} />
                        </td>
                        <td>
                          <div className={styles.date}>
                            {payment.createdAtStr || 'تاریخ ثبت نشده'}
                            <span dir="ltr">
                              {payment.createdAtTimeStr || '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge payment={payment} />
                        </td>
                        <td>
                          <ReferenceCode refId={payment.refId} />
                        </td>
                        <td>
                          <button
                            className={styles.detailButton}
                            onClick={() => setSelected(payment)}
                            aria-label={`جزئیات پرداخت ${
                              payment.createdAtStr || ''
                            } به مبلغ ${
                              paymentAmount(payment) ?? 'نامشخص'
                            } تومان`}
                          >
                            جزئیات <ChevronLeft size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.mobileList}>
                {visible.map((payment, index) => (
                  <article
                    className={styles.mobileCard}
                    key={payment.id ?? `${payment.refId}-${offset + index}`}
                  >
                    <div className={styles.mobileTop}>
                      <Money payment={payment} unit />
                      <StatusBadge payment={payment} />
                    </div>
                    <h3>{payment.description || 'پرداخت آنلاین'}</h3>
                    <p>
                      {payment.createdAtStr || 'تاریخ ثبت نشده'}
                      <span> · </span>
                      <bdi>{payment.createdAtTimeStr || '—'}</bdi>
                    </p>
                    <div className={styles.mobileBottom}>
                      <ReferenceCode refId={payment.refId} />
                      <button
                        className={styles.detailButton}
                        onClick={() => setSelected(payment)}
                      >
                        جزئیات پرداخت <ChevronLeft size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
        {ready && filtered.length > 0 && (
          <footer className={styles.pagination}>
            <div className={styles.pageInfo} role="status">
              نمایش{' '}
              <strong>
                {formatNumber(offset + 1)}–
                {formatNumber(Math.min(offset + pageSize, filtered.length))}
              </strong>{' '}
              از <strong>{formatNumber(filtered.length)}</strong> پرداخت
            </div>
            <label className={styles.pageSize}>
              در هر صفحه
              <select
                aria-label="تعداد پرداخت در هر صفحه"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[8, 16, 32].map((value) => (
                  <option key={value} value={value}>
                    {formatNumber(value)}
                  </option>
                ))}
              </select>
            </label>
            <nav
              className={styles.pageButtons}
              aria-label="صفحه‌بندی پرداخت‌ها"
            >
              <button
                className={styles.iconButton}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="صفحه قبل"
              >
                <ChevronRight size={17} />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1)
                .filter(
                  (value) =>
                    value === 1 ||
                    value === pageCount ||
                    Math.abs(value - currentPage) <= 1
                )
                .map((value, index, list) => (
                  <React.Fragment key={value}>
                    {index > 0 && value - list[index - 1] > 1 && <span>…</span>}
                    <button
                      className={
                        currentPage === value
                          ? styles.currentPage
                          : styles.pageButton
                      }
                      onClick={() => setPage(value)}
                      aria-label={`صفحه ${formatNumber(value)}`}
                      aria-current={currentPage === value ? 'page' : undefined}
                    >
                      {formatNumber(value)}
                    </button>
                  </React.Fragment>
                ))}
              <button
                className={styles.iconButton}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                aria-label="صفحه بعد"
              >
                <ChevronLeft size={17} />
              </button>
            </nav>
          </footer>
        )}
      </section>
      <aside className={styles.help}>
        <span className={styles.helpIcon}>
          <LifeBuoy size={21} />
        </span>
        <div>
          <h2>درباره یک پرداخت سؤال دارید؟</h2>
          <p>
            جزئیات پرداخت و کد ارجاع را برای بررسی دقیق‌تر در تیکت پشتیبانی وارد
            کنید.
          </p>
        </div>
        <Link href={routes.support.createTicket}>
          ارتباط با پشتیبانی <ArrowLeft size={16} />
        </Link>
      </aside>
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        className={`${styles.dialog} ${styles.page}`}
        dir="rtl"
      >
        <div className={styles.backdrop} aria-hidden="true" />
        <div className={styles.dialogPosition}>
          <Dialog.Panel className={styles.dialogPanel}>
            {selected && (
              <>
                <div className={styles.dialogHeading}>
                  <span className={styles.listIcon}>
                    <ReceiptText size={22} />
                  </span>
                  <Dialog.Title>جزئیات پرداخت</Dialog.Title>
                  <button
                    className={styles.iconButton}
                    onClick={() => setSelected(null)}
                    aria-label="بستن جزئیات پرداخت"
                  >
                    <X size={19} />
                  </button>
                </div>
                <Dialog.Description className={styles.dialogDescription}>
                  اطلاعات ثبت‌شده برای این پرداخت در حساب شما
                </Dialog.Description>
                <div className={styles.receiptAmount}>
                  <Money payment={selected} unit />
                  <StatusBadge payment={selected} />
                </div>
                <dl className={styles.receiptFields}>
                  <div>
                    <dt>تاریخ پرداخت</dt>
                    <dd>{selected.createdAtStr || 'ثبت نشده'}</dd>
                  </div>
                  <div>
                    <dt>ساعت</dt>
                    <dd>
                      <bdi>{selected.createdAtTimeStr || 'ثبت نشده'}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>کد ارجاع بانکی</dt>
                    <dd>
                      <ReferenceCode refId={selected.refId} />
                    </dd>
                  </div>
                  <div>
                    <dt>توضیحات</dt>
                    <dd>
                      {selected.description ||
                        'توضیحی برای این پرداخت ثبت نشده است.'}
                    </dd>
                  </div>
                </dl>
                {getStatus(selected) === 'failed' && (
                  <p className={styles.receiptNote}>
                    <CircleAlert size={17} />
                    این پرداخت ناموفق ثبت شده است. اگر مبلغ از حساب بانکی شما
                    کسر شده، برای بررسی با پشتیبانی تماس بگیرید.
                  </p>
                )}
                <div className={styles.dialogActions}>
                  <Link
                    href={routes.support.createTicket}
                    className={styles.secondaryButton}
                  >
                    <LifeBuoy size={16} /> پیگیری از پشتیبانی
                  </Link>
                  <button
                    className={styles.primaryButton}
                    onClick={() => setSelected(null)}
                  >
                    بستن جزئیات
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

function Money({
  payment,
  unit = false,
}: {
  payment: Payment;
  unit?: boolean;
}) {
  const amount = paymentAmount(payment);
  return (
    <span className={styles.money}>
      {amount === null ? 'نامشخص' : formatNumber(amount)}
      {unit && amount !== null && <small>تومان</small>}
    </span>
  );
}

function StatusBadge({ payment }: { payment: Payment }) {
  const status = getStatus(payment);
  const Icon = statusIcons[status];
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <Icon size={13} />
      {status === 'other'
        ? payment.paymentStatus || 'در انتظار بررسی'
        : statusLabels[status]}
    </span>
  );
}

function ReferenceCode({ refId }: { refId?: string | number }) {
  const [copied, setCopied] = useState(false);
  if (refId === undefined || refId === null || String(refId).trim() === '')
    return <span className={styles.noReference}>ثبت نشده</span>;
  async function copy() {
    try {
      await navigator.clipboard.writeText(String(refId));
      setCopied(true);
      toast.success('کد ارجاع کپی شد');
    } catch {
      toast.error('کپی انجام نشد؛ کد ارجاع را انتخاب و کپی کنید.');
    }
  }
  return (
    <button
      className={styles.reference}
      onClick={copy}
      aria-label={`کپی کد ارجاع ${refId}`}
      title={copied ? 'کد ارجاع کپی شد' : 'کپی کد ارجاع'}
    >
      <bdi>{refId}</bdi>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.srOnly}>در حال دریافت سوابق پرداخت</span>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row}>
          <i />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
