'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PiArrowLeft,
  PiArrowRight,
  PiCheckBold,
  PiCheckCircleFill,
  PiWallet,
  PiShieldCheck,
  PiSparkle,
  PiBuildings,
  PiGift,
  PiClock,
  PiInfo,
  PiArrowClockwise,
  PiCreditCard,
  PiCircleNotch,
} from 'react-icons/pi';
import axios from 'axios';
import axiosInstance from '@/utils/axios-instance';
import { API_ENDPOINTS } from '@/config/api.config';
import CompanySuccessDialog from '@/app/shared/info/company-success-dialog';
import { routes } from '@/config/routes';
import WalletTopUpModal from '@/components/wallet-top-up-modal';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { setCredit } from '@/store/walletSlice';
import styles from './subscription-checkout.module.css';

type Bundle = {
  id: number;
  title: string;
  duration?: number;
  timeDuration?: number;
  price: number;
  features: string;
  bonusMonths?: number | null;
  active?: boolean;
  status?: string;
  pageOrder?: number;
  renewable?: boolean;
};
type BundleData = {
  bundles: Bundle[];
  subCategoryName?: string;
  subCategoryTitle?: string;
};
const number = (value: number) =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value);
const duration = (plan: Bundle) => {
  const months = Number(plan.timeDuration ?? plan.duration);
  return Number.isFinite(months) && months > 0
    ? `${number(months)} ماهه`
    : 'دوره اشتراک';
};
const features = (plan: Bundle) =>
  (plan.features || '')
    .split(/[,،\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

export default function SubscriptionCheckout({ id }: { id: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const credit = useSelector((state: RootState) => state.wallet.credit);
  const [creditReady, setCreditReady] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1_000_000);
  const [data, setData] = useState<BundleData | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<{
    code: string;
    percent: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const requestVersion = useRef(0);
  const paymentLock = useRef(false);

  const refreshCredit = useCallback(
    async (signal?: AbortSignal) => {
      setCreditReady(false);
      setCreditError('');
      try {
        const response = await axiosInstance.get('/user/credit', { signal });
        const value = response.data.data;
        const balance = Number(value);
        if (
          response.data.status !== 'SUCCESS' ||
          value === null ||
          value === undefined ||
          value === '' ||
          !Number.isFinite(balance)
        )
          throw new Error('invalid wallet balance');
        if (signal?.aborted) return;
        dispatch(setCredit(balance));
        setCreditReady(true);
      } catch {
        if (!signal?.aborted)
          setCreditError('دریافت موجودی کیف پول انجام نشد. دوباره تلاش کنید.');
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => void refreshCredit(controller.signal);
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, [refreshCredit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(null);
    setSelectedId(null);
    setApplied(null);
    setCode('');
    requestVersion.current += 1;
    axiosInstance
      .get(`/bundle/subcategory/${id}`, { signal: controller.signal })
      .then((response) => {
        if (response.data.statusCode !== 200)
          throw new Error('invalid response');
        const result: BundleData = response.data.data;
        const bundles = (result.bundles || [])
          .filter((plan) => plan.active !== false && plan.status !== 'INACTIVE')
          .sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0));
        setData({ ...result, bundles });
        setSelectedId(
          bundles.find((plan) => plan.renewable !== false)?.id ?? null
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError('دریافت پلن‌های اشتراک انجام نشد. دوباره تلاش کنید.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      requestVersion.current += 1;
    };
  }, [id, retry]);

  const selected = data?.bundles.find((plan) => plan.id === selectedId);
  const base = selected?.price ?? 0;
  // Preserve the existing checkout's tax and discount calculation.
  const tax = base * 0.1;
  const discount = (base * (applied?.percent ?? 0)) / 100;
  const total = base + tax - discount;
  const shortfall = Math.max(0, Math.ceil(total - credit));

  function openTopUp() {
    setTopUpAmount(creditReady && shortfall > 0 ? shortfall : 1_000_000);
    setTopUpOpen(true);
  }

  function selectPlan(planId: number) {
    const plan = data?.bundles.find((item) => item.id === planId);
    if (!plan || plan.renewable === false || paying || selectedId === planId)
      return;
    requestVersion.current += 1;
    setSelectedId(planId);
    setApplied(null);
    setCode('');
    setDiscountError('');
    setPaymentError('');
    setChecking(false);
  }

  async function applyDiscount() {
    if (!code.trim() || checking || paying) return;
    const version = ++requestVersion.current;
    const submittedCode = code.trim();
    setChecking(true);
    setDiscountError('');
    setApplied(null);
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.discount(encodeURIComponent(submittedCode)),
        {}
      );
      if (version !== requestVersion.current) return;
      const percent = Number(response.data.data);
      if (
        response.data.statusCode !== 200 ||
        !Number.isFinite(percent) ||
        percent < 0 ||
        percent > 100
      ) {
        setDiscountError('این کد تخفیف معتبر نیست. کد را بررسی کنید.');
        return;
      }
      setApplied({ code: submittedCode, percent });
    } catch (error) {
      if (version === requestVersion.current)
        setDiscountError(
          errorMessage(error, 'بررسی کد تخفیف انجام نشد. دوباره تلاش کنید.')
        );
    } finally {
      if (version === requestVersion.current) setChecking(false);
    }
  }

  async function purchase() {
    if (
      !selected ||
      selected.renewable === false ||
      paymentLock.current ||
      purchased ||
      checking
    )
      return;
    if (total > 0 && !creditReady) return;
    if (total > 0 && shortfall > 0) {
      openTopUp();
      return;
    }
    paymentLock.current = true;
    setPaying(true);
    setPaymentError('');
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.subscription, {
        bundleId: selected.id,
        ...(applied ? { discountCode: applied.code } : {}),
      });
      if (response.data.statusCode !== 200) {
        setPaymentError(
          response.data.message || 'ثبت اشتراک انجام نشد. دوباره تلاش کنید.'
        );
        return;
      }
      setPurchased(true);
    } catch (error) {
      setPaymentError(
        errorMessage(
          error,
          'خرید اشتراک انجام نشد. موجودی کیف پول و اتصال اینترنت را بررسی کنید.'
        )
      );
    } finally {
      paymentLock.current = false;
      setPaying(false);
    }
  }

  return (
    <div className={styles.page} dir="rtl">
      <WalletTopUpModal
        isOpen={topUpOpen}
        initialAmount={topUpAmount}
        onClose={() => {
          setTopUpOpen(false);
          void refreshCredit();
        }}
      />
      <CompanySuccessDialog
        open={purchased}
        purchased
        title="اشتراک شما با موفقیت خریداری شد"
        description="از اینکه فودکیز را برای معرفی و رشد کسب‌وکارتان انتخاب کرده‌اید، سپاسگزاریم. خوشحالیم که همراه شما هستیم."
        notice="اطلاعات شرکت شما پس از بررسی کارشناسان ما، حداکثر تا ۷۲ ساعت منتشر می‌شود. وضعیت شرکت را در صفحه کسب‌وکارهای من پیگیری کنید."
        actionLabel="متوجه شدم؛ رفتن به کسب‌وکارهای من"
        onContinue={() => router.replace(routes.info.dashboard)}
      />
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
        <Link href="/bundle/subscription-list">اشتراک‌های من</Link>
        <PiArrowLeft aria-hidden="true" />
        <span>انتخاب و خرید اشتراک</span>
      </nav>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>یک قدم تا توسعه کسب‌وکار شما</span>
          <h1>
            اشتراک مناسب شما،
            <br className={styles.mobileBreak} /> شروع فرصت‌های تازه
          </h1>
          <p>
            پلن‌ها را مقایسه کنید و با انتخابی متناسب با نیازتان، ادامه دهید.
          </p>
        </div>
        <Link href="/bundle/subscription-list" className={styles.back}>
          <PiArrowRight /> اشتراک‌های من
        </Link>
      </header>
      <div className={styles.context}>
        <div className={styles.contextIcon}>
          <PiBuildings />
        </div>
        <div>
          <span>اشتراک برای بانک اطلاعاتی</span>
          <h2>
            {data?.subCategoryTitle || data?.subCategoryName || 'کسب‌وکار شما'}
          </h2>
        </div>
        <span className={styles.contextBadge}>
          <PiShieldCheck /> پنل کسب‌وکار فودکیز
        </span>
      </div>
      {loading ? (
        <div className={styles.state} role="status">
          <PiCircleNotch className={styles.spinner} />
          <h2>در حال دریافت پلن‌های اشتراک</h2>
          <p>قیمت‌ها و امکانات به‌روز در حال بارگذاری است.</p>
        </div>
      ) : error ? (
        <div className={styles.state} role="alert">
          <PiInfo />
          <h2>اطلاعات در دسترس نیست</h2>
          <p>{error}</p>
          <button
            onClick={() => setRetry((value) => value + 1)}
            className={styles.secondary}
          >
            <PiArrowClockwise /> تلاش دوباره
          </button>
        </div>
      ) : !selected ? (
        <div className={styles.state}>
          <PiInfo />
          <h2>در حال حاضر پلن قابل خرید یا تمدیدی وجود ندارد</h2>
          <p>
            پلن‌های نمایش‌داده‌شده برای خرید یا تمدید غیرفعال هستند. برای مشاهده
            وضعیت اشتراک‌ها به فهرست اشتراک‌های من برگردید.
          </p>
          <Link href="/bundle/subscription-list" className={styles.secondary}>
            مشاهده اشتراک‌ها
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <main className={styles.main}>
            <section aria-labelledby="plans-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.step}>۱</span>
                  <h2 id="plans-heading">پلن خود را انتخاب کنید</h2>
                </div>
                <span>قیمت‌ها به تومان</span>
              </div>
              <fieldset className={styles.plans} disabled={paying}>
                <legend className={styles.srOnly}>انتخاب پلن اشتراک</legend>
                {data?.bundles.map((plan) => {
                  const checked = plan.id === selectedId;
                  const unavailable = plan.renewable === false;
                  return (
                    <label
                      key={plan.id}
                      className={`${styles.plan} ${
                        checked ? styles.selected : ''
                      } ${unavailable ? styles.unavailable : ''}`}
                      aria-disabled={unavailable}
                    >
                      <input
                        type="radio"
                        name="subscription-plan"
                        value={plan.id}
                        checked={checked}
                        disabled={unavailable || paying}
                        onChange={() => selectPlan(plan.id)}
                        className={styles.radio}
                      />
                      <div className={styles.planTop}>
                        <span className={styles.planIcon}>
                          {plan.price === 0 ? <PiGift /> : <PiSparkle />}
                        </span>
                        <span className={styles.planDuration}>
                          {duration(plan)}
                        </span>
                        <span className={styles.radioMark}>
                          {checked && <PiCheckBold />}
                        </span>
                      </div>
                      {unavailable && (
                        <span className={styles.unavailableBadge}>
                          غیرقابل خرید یا تمدید
                        </span>
                      )}
                      <h3>{plan.title}</h3>
                      <div className={styles.price}>
                        {plan.price === 0 ? (
                          <strong>رایگان</strong>
                        ) : (
                          <>
                            <strong>{number(plan.price)}</strong>
                            <span>تومان</span>
                          </>
                        )}
                      </div>
                      <p className={styles.priceNote}>
                        {plan.price === 0
                          ? 'برای آشنایی با امکانات فودکیز'
                          : `هزینه کل دوره ${duration(plan)}، پیش از مالیات`}
                      </p>
                      {Number(plan.bonusMonths) > 0 && (
                        <span className={styles.gift}>
                          <PiGift /> {number(plan.bonusMonths!)} ماه اشتراک هدیه
                        </span>
                      )}
                      <ul className={styles.features}>
                        {features(plan).map((feature, index) => (
                          <li key={index}>
                            <PiCheckBold />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <span className={styles.selectLabel}>
                        {unavailable ? (
                          'این پلن قابل انتخاب نیست'
                        ) : checked ? (
                          <>
                            <PiCheckCircleFill /> پلن انتخاب‌شده
                          </>
                        ) : (
                          'انتخاب این پلن'
                        )}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </section>
            <section
              className={styles.payment}
              aria-labelledby="payment-heading"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.step}>۲</span>
                  <h2 id="payment-heading">
                    {base === 0 ? 'فعال‌سازی اشتراک' : 'روش پرداخت'}
                  </h2>
                </div>
              </div>
              {base === 0 ? (
                <div className={styles.freeNote}>
                  <PiGift />
                  <div>
                    <strong>شروع بدون پرداخت</strong>
                    <p>
                      این پلن رایگان است. برای ثبت آن، «فعال‌سازی اشتراک رایگان»
                      را بزنید.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.wallet}>
                    <PiWallet />
                    <div>
                      <strong>پرداخت از کیف پول</strong>
                      <p>مبلغ نهایی از اعتبار کیف پول شما کسر می‌شود.</p>
                    </div>
                    <PiCheckCircleFill />
                  </div>
                  <p className={styles.paymentHint}>
                    <PiInfo /> برای شارژ کیف پول، دکمه «افزایش اعتبار» در خلاصه
                    سفارش همین صفحه را بزنید.
                  </p>
                  <div className={styles.gateways}>
                    <PiCreditCard />
                    <span>زرین‌پال و بانک ملت</span>
                    <span>در حال حاضر غیرفعال</span>
                  </div>
                </>
              )}
            </section>
            <section className={styles.faq} aria-labelledby="faq-heading">
              <h2 id="faq-heading">پیش از انتخاب، بیشتر بدانید</h2>
              <details>
                <summary>این اشتراک برای کدام کسب‌وکار است؟</summary>
                <p>
                  اشتراک انتخابی مربوط به بانک اطلاعاتی نمایش‌داده‌شده در بالای
                  همین صفحه است. امکانات هر پلن را در کارت آن می‌توانید ببینید.
                </p>
              </details>
              <details>
                <summary>مبلغ نهایی چگونه محاسبه می‌شود؟</summary>
                <p>
                  هزینه کل دوره به‌همراه ۱۰٪ مالیات، پس از کسر تخفیف معتبر، در
                  خلاصه سفارش نمایش داده می‌شود. پلن رایگان هزینه و مالیات
                  ندارد.
                </p>
              </details>
              <details>
                <summary>اشتراک خریداری‌شده را کجا مدیریت کنم؟</summary>
                <p>
                  پس از خرید موفق و تأیید پیام، به صفحه «کسب‌وکارهای من»
                  می‌روید. جزئیات اشتراک نیز از صفحه «اشتراک‌های من» در دسترس
                  است.
                </p>
              </details>
            </section>
          </main>
          <aside
            id="order-summary"
            className={styles.summary}
            aria-labelledby="summary-heading"
          >
            <div className={styles.summaryHeading}>
              <div>
                <span className={styles.eyebrow}>انتخاب شما</span>
                <h2 id="summary-heading">خلاصه سفارش</h2>
              </div>
              <PiShieldCheck />
            </div>
            <div className={styles.orderPlan}>
              <strong>{selected.title}</strong>
              <span>
                <PiClock /> {duration(selected)}
                {Number(selected.bonusMonths) > 0
                  ? ` + ${number(selected.bonusMonths!)} ماه هدیه`
                  : ''}
              </span>
            </div>
            <dl className={styles.totals}>
              <div>
                <dt>هزینه اشتراک</dt>
                <dd>
                  {number(base)} <small>تومان</small>
                </dd>
              </div>
              <div>
                <dt>
                  مالیات بر ارزش افزوده <small>(۱۰٪)</small>
                </dt>
                <dd>
                  {number(tax)} <small>تومان</small>
                </dd>
              </div>
              <div className={applied ? styles.discountValue : ''}>
                <dt>تخفیف {applied ? `(${number(applied.percent)}٪)` : ''}</dt>
                <dd>
                  {number(discount)} <small>تومان</small>
                </dd>
              </div>
            </dl>
            {base > 0 && (
              <div className={styles.discount}>
                <label htmlFor="discount-code">کد تخفیف دارید؟</label>
                <div className={styles.discountInput}>
                  <input
                    id="discount-code"
                    value={code}
                    disabled={checking || paying}
                    placeholder="کد تخفیف را وارد کنید"
                    onChange={(event) => {
                      setCode(event.target.value);
                      setApplied(null);
                      setDiscountError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void applyDiscount();
                      }
                    }}
                    aria-invalid={Boolean(discountError)}
                    aria-describedby="discount-feedback"
                  />
                  <button
                    type="button"
                    onClick={applyDiscount}
                    disabled={
                      !code.trim() || checking || paying || Boolean(applied)
                    }
                  >
                    {checking ? 'بررسی…' : applied ? 'اعمال شد' : 'اعمال'}
                  </button>
                </div>
                <p
                  id="discount-feedback"
                  className={discountError ? styles.error : styles.success}
                  role="status"
                >
                  {discountError ||
                    (applied
                      ? `کد تخفیف ${number(applied.percent)} درصدی اعمال شد.`
                      : '')}
                </p>
              </div>
            )}
            <div className={styles.total} aria-live="polite" aria-atomic="true">
              <span>مبلغ قابل پرداخت</span>
              <div>
                <strong>{number(total)}</strong>
                <span>تومان</span>
              </div>
            </div>
            <div
              className={styles.walletBalance}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className={styles.balanceRow}>
                <span>موجودی کیف پول</span>
                <strong>
                  {creditReady
                    ? `${number(credit)} تومان`
                    : creditError
                    ? 'نامشخص'
                    : 'در حال دریافت…'}
                </strong>
              </div>
              {creditError ? (
                <>
                  <p className={styles.error} role="alert">
                    {creditError}
                  </p>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => void refreshCredit()}
                  >
                    <PiArrowClockwise /> دریافت دوباره موجودی
                  </button>
                </>
              ) : creditReady && total > 0 ? (
                <p className={shortfall > 0 ? styles.error : styles.success}>
                  {shortfall > 0
                    ? `برای خرید این اشتراک، ${number(
                        shortfall
                      )} تومان کسری اعتبار دارید.`
                    : 'اعتبار کیف پول شما برای خرید این اشتراک کافی است.'}
                </p>
              ) : null}
              <button
                type="button"
                className={styles.topUp}
                onClick={openTopUp}
                disabled={paying || purchased}
              >
                <PiWallet /> افزایش اعتبار
              </button>
            </div>
            {paymentError && (
              <p className={styles.error} role="alert">
                {paymentError}
              </p>
            )}
            <button
              type="button"
              className={styles.submit}
              onClick={purchase}
              disabled={
                paying ||
                checking ||
                purchased ||
                (total > 0 && (!creditReady || shortfall > 0))
              }
            >
              {paying ? (
                <>
                  <PiCircleNotch className={styles.spinner} /> در حال ثبت
                  اشتراک…
                </>
              ) : (
                <>
                  {base === 0 ? 'فعال‌سازی اشتراک رایگان' : 'تأیید و پرداخت'}
                  <PiArrowLeft />
                </>
              )}
            </button>
            <p className={styles.submitNote}>
              <PiShieldCheck />{' '}
              {base === 0
                ? 'بدون نیاز به پرداخت'
                : 'پرداخت از اعتبار کیف پول شما'}
            </p>
            <div className={styles.summaryFoot}>
              قبل از تأیید، پلن و مدت اشتراک را بررسی کنید.
            </div>
          </aside>
        </div>
      )}
      {selected && !loading && (
        <div className={styles.mobileCheckout}>
          <div>
            <span>مبلغ قابل پرداخت</span>
            <strong>
              {number(total)} <small>تومان</small>
            </strong>
          </div>
          <a href="#order-summary">
            بررسی و ادامه <PiArrowLeft />
          </a>
        </div>
      )}
    </div>
  );
}
