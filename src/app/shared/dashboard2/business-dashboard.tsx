'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Eye,
  Headphones,
  Leaf,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { RootState } from '@/store/store';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { routes } from '@/config/routes';
import { CLIENT_WEBSITE_URL } from '@/config/api.config';
import {
  businessEditHref,
  companyStatuses,
  faNumber,
  fetchDashboardSubscriptions,
  fetchSummary,
  paymentStatuses,
  type DashboardCompany,
} from './dashboard-data';
import BusinessList from './business-list';
import useBusinesses from './use-businesses';
import CreateBusinessDialog from './create-business-dialog';
import styles from './dashboard.module.css';

const quickActions: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: 'معرفی کسب‌وکار',
    description: 'ثبت شرکت و برند شما',
    href: routes.info.foodIndustryAdd,
    icon: Building2,
    tone: 'green',
  },
  {
    title: 'ثبت درخواست',
    description: 'اعلام نیاز و همکاری',
    href: routes.info.requestCreate,
    icon: ClipboardList,
    tone: 'blue',
  },
  {
    title: 'فرصت نمایندگی',
    description: 'گسترش شبکه فروش',
    href: routes.info.resellerCreate,
    icon: Megaphone,
    tone: 'amber',
  },
  {
    title: 'مدیریت اشتراک',
    description: 'بسته‌ها و دسترسی‌ها',
    href: routes.subscriptionList,
    icon: ShieldCheck,
    tone: 'violet',
  },
  {
    title: 'ارتباط با پشتیبانی',
    description: 'همراه شما هستیم',
    href: routes.support.ticket,
    icon: Headphones,
    tone: 'green',
  },
];

