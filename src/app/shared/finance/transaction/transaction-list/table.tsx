'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  CreditCard,
  Download,
  Eye,
  FileText,
  History,
  RefreshCw,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import useAxiosPrivate from '@/hooks/use-axios-private';
import {
  Transaction,
  gatewayLabel,
  transactionStatus,
  numberFa,
  amountValue,
  transactionDate,
  transactionTime,
  transactionKind,
  transactionAmountLabel,
} from './transaction-utils';
import styles from './transactions.module.css';

const transactionIcons = {
  credit: Plus,
  debit: Minus,
  subscription: ShoppingCart,
  unknown: CreditCard,
};

function TransactionIcon({
  row,
  size = 19,
}: {
  row: Transaction;
  size?: number;
}) {
  const Icon = transactionIcons[transactionKind(row)];
  return <Icon size={size} aria-hidden="true" />;
}

export default function TransactionsTable() {
  const axios = useAxiosPrivate();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('all');
  const [gateway, setGateway] = useState('all');
  const [sort, setSort] = useState('default');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
    }, 450);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  const query = useQuery(
    ['transactions', page, pageSize],
    async () => {
      const response = await axios.get('/transaction', {
        params: { pageNumber: page, pageSize },
      });
      if (
        response.data.statusCode !== 200 ||
        !Array.isArray(response.data.data)
      )
        throw new Error('Invalid transaction response');
      return {
        rows: response.data.data as Transaction[],
        total: Number(
          response.data.pagination?.totalElements ?? response.data.data.length
        ),
      };
    },
    { keepPreviousData: true }
  );
  const rows = useMemo(() => query.data?.rows ?? [], [query.data?.rows]);
  const summary = useQuery(
    ['transaction-summary'],
    async ({ signal }) => {
      const seen = new Set<string>();
      let total = 0;
      let successful = 0;
      let failed = 0;
      let successfulAmount = 0;
      let pageNumber = 1;

      // The API is paginated; finish reading all pages before publishing totals.
      do {
        const response = await axios
          .get('/transaction', {
            params: { pageNumber, pageSize: 50 },
            signal,
          })
          .catch((error) => {
            throw new Error(
              `Transaction summary page ${pageNumber} failed (${
                error.response?.status ?? error.code ?? 'network'
              }); received ${seen.size} of ${total}; ${
                error.response?.data?.message ?? ''
              }`
            );
          });
        const data = response.data;
        const count = Number(data.pagination?.totalElements);
        if (
          data.statusCode !== 200 ||
          !Array.isArray(data.data) ||
          !Number.isSafeInteger(count) ||
          count < 0
        )
          throw new Error('Invalid transaction summary response');

        total = count;
        const previousSize = seen.size;
        for (const row of data.data as Transaction[]) {
          if (seen.has(row.id)) continue;
          seen.add(row.id);
          const tone = transactionStatus(row).tone;
          if (tone === 'success') {
            successful++;
            successfulAmount += amountValue(row);
          } else if (tone === 'failed') {
            failed++;
          }
        }
        if (seen.size < total && seen.size === previousSize)
          throw new Error('Incomplete transaction summary');
        pageNumber++;
      } while (seen.size < total);

      return { total, successful, failed, successfulAmount };
    },
    { staleTime: 60_000, retry: 1 }
  );
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  // const gateways = Array.from(new Set(rows.map(gatewayLabel)));
  const visible = useMemo(() => {
    const result = rows.filter(
      (row) =>
        (status === 'all' || transactionStatus(row).tone === status) &&
        (gateway === 'all' || gatewayLabel(row) === gateway) &&
        [
          row.refId,
          row.serviceNameFa,
          row.serviceName,
          gatewayLabel(row),
          transactionStatus(row).label,
          String(amountValue(row)),
          numberFa(amountValue(row)),
        ]
          .join(' ')
          .toLocaleLowerCase('fa-IR')
          .includes(search.toLocaleLowerCase('fa-IR'))
    );
    return sort === 'default'
      ? result
      : result.sort((a, b) =>
          sort === 'high'
            ? amountValue(b) - amountValue(a)
            : amountValue(a) - amountValue(b)
        );
  }, [rows, status, gateway, sort, search]);
  const filtered = status !== 'all' || gateway !== 'all';
  const reset = () => {
    setInput('');
    setStatus('all');
    setGateway('all');
    setSort('default');
  };
  const downloadBill = async (row: Transaction) => {
    if (!row.id || downloading[row.id]) return;
    setDownloading((prev) => ({ ...prev, [row.id]: true }));
    try {
      const response = await axios.post(
        `/billing-info/generate-bill/${encodeURIComponent(row.id)}`,
        { templateId: 1 },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invoice.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('فاکتور دانلود شد');
    } catch {
      toast.error('دانلود فاکتور انجام نشد. دوباره تلاش کنید.');
    } finally {
      setDownloading((prev) => ({ ...prev, [row.id]: false }));
    }
  };
  const exportRows = () => {
    const cell = (value: unknown) =>
      `"${String(value ?? '')
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replace(/"/g, '""')}"`;
    const values = [
      [
        'نوع تراکنش',
        'مبلغ (ریال)',
        'درگاه پرداخت',
        'وضعیت',
        'تاریخ',
        'ساعت',
        'کد پیگیری',
      ],
      ...visible.map((row) => [
        row.serviceNameFa || row.serviceName,
        amountValue(row),
        gatewayLabel(row),
        transactionStatus(row).label,
        transactionDate(row),
        transactionTime(row),
        row.refId,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ['\uFEFF' + values.map((row) => row.map(cell).join(',')).join('\r\n')],
        { type: 'text/csv;charset=utf-8;' }
      )
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const billAvailable = (row: Transaction) =>
    row.hasBill ||
    (row.serviceName === 'BUY_SUBSCRIPTION' &&
      transactionStatus(row).tone === 'success');
  const badge = (row: Transaction) => {
    const state = transactionStatus(row);
    return (
      <span className={`${styles.badge} ${styles[state.tone]}`}>
        <i />
        {state.label}
      </span>
    );
  };

  return (
    <main className={styles.page} dir="rtl">
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
        <Link href="/">میز کار</Link>
        <ChevronLeft size={14} />
        <span>امور مالی</span>
        <ChevronLeft size={14} />
        <span>گردش حساب</span>
      </nav>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>گزارش مالی حساب شما</div>
          <h1>تراکنش‌ها و گردش حساب</h1>
          <p>
            پرداخت‌ها، وضعیت تراکنش‌ها و فاکتورهای خود را در یک نگاه دنبال کنید.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => {
              void query.refetch();
              void summary.refetch();
            }}
            disabled={query.isFetching || summary.isFetching}
            className={styles.button}
          >
            <RefreshCw
              size={16}
              className={
                query.isFetching || summary.isFetching ? styles.spin : ''
              }
            />
            به‌روزرسانی
          </button>
          <Link href="/finance/wallet" className={styles.primary}>
            <Wallet size={17} />
            کیف پول
            <ArrowLeft size={15} />
          </Link>
        </div>
      </header>
      <section className={styles.stats} aria-label="خلاصه تراکنش‌ها">
        {[
          {
            label: 'تعداد کل تراکنش‌ها',
            value: summary.data
              ? numberFa(summary.data.total)
              : query.data
              ? numberFa(query.data.total)
              : '—',
            hint: 'تمام سوابق حساب',
            icon: History,
            tone: 'brand',
          },
          {
            label: 'مبلغ تراکنش‌های موفق',
            value: summary.data ? numberFa(summary.data.successfulAmount) : '—',
            hint: 'ریال · تمام سوابق حساب',
            icon: CreditCard,
            tone: 'brand',
          },
          {
            label: 'پرداخت‌های موفق',
            value: summary.data ? numberFa(summary.data.successful) : '—',
            hint: 'تراکنش در تمام سوابق حساب',
            icon: CheckCircle2,
            tone: 'success',
          },
          {
            label: 'پرداخت‌های ناموفق',
            value: summary.data ? numberFa(summary.data.failed) : '—',
            hint: 'تراکنش در تمام سوابق حساب',
            icon: XCircle,
            tone: 'failed',
          },
        ].map((item) => (
          <article className={styles.stat} key={item.label}>
            <span className={`${styles.statIcon} ${styles[item.tone]}`}>
              <item.icon size={21} />
            </span>
            <span className={styles.statLabel}>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </article>
        ))}
      </section>
      {summary.isError && (
        <p role="alert" className={styles.note}>
          دریافت آمار کل تراکنش‌ها انجام نشد. برای تلاش دوباره، به‌روزرسانی را
          بزنید.
        </p>
      )}
      <section
        className={styles.panel}
        aria-labelledby="transaction-list-title"
      >
        <div className={styles.panelHeading}>
          <div>
            <h2 id="transaction-list-title">
              سوابق تراکنش‌ها <span>{query.data ? numberFa(total) : '—'}</span>
            </h2>
            <p>جزئیات هر پرداخت و درگاه استفاده‌شده را بررسی کنید.</p>
          </div>
          <button
            className={styles.button}
            disabled={!visible.length || query.isFetching}
            onClick={exportRows}
          >
            <Download size={16} />
            خروجی صفحه (CSV)
          </button>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={18} />
            <input
              aria-label="جست‌وجوی تراکنش‌ها"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="جست‌وجوی نوع یا کد پیگیری در این صفحه…"
            />
            {input && (
              <button
                aria-label="پاک کردن جست‌وجو"
                onClick={() => setInput('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          {/* فیلتر درگاه و مرتب‌سازی فعلاً غیرفعال هستند.
          <label className={styles.select}>
            درگاه
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
            >
              <option value="all">همه درگاه‌ها</option>
              {Array.from(
                new Set([...gateways, ...(gateway !== 'all' ? [gateway] : [])])
              ).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className={styles.select}>
            مرتب‌سازی
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">ترتیب پیش‌فرض</option>
              <option value="high">بیشترین مبلغ</option>
              <option value="low">کمترین مبلغ</option>
            </select>
          </label>
          */}
        </div>
        <div className={styles.filterLine}>
          <div className={styles.tabs} aria-label="فیلتر وضعیت">
            {[
              ['all', 'همه'],
              ['success', 'موفق'],
              ['pending', 'در انتظار'],
              ['failed', 'ناموفق'],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={status === value}
                className={status === value ? styles.activeTab : ''}
                onClick={() => setStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className={styles.filterNote}>
            جست‌وجو و فیلتر در صفحه جاری
            {(filtered || input) && (
              <button onClick={reset}>
                پاک کردن فیلترها
                <X size={12} />
              </button>
            )}
          </span>
        </div>
        <div aria-live="polite" className={styles.fetchStatus}>
          {query.isFetching && !query.isLoading
            ? 'در حال به‌روزرسانی سوابق…'
            : ''}
        </div>
        {query.isError ? (
          <div className={styles.empty} role="alert">
            <History size={34} />
            <h3>سوابق دریافت نشد</h3>
            <p>اتصال خود را بررسی کنید و دوباره تلاش کنید.</p>
            <button onClick={() => query.refetch()} className={styles.button}>
              تلاش دوباره
            </button>
          </div>
        ) : query.isLoading ? (
          <div className={styles.empty} role="status">
            <RefreshCw className={styles.spin} size={30} />
            <p>در حال دریافت تراکنش‌ها…</p>
          </div>
        ) : !visible.length ? (
          <div className={styles.empty}>
            <Search size={34} />
            <h3>
              {filtered || search
                ? 'تراکنشی با این شرایط پیدا نشد'
                : 'هنوز تراکنشی ثبت نشده'}
            </h3>
            <p>
              {filtered || search
                ? 'جست‌وجو یا فیلترها را تغییر دهید.'
                : 'سوابق پرداخت‌های شما در این بخش نمایش داده می‌شود.'}
            </p>
            {(filtered || search) && (
              <button className={styles.button} onClick={reset}>
                نمایش همه تراکنش‌ها
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableScroll} aria-busy={query.isFetching}>
            <table className={styles.table}>
              <caption className="sr-only">
                سوابق تراکنش‌ها؛ مبلغ‌ها به ریال
              </caption>
              <thead>
                <tr>
                  {[
                    'تراکنش',
                    'تاریخ و ساعت',
                    'مبلغ (ریال)',
                    'درگاه پرداخت',
                    'وضعیت',
                    'کد پیگیری',
                    'عملیات',
                  ].map((label) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.transaction}>
                        <span
                          className={`${styles.rowIcon} ${
                            styles[transactionKind(row)]
                          }`}
                        >
                          <TransactionIcon row={row} />
                        </span>
                        <div>
                          <strong
                            className={`${styles.typeLabel} ${
                              styles[transactionKind(row)]
                            }`}
                          >
                            {row.serviceNameFa || row.serviceName || 'تراکنش'}
                          </strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span>{transactionDate(row)}</span>
                      <small className={styles.secondary} dir="ltr">
                        {transactionTime(row)}
                      </small>
                    </td>
                    <td>
                      <strong
                        className={`${styles.amount} ${
                          styles[transactionKind(row)]
                        }`}
                        dir="ltr"
                      >
                        {transactionAmountLabel(row)}
                      </strong>
                    </td>
                    <td>
                      <span className={styles.gateway}>
                        <CreditCard size={15} />
                        {gatewayLabel(row)}
                      </span>
                    </td>
                    <td>{badge(row)}</td>
                    <td>
                      <span className={styles.tracking} dir="ltr">
                        {row.refId?.replace(/^FK_TRX-/, '') || '—'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          onClick={() => setSelected(row)}
                          className={styles.iconButton}
                          aria-label="جزئیات تراکنش"
                          title="جزئیات تراکنش"
                        >
                          <Eye size={17} />
                        </button>
                        {billAvailable(row) && (
                          <button
                            onClick={() => downloadBill(row)}
                            disabled={downloading[row.id]}
                            className={`${styles.iconButton} ${styles.downloadButton}`}
                            aria-label="دانلود فاکتور"
                            title="دانلود فاکتور"
                          >
                            {downloading[row.id] ? (
                              <RefreshCw size={17} className={styles.spin} />
                            ) : (
                              <Download size={17} />
                            )}
                            <span>دانلود فاکتور</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className={styles.footer}>
          <span>
            {numberFa(visible.length)} مورد در این صفحه · {numberFa(total)}{' '}
            تراکنش
          </span>
          <div>
            <label>
              تعداد نمایش
              <select
                aria-label="تعداد تراکنش در صفحه"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                disabled={query.isFetching}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {numberFa(size)}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label="صفحه قبلی"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((value) => value - 1)}
            >
              <ArrowRight size={16} />
            </button>
            <span>
              صفحه {numberFa(page)} از {numberFa(pages)}
            </span>
            <button
              aria-label="صفحه بعدی"
              disabled={page >= pages || query.isFetching}
              onClick={() => setPage((value) => value + 1)}
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </footer>
      </section>
      <p className={styles.note}>
        <FileText size={15} />
        نام درگاه مطابق اطلاعات ثبت‌شده هر تراکنش نمایش داده می‌شود. برای دریافت
        فاکتور، از آیکون دانلود استفاده کنید.
      </p>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="transaction-detail-title"
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        {selected && (
          <>
            <div className={styles.dialogHeader}>
              <div>
                <span className={styles.eyebrow}>اطلاعات پرداخت</span>
                <h2 id="transaction-detail-title">جزئیات تراکنش</h2>
              </div>
              <button
                autoFocus
                className={styles.iconButton}
                onClick={() => dialog.current?.close()}
                aria-label="بستن جزئیات"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className={`${styles.detailAmount} ${
                styles[transactionKind(selected)]
              }`}
            >
              <TransactionIcon row={selected} size={25} />
              <strong>
                <bdi dir="ltr">{transactionAmountLabel(selected)}</bdi>
                <small> ریال</small>
              </strong>
              {badge(selected)}
            </div>
            <dl className={styles.details}>
              {[
                [
                  'نوع تراکنش',
                  selected.serviceNameFa || selected.serviceName || '—',
                ],
                ['درگاه پرداخت', gatewayLabel(selected)],
                ['تاریخ', transactionDate(selected)],
                ['ساعت', transactionTime(selected) || '—'],
                ['کد پیگیری', selected.refId || '—'],
                ['شماره فاکتور', selected.invoiceId || selected.billId || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd
                    dir={
                      ['کد پیگیری', 'شماره فاکتور', 'ساعت'].includes(label)
                        ? 'ltr'
                        : 'rtl'
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {selected.error && <p className={styles.error}>{selected.error}</p>}
            <div className={styles.dialogFooter}>
              {billAvailable(selected) && (
                <button
                  className={styles.primary}
                  disabled={downloading[selected.id]}
                  onClick={() => downloadBill(selected)}
                >
                  <Download size={16} />
                  {downloading[selected.id]
                    ? 'در حال دانلود…'
                    : 'دانلود فاکتور'}
                </button>
              )}
              <button
                className={styles.button}
                onClick={() => dialog.current?.close()}
              >
                بستن
              </button>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
