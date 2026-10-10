'use client';

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Info,
  LockKeyhole,
  Plus,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { RootState } from '@/store/store';
import cn from '@/utils/class-names';
import useWalletTopUp from '@/hooks/use-wallet-top-up';
import WalletTopUpErrorModal from '@/components/wallet-top-up-error-modal';

const defaultAmounts = [1_000_000, 2_000_000, 5_000_000, 10_000_000];

const pageHeader = {
  title: 'کیف پول',
  breadcrumb: [
    { href: routes.finance.dashboard, name: 'مدیریت مالی' },
    { href: routes.wallet.main, name: 'کیف پول' },
  ],
};

const formatAmount = (value: number) => value.toLocaleString('fa-IR');

const normalizeAmount = (value: string) => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[^0-9]/g, '')
    .replace(/^0+(?=\d)/, '');
};

export default function IncreaseCreditPage() {
  const { startPayment, loading, paymentError, dismissPaymentError } =
    useWalletTopUp();
  const walletCredit = useSelector((state: RootState) => state.wallet.credit);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const numericAmount = Number(amount || 0);
  const finalCredit = useMemo(
    () => Number(walletCredit || 0) + numericAmount,
    [numericAmount, walletCredit]
  );

  const selectAmount = (value: number) => {
    setAmount(String(value));
    setAmountError('');
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(normalizeAmount(event.target.value));
    setAmountError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Number.isSafeInteger(numericAmount * 10) || numericAmount <= 0) {
      setAmountError('لطفاً مبلغی بزرگ‌تر از صفر وارد کنید.');
      return;
    }
    void startPayment(numericAmount);
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <WalletTopUpErrorModal
        isOpen={paymentError}
        onClose={dismissPaymentError}
      />

      <main className="mx-auto w-full max-w-6xl pb-10" dir="rtl">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-200 dark:bg-gray-50">
            <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-200 sm:px-7 sm:py-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-lighter text-primary">
                  <Plus className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                    افزایش اعتبار کیف پول
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    مبلغ دلخواه را وارد کنید یا یکی از مبالغ پیشنهادی را انتخاب
                    کنید.
                  </p>
                </div>
              </div>
            </div>

            <form className="px-5 py-6 sm:px-7 sm:py-7" onSubmit={handleSubmit}>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                مبلغ افزایش اعتبار
              </label>

              <div
                className={cn(
                  'flex h-14 items-center rounded-xl border bg-white px-4 transition focus-within:ring-2 dark:bg-gray-0',
                  amountError
                    ? 'border-red focus-within:border-red focus-within:ring-red-lighter'
                    : 'border-gray-300 focus-within:border-primary focus-within:ring-primary-lighter'
                )}
              >
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount ? formatAmount(numericAmount) : ''}
                  onChange={handleAmountChange}
                  placeholder="مثلاً ۲۵۰٬۰۰۰"
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="amount-help amount-error"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-lg font-bold text-gray-900 outline-none placeholder:text-right placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 focus:ring-0"
                  dir="ltr"
                />
                <span className="mr-3 shrink-0 border-r border-gray-200 pr-3 text-sm font-medium text-gray-500">
                  تومان
                </span>
              </div>

              <div className="min-h-6 mt-2">
                {amountError ? (
                  <p id="amount-error" className="text-xs font-medium text-red">
                    {amountError}
                  </p>
                ) : (
                  <p
                    id="amount-help"
                    className="text-xs leading-6 text-gray-500"
                  >
                    مبلغ به تومان محاسبه می‌شود.
                  </p>
                )}
              </div>

              <fieldset className="mt-4">
                <legend className="mb-3 text-sm font-semibold text-gray-800">
                  انتخاب سریع مبلغ
                </legend>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {defaultAmounts.map((value) => {
                    const isSelected = numericAmount === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => selectAmount(value)}
                        className={cn(
                          'min-h-12 relative rounded-xl border px-2 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          isSelected
                            ? 'border-primary bg-primary-lighter text-primary-dark'
                            : 'border-gray-200 bg-gray-0 text-gray-700 hover:border-primary-light hover:bg-primary-lighter/40'
                        )}
                      >
                        {isSelected && (
                          <CheckCircle2 className="absolute left-2 top-2 h-4 w-4 text-primary" />
                        )}
                        {formatAmount(value)}
                        <span className="mr-1 text-xs font-normal">تومان</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="my-6 border-t border-dashed border-gray-200" />

              <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-100">
                <SummaryRow
                  label="اعتبار فعلی"
                  value={`${formatAmount(Number(walletCredit || 0))} تومان`}
                />
                <SummaryRow
                  label="مبلغ افزایش"
                  value={`${
                    numericAmount > 0 ? formatAmount(numericAmount) : '۰'
                  } تومان`}
                />
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-gray-800">
                      اعتبار پس از پرداخت
                    </span>
                    <span className="text-base font-bold text-primary-dark">
                      {formatAmount(finalCredit)} تومان
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={numericAmount <= 0 || loading}
                aria-busy={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
              >
                {loading ? 'در حال اتصال به درگاه…' : 'ادامه و پرداخت'}
                <ArrowLeft className="h-4 w-4" />
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-gray-500">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-green" />
                پرداخت از طریق درگاه امن بانکی انجام می‌شود.
              </p>
            </form>
          </section>

          <aside className="space-y-4">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#176B57] to-[#0E4F42] p-5 text-white shadow-sm sm:p-6">
              <div className="absolute -left-10 -top-12 h-36 w-36 rounded-full border-[24px] border-white/5" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/75">موجودی کیف پول</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <WalletCards className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-7 flex items-end gap-2">
                  <strong className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatAmount(Number(walletCredit || 0))}
                  </strong>
                  <span className="pb-1 text-sm text-white/75">تومان</span>
                </div>
                <p className="text-white/65 mt-3 text-xs leading-5">
                  از اعتبار کیف پول برای پرداخت سریع خدمات پنل استفاده کنید.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-200 dark:bg-gray-50">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Info className="h-4 w-4 text-primary" />
                روند افزایش اعتبار
              </h2>
              <ol className="mt-4 space-y-4">
                <ProcessItem
                  icon={<CreditCard className="h-4 w-4" />}
                  title="انتقال به درگاه پرداخت"
                  description="پرداخت با کارت‌های عضو شبکه شتاب"
                />
                <ProcessItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="تأیید امن پرداخت"
                  description="بازگشت خودکار به پنل پس از پرداخت"
                />
                <ProcessItem
                  icon={<WalletCards className="h-4 w-4" />}
                  title="افزایش آنی موجودی"
                  description="اعتبار پس از تأیید تراکنش اضافه می‌شود"
                  isLast
                />
              </ol>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function ProcessItem({
  icon,
  title,
  description,
  isLast = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!isLast && (
        <span className="absolute right-[15px] top-8 h-8 border-r border-dashed border-gray-300" />
      )}
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-lighter text-primary">
        {icon}
      </span>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </li>
  );
}