function Metric({
  title,
  value,
  caption,
  icon: Icon,
  tone,
  loading,
  href,
}: {
  title: string;
  value: number | null | undefined;
  caption: string;
  icon: LucideIcon;
  tone: string;
  loading: boolean;
  href: string;
}) {
  return (
    <Link href={href} className={styles.metric}>
      <div className={styles.metricTop}>
        <span>{title}</span>
        <span className={`${styles.iconBox} ${styles[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <div className={styles.metricValue}>
        {loading ? (
          <span className={styles.skeleton} />
        ) : value != null ? (
          faNumber(value)
        ) : (
          '—'
        )}
      </div>
      <div className={styles.metricBottom}>
        <span>{caption}</span>
        <ArrowUpLeft size={16} />
      </div>
    </Link>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2>
          <Icon size={18} />
          {title}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Feedback({
  loading,
  error,
  retry,
  children,
}: {
  loading?: boolean;
  error?: boolean;
  retry?: () => void;
  children?: React.ReactNode;
}) {
  if (loading)
    return (
      <div className={styles.feedback} role="status">
        <Loader2 size={23} className={styles.spin} />
        <span>در حال دریافت اطلاعات…</span>
      </div>
    );
  if (error)
    return (
      <div className={styles.feedback} role="status">
        <CircleHelp size={25} />
        <p>دریافت اطلاعات با مشکل مواجه شد.</p>
        <button className={styles.textButton} onClick={retry}>
          تلاش دوباره <RefreshCw size={14} />
        </button>
      </div>
    );
  return <>{children}</>;
}

export default function BusinessDashboard() {
  const user = useSelector((state: RootState) => state.user);
  const auth = useAuth() as {
    state?: { token?: string; user?: { id?: number; firstName?: string } };
  } | null;
  const userId = user.id ?? auth?.state?.user?.id;
  const userName = user.firstName || auth?.state?.user?.firstName;
  const client = useAxiosPrivate();
  const notifications = useNotifications();
  const enabled = Boolean(auth?.state?.token);
  const [createOpen, setCreateOpen] = useState(false);
  const [date, setDate] = useState('');
  const formatPersianDate = (date: Date) => {
    const parts = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Tehran',
    }).formatToParts(date);

    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value;

    return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
  };

  useEffect(() => {
    setDate(formatPersianDate(new Date()));
  }, []);
  const summary = useQuery(
    ['business-dashboard', userId, 'summary'],
    ({ signal }) => fetchSummary(client, signal),
    { enabled, staleTime: 60000, retry: 1 }
  );
  const companyQuery = useBusinesses();
  const subscriptionQuery = useQuery(
    ['business-dashboard', userId, 'subscriptions'],
    ({ signal }) => fetchDashboardSubscriptions(client, signal),
    { enabled, staleTime: 60000, retry: 1 }
  );
  const companies = companyQuery.data?.items ?? [];
  const subscriptions = subscriptionQuery.data ?? [];
  const activeSubscriptions = subscriptions.filter(
    (item) => item.subscriptionStatus === 'ACTIVE'
  );
  const attentionCompanies = companies.filter(
    (item) =>
      paymentStatuses.has(item.companyStatus || '') ||
      item.companyStatus === 'DENIED'
  );
  const profileChecks = [
    {
      label: 'نام و نام خانوادگی',
      done: Boolean(user.firstName?.trim() && user.lastName?.trim()),
    },
    {
      label: 'شماره تماس',
      done: Boolean(
        user.phone || user.phoneNumbers?.length || user.phones?.length
      ),
    },
    { label: 'ایمیل کاری', done: Boolean(user.email || user.emails?.length) },
    {
      label: 'نشانی و موقعیت',
      done: Boolean(user.address?.trim() && (user.cityId || user.city?.id)),
    },
  ];
  const completed = profileChecks.filter((item) => item.done).length;
  const profileReady = user.id != null;
  const busy =
    summary.isFetching ||
    companyQuery.isFetching ||
    subscriptionQuery.isFetching;
  const editHref = (company: DashboardCompany) =>
    businessEditHref(company) ?? routes.info.dashboard;
  const refresh = () => {
    void summary.refetch();
    void companyQuery.refetch();
    void subscriptionQuery.refetch();
    notifications.refresh();
  };
  return (
    <div className={styles.dashboard} dir="rtl">
      <div className={styles.pageTop}>
        <div>
          <div className={styles.eyebrow}>
            <span /> میز کار شما در فودکیز
          </div>
          <h1>داشبورد کسب‌وکار</h1>
        </div>
        <div className={styles.topActions}>
          <span className={styles.date}>
            <CalendarDays size={16} />
            {date || 'امروز'}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className={styles.refresh}
            aria-label="به‌روزرسانی داشبورد"
            title="به‌روزرسانی داشبورد"
          >
            <RefreshCw size={17} className={busy ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <section className={styles.hero} aria-label="خوش‌آمدگویی">
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <Sprout size={15} />
            همراه رشد کسب‌وکار شما
          </span>
          <h2>
            {userName
              ? `${userName} عزیز، خوش آمدید`
              : 'به خانه کسب‌وکارتان خوش آمدید'}
            <span>فرصت‌های تازه، از اینجا شروع می‌شوند.</span>
          </h2>
          <p>
            کسب‌وکارتان را معرفی کنید، ارتباط‌های تازه بسازید
            <br className={styles.desktopBreak} /> و قدم بعدی رشد را با دید
            روشن‌تری بردارید.
          </p>
          <div className={styles.heroActions}>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className={styles.primaryButton}
            >
              <Plus size={18} />
              ثبت کسب‌وکار جدید
            </button>
            <a href="#my-companies" className={styles.heroLink}>
              مدیریت کسب‌وکارهای من <ArrowLeft size={17} />
            </a>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.orbitOne} />
          <div className={styles.orbitTwo} />
          <div className={styles.artCenter}>
            <Sprout size={48} strokeWidth={1.3} />
            <span>FOODKEYS</span>
            <small>رشد، در کنار هم</small>
          </div>
          <div className={`${styles.artNode} ${styles.artNodeOne}`}>
            <Building2 size={19} />
            <span>معرفی کسب‌وکار</span>
          </div>
          <div className={`${styles.artNode} ${styles.artNodeTwo}`}>
            <ShieldCheck size={19} />
            <span>اعتبار و اعتماد</span>
          </div>
          <div className={`${styles.artNode} ${styles.artNodeThree}`}>
            <Leaf size={19} />
            <span>فرصت‌های همکاری</span>
          </div>
          <span className={styles.orbitDot} />
          <Sparkles className={styles.artSpark} size={23} />
        </div>
      </section>

      {summary.isError && (
        <div className={styles.alert} role="status">
          <CircleHelp size={18} />
          <span>
            آمار کلی به‌روز نشد. برای دریافت آخرین وضعیت دوباره تلاش کنید.
          </span>
          <button onClick={() => void summary.refetch()}>تلاش دوباره</button>
        </div>
      )}
      <section className={styles.metrics} aria-label="نمای کلی حساب">
        <Metric
          title="بازدید کسب‌وکارها"
          value={summary.data?.visitCount}
          caption="مجموع اعلام‌شده در حساب"
          icon={Eye}
          tone="blue"
          loading={summary.isLoading}
          href="#my-companies"
        />
        <Metric
          title="اشتراک‌های فعال"
          value={
            subscriptionQuery.isSuccess ? activeSubscriptions.length : null
          }
          caption="مدیریت دسترسی و تمدید"
          icon={ShieldCheck}
          tone="violet"
          loading={subscriptionQuery.isLoading}
          href={routes.subscriptionList}
        />
        <Metric
          title="اعتبار کیف پول"
          value={summary.data?.credit}
          caption="تومان · مشاهده گردش حساب"
          icon={Wallet}
          tone="amber"
          loading={summary.isLoading}
          href={routes.finance.wallet}
        />
      </section>

      <nav className={styles.quickActions} aria-label="دسترسی سریع">
        {quickActions.map(({ title, description, href, icon: Icon, tone }) => (
          <Link href={href} key={title} className={styles.quickAction}>
            <span className={`${styles.iconBox} ${styles[tone]}`}>
              <Icon size={21} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <ChevronLeft size={16} />
          </Link>
        ))}
      </nav>

      <div className={styles.workspace}>
        <div className={styles.mainColumn}>
          <BusinessList
            query={companyQuery}
            onCreate={() => setCreateOpen(true)}
          />

          <div className={styles.lowerGrid}>
            <section className={styles.panel}>
              <SectionTitle
                icon={CircleHelp}
                title="موارد نیازمند اقدام"
                description="بر اساس وضعیت موارد همین فهرست"
              />
              <Feedback
                loading={companyQuery.isLoading || companyQuery.searching}
                error={companyQuery.isError}
                retry={() => void companyQuery.refetch()}
              >
                {attentionCompanies.length ? (
                  <div className={styles.actionQueue}>
                    {attentionCompanies.map((item) => (
                      <Link
                        key={item.key}
                        href={
                          paymentStatuses.has(item.companyStatus || '')
                            ? routes.subscriptionList
                            : editHref(item)
                        }
                      >
                        <span className={styles.actionDot} />
                        <div>
                          <strong>{item.companyName}</strong>
                          <p>
                            {companyStatuses[item.companyStatus || '']?.label} ·{' '}
                            {paymentStatuses.has(item.companyStatus || '')
                              ? 'بررسی و فعال‌سازی اشتراک'
                              : 'بررسی و اصلاح اطلاعات'}
                          </p>
                        </div>
                        <ChevronLeft size={16} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={styles.compactEmpty}>
                    <CheckCheck size={32} />
                    <strong>مورد فوری در این فهرست نیست</strong>
                    <p>
                      وقتی اطلاعات نیاز به اصلاح یا اشتراک نیاز به بررسی داشته
                      باشد، اینجا راهنمایی‌تان می‌کنیم.
                    </p>
                    <Link
                      className={styles.textLink}
                      href={routes.info.dashboard}
                    >
                      بررسی وضعیت همه موارد <ArrowLeft size={14} />
                    </Link>
                  </div>
                )}
              </Feedback>
            </section>
            <section className={styles.panel}>
              <SectionTitle
                icon={Sprout}
                title="خدمات موردنیاز کسب‌وکار"
                description="از تأمین نیاز تا توسعه تیم و شبکه فروش"
              />
              <div className={styles.serviceLinks}>
                {[
                  {
                    title: 'درخواست تأمین و همکاری',
                    description: 'نیاز کسب‌وکارتان را مطرح کنید',
                    href: routes.info.requestCreate,
                    icon: ClipboardList,
                  },
                  {
                    title: 'جذب نماینده فروش',
                    description: 'شبکه توزیع خود را گسترش دهید',
                    href: routes.info.resellerCreate,
                    icon: Megaphone,
                  },
                  {
                    title: 'ثبت آگهی استخدام',
                    description: 'همکار بعدی خود را پیدا کنید',
                    href: routes.info.employmentCreate,
                    icon: Building2,
                  },
                ].map(({ title, description, href, icon: Icon }) => (
                  <Link key={title} href={href}>
                    <span className={styles.serviceIcon}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                    <ArrowUpLeft size={16} />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <section className={styles.growthBanner}>
            <span className={styles.growthIcon}>
              <Sprout size={28} />
            </span>
            <div>
              <span className={styles.eyebrow}>قدم بعدی کسب‌وکار</span>
              <h2>ارتباط درست، شروع فرصت‌های تازه است.</h2>
              <p>
                نیازها و پیشنهادهای همکاری خود را در شبکه صنایع غذایی و کشاورزی
                معرفی کنید.
              </p>
            </div>
            <Link href={routes.info.requestCreate}>
              ثبت درخواست همکاری <ArrowLeft size={17} />
            </Link>
          </section>
        </div>

        <aside className={styles.sideColumn} aria-label="پیگیری و وضعیت حساب">
          <section className={`${styles.panel} ${styles.focusPanel}`}>
            <SectionTitle icon={Sparkles} title="پیشنهاد برای قدم بعدی" />
            <div className={styles.nextSteps}>
              <Link href={routes.profile} className={styles.nextStep}>
                <span className={`${styles.iconBox} ${styles.green}`}>
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <strong>
                    {profileReady && completed === 4
                      ? 'اطلاعات حساب شما کامل است'
                      : 'اطلاعات تماس را کامل کنید'}
                  </strong>
                  <p>راه ارتباط مشتریان با شما را به‌روز نگه دارید.</p>
                </div>
                <ChevronLeft size={17} />
              </Link>
              {profileReady && (
                <>
                  <div className={styles.progressLabel}>
                    <span>تکمیل اطلاعات حساب</span>
                    <b>{faNumber(completed * 25)}٪</b>
                  </div>
                  <div
                    className={styles.profileProgress}
                    role="progressbar"
                    aria-label="تکمیل اطلاعات حساب"
                    aria-valuenow={completed * 25}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${completed * 25}%` }} />
                  </div>
                  <div className={styles.checklist}>
                    {profileChecks.map((item) => (
                      <span
                        key={item.label}
                        className={item.done ? styles.checkDone : ''}
                      >
                        <span>
                          {item.done ? <Check size={11} /> : <span />}
                        </span>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <SectionTitle icon={CreditCard} title="اشتراک‌های شما">
              <Link className={styles.textLink} href={routes.subscriptionList}>
                مدیریت <ChevronLeft size={14} />
              </Link>
            </SectionTitle>
            <Feedback
              loading={subscriptionQuery.isLoading}
              error={subscriptionQuery.isError}
              retry={() => void subscriptionQuery.refetch()}
            >
              {subscriptions.length ? (
                <div className={styles.subscriptionList}>
                  {[...subscriptions]
                    .sort(
                      (a, b) =>
                        Number(b.subscriptionStatus === 'ACTIVE') -
                        Number(a.subscriptionStatus === 'ACTIVE')
                    )
                    .slice(0, 2)
                    .map((item, index) => (
                      <Link
                        href={routes.subscriptionList}
                        className={styles.subscription}
                        key={item.id ?? index}
                      >
                        <div>
                          <strong>
                            {item.bundleTitle ||
                              item.subCategoryName ||
                              'اشتراک کسب‌وکار'}
                          </strong>
                          <span
                            className={`${styles.status} ${
                              item.subscriptionStatus === 'ACTIVE'
                                ? styles.green
                                : styles.amber
                            }`}
                          >
                            {item.subscriptionStatus === 'ACTIVE'
                              ? 'فعال'
                              : item.subscriptionStatus === 'PENDING'
                              ? 'در انتظار تأیید'
                              : item.subscriptionStatus === 'DISABLE'
                              ? 'غیرفعال'
                              : 'بررسی وضعیت'}
                          </span>
                        </div>
                        <p>
                          <CalendarDays size={13} />
                          {item.endDateStr
                            ? `پایان اعتبار: ${item.endDateStr}`
                            : 'مشاهده جزئیات و دسترسی‌ها'}
                          <ChevronLeft size={14} />
                        </p>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className={styles.compactEmpty}>
                  <ShieldCheck size={25} />
                  <p>هنوز اشتراکی برای شما ثبت نشده است.</p>
                  <Link
                    href={routes.subscriptionList}
                    className={styles.textLink}
                  >
                    بررسی اشتراک‌ها <ArrowLeft size={14} />
                  </Link>
                </div>
              )}
            </Feedback>
          </section>

          <section className={styles.panel}>
            <SectionTitle icon={Bell} title="تازه‌ترین اعلان‌ها">
              <Link
                href={routes.notificationCenter}
                className={styles.textLink}
              >
                همه <ChevronLeft size={14} />
              </Link>
            </SectionTitle>
            {notifications.isLoading ? (
              <Feedback loading />
            ) : notifications.recentItems.length ? (
              <div className={styles.notifications}>
                {notifications.recentItems.slice(0, 3).map((item) => (
                  <Link
                    href={routes.notificationCenter}
                    key={item.id}
                    className={styles.notification}
                  >
                    <span
                      className={`${styles.notificationDot} ${
                        item.isRead ? styles.read : ''
                      }`}
                    />
                    <div>
                      <strong>{item.title || 'اعلان جدید'}</strong>
                      <p>{item.message.replace(/<[^>]*>/g, '')}</p>
                      {item.createdAt &&
                        !Number.isNaN(Date.parse(item.createdAt)) && (
                          <time dateTime={item.createdAt}>
                            {new Intl.DateTimeFormat('fa-IR', {
                              day: 'numeric',
                              month: 'long',
                              timeZone: 'Asia/Tehran',
                            }).format(new Date(item.createdAt))}
                          </time>
                        )}
                    </div>
                    <ChevronLeft size={14} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.compactEmpty}>
                <CheckCheck size={26} />
                <p>اعلانی برای نمایش وجود ندارد.</p>
                <Link
                  href={routes.notificationCenter}
                  className={styles.textLink}
                >
                  رفتن به مرکز اعلان‌ها
                </Link>
              </div>
            )}
          </section>

          <Link href={routes.support.ticket} className={styles.supportCard}>
            <span>
              <Headphones size={24} />
            </span>
            <div>
              <strong>کنارتان هستیم.</strong>
              <p>برای قدم بعدی راهنمایی می‌خواهید؟</p>
            </div>
            <ArrowUpLeft size={18} />
          </Link>
        </aside>
      </div>
      <footer className={styles.footer}>
        <span>
          <Sprout size={15} />
          فودکیز؛ شبکه کسب‌وکارهای صنایع غذایی و کشاورزی
        </span>
        <a href={CLIENT_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
          مشاهده وب‌سایت <ExternalLink size={13} />
        </a>
      </footer>

      <CreateBusinessDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
