'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  ExternalLink,
  Headphones,
  LayoutDashboard,
  Leaf,
  Library,
  Plus,
  ReceiptText,
  Search,
  Sprout,
  Tractor,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import { useServiceSubcategories } from '@/hooks/use-service-subcategories';
import { routes } from '@/config/routes';
import { CLIENT_WEBSITE_URL } from '@/config/api.config';
import { normalizeSearch } from '@/app/shared/dashboard2/dashboard-data';
import CreateBusinessDialog from '@/app/shared/dashboard2/create-business-dialog';
import cn from '@/utils/class-names';
import styles from './sidebar.module.css';

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: { label: string; href: string }[];
};

function MenuEntry({
  item,
  pathname,
  forceOpen,
  onNavigate,
}: {
  item: MenuItem;
  pathname: string;
  forceOpen: boolean;
  onNavigate: () => void;
}) {
  const id = useId();
  const childActive = Boolean(
    item.children?.some(
      (child) =>
        pathname === child.href || pathname.startsWith(child.href + '/')
    )
  );
  const [open, setOpen] = useState(childActive);
  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive, pathname]);
  const expanded = forceOpen || open;
  const active =
    item.href === '/'
      ? pathname === '/'
      : item.href === '/info'
      ? pathname === '/info'
      : Boolean(
          item.href &&
            (pathname === item.href || pathname.startsWith(item.href + '/'))
        );
  const Icon = item.icon;
  if (item.href)
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(styles.menuLink, active && styles.active)}
      >
        <Icon size={19} />
        <span>{item.label}</span>
        {active && <span className={styles.activeDot} />}
      </Link>
    );
  return (
    <div className={styles.menuGroup}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={expanded}
        aria-controls={id}
        className={cn(styles.menuLink, childActive && styles.groupActive)}
      >
        <Icon size={19} />
        <span>{item.label}</span>
        <ChevronDown size={14} className={expanded ? styles.rotated : ''} />
      </button>
      <div id={id} hidden={!expanded} className={styles.submenu}>
        {item.children?.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            onClick={onNavigate}
            aria-current={pathname === child.href ? 'page' : undefined}
            className={pathname === child.href ? styles.childActive : undefined}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { subcategories } = useServiceSubcategories();
  const user = useSelector((state: RootState) => state.user);
  const { closeDrawer } = useDrawer();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const groups: { label: string; items: MenuItem[] }[] = [
    {
      label: 'میز کار',
      items: [
        {
          id: 'dashboard',
          label: 'داشبورد کسب‌وکار',
          href: '/',
          icon: LayoutDashboard,
        },
        {
          id: 'businesses',
          label: 'کسب‌وکارها و خدمات من',
          href: '/info',
          icon: Building2,
        },
        {
          id: 'notifications',
          label: 'مرکز اعلان‌ها',
          href: routes.notificationCenter,
          icon: Bell,
        },
      ],
    },
    {
      label: 'بانک‌های اطلاعاتی',
      items: [
        {
          id: 'food',
          label: 'صنایع غذایی',
          icon: Leaf,
          children: [
            {
              label: 'شرکت‌های صنایع غذایی',
              href: routes.info.foodIndustryList,
            },
            {
              label: 'ثبت شرکت صنایع غذایی',
              href: routes.info.foodIndustryAdd,
            },
          ],
        },
        {
          id: 'agriculture',
          label: 'صنعت کشاورزی',
          icon: Sprout,
          children: [
            {
              label: 'شرکت‌های کشاورزی',
              href: routes.info.agricultureIndustryList,
            },
            {
              label: 'ثبت شرکت کشاورزی',
              href: routes.info.agricultureIndustryAdd,
            },
          ],
        },
        {
          id: 'services',
          label: 'خدمات و آگهی‌ها',
          icon: Library,
          children: [
            ...subcategories.map((item) => ({
              label: item.subCategoryDisplayName,
              href: routes.info.serviceIndustrySubCategoryCreate(
                item.subCategoryName
              ),
            })),
          ],
        },
        {
          id: 'machinery',
          label: 'ماشین‌آلات دست دوم',
          icon: Tractor,
          children: [
            {
              label: 'خریداران ماشین‌آلات',
              href: '/info/used_machinery/buying',
            },
            {
              label: 'فروشندگان ماشین‌آلات',
              href: '/info/used_machinery/selling',
            },
            {
              label: 'ثبت درخواست خرید',
              href: '/info/used_machinery/buying/create',
            },
            {
              label: 'ثبت آگهی فروش',
              href: '/info/used_machinery/selling/create',
            },
          ],
        },
        {
          id: 'media',
          label: 'رسانه و آموزش',
          icon: Library,
          children: [
            { label: 'فهرست رسانه و آموزش', href: '/info/media/educations' },
            {
              label: 'ثبت اطلاعات جدید',
              href: '/info/media/educations/create',
            },
          ],
        },
      ],
    },
    {
      label: 'اشتراک و امور مالی',
      items: [
        {
          id: 'subscriptions',
          label: 'مدیریت اشتراک',
          href: routes.subscriptionList,
          icon: CreditCard,
        },
        {
          id: 'wallet',
          label: 'کیف پول',
          href: routes.finance.wallet,
          icon: Wallet,
        },
        {
          id: 'payments',
          label: 'پرداخت‌ها و تراکنش‌ها',
          icon: ReceiptText,
          children: [
            { label: 'سوابق پرداخت', href: routes.finance.paymentList },
            { label: 'گردش حساب', href: routes.finance.transactionList },
          ],
        },
      ],
    },
    {
      label: 'حساب و پشتیبانی',
      items: [
        {
          id: 'profile',
          label: 'حساب کاربری',
          href: routes.profile,
          icon: UserRound,
        },
        {
          id: 'support',
          label: 'تیکت‌های پشتیبانی',
          href: routes.support.ticket,
          icon: Headphones,
        },
      ],
    },
  ];
  const query = normalizeSearch(search);
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.flatMap((item) => {
        if (!query || normalizeSearch(item.label).includes(query))
          return [item];
        const children = item.children?.filter((child) =>
          normalizeSearch(child.label).includes(query)
        );
        return children?.length ? [{ ...item, children }] : [];
      }),
    }))
    .filter((group) => group.items.length);
  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] print:hidden 2xl:w-72',
        styles.sidebar,
        className
      )}
      aria-label="منوی اصلی کسب‌وکار"
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" onClick={closeDrawer}>
            <Image
              src="/fkLogo.png"
              alt="فودکیز"
              width={39}
              height={39}
              priority
            />
            <div>
              <strong>
                فودکیز<span>FOODKEYS</span>
              </strong>
              <small>خانه کسب‌وکارهای صنعت غذا و کشاورزی</small>
            </div>
          </Link>
          <button
            className={styles.close}
            aria-label="بستن منو"
            onClick={closeDrawer}
          >
            <X size={20} />
          </button>
        </div>
        <button className={styles.create} onClick={() => setCreateOpen(true)}>
          <Plus size={18} />
          <span>ثبت کسب‌وکار یا خدمت</span>
          <ChevronLeft size={15} />
        </button>
        <label className={styles.search}>
          <Search size={15} />
          <input
            aria-label="جست‌وجو در منو"
            placeholder="دنبال چه بخشی می‌گردید؟"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="پاک کردن جست‌وجوی منو"
            >
              <X size={13} />
            </button>
          )}
        </label>
        <nav className={styles.navigation} aria-label="بخش‌های پنل">
          {filtered.map((group) => (
            <section key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map((item) => (
                <MenuEntry
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  forceOpen={Boolean(query)}
                  onNavigate={closeDrawer}
                />
              ))}
            </section>
          ))}
          {!filtered.length && (
            <p className={styles.empty}>بخشی با این نام پیدا نشد.</p>
          )}
        </nav>
        <div className={styles.sidebarBottom}>
          <a
            href={CLIENT_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.website}
          >
            <Sprout size={17} />
            <span>مشاهده وب‌سایت فودکیز</span>
            <ExternalLink size={13} />
          </a>
          <Link
            href={routes.profile}
            onClick={closeDrawer}
            className={styles.account}
          >
            <span className={styles.avatar}>
              {user.firstName?.slice(0, 1) || <UserRound size={18} />}
            </span>
            <div>
              <strong>
                {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
                  'حساب کاربری'}
              </strong>
              <small>مدیریت اطلاعات حساب</small>
            </div>
            <ChevronLeft size={15} />
          </Link>
        </div>
      </div>
      <CreateBusinessDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onNavigate={closeDrawer}
      />
    </aside>
  );
}
