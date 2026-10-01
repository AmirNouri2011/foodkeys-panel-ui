'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from '@/utils/class-names';
import { activeFormSection, sectionScrollTop } from './form-nav-utils';

export const formParts = {
  summary: 'summary',
  intro: 'intro',
  history: 'history',
  products: 'products',
  contact: 'contact',
  factory: 'factory',
  office: 'office',
  location: 'location',
  social: 'social',
  media: 'media',
  gallery: 'gallery',
  supplementary: 'supplementary',
  portalCooperation: 'portalCooperation',
  pricingInventory: 'pricingInventory',
  productIdentifiers: 'productIdentifiers',
  shipping: 'shipping',
  seo: 'seo',
  deliveryEvent: 'deliveryEvent',
  variantOptions: 'variantOptions',
  tagsAndCategory: 'tagsAndCategory',
};

export const menuItems = [
  {
    label: 'معرفی شرکت',
    value: formParts.intro,
  },
  {
    label: 'تاریخچه',
    value: formParts.history,
  },
  {
    label: 'موقعیت مکانی',
    value: formParts.location,
  },
  {
    label: 'اطلاعات تماس کارخانه',
    value: formParts.factory,
  },
  {
    label: 'اطلاعات تماس دفتر مرکزی',
    value: formParts.office,
  },
  {
    label: 'شبکه های اجتماعی و اینترنت',
    value: formParts.social,
  },
  {
    label: 'محصولات و خدمات',
    value: formParts.products,
  },
  {
    label: 'عکس و گالری',
    value: formParts.gallery,
  },
  {
    label: 'اطلاعات تکمیلی',
    value: formParts.supplementary,
  },
  {
    label: 'همکاری با پرتال',
    value: formParts.portalCooperation,
  },
];

interface FormNavProps {
  className?: string;
}

export default function FormNav({ className }: FormNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingNavigation = useRef<{ value: string; top: number } | null>(null);
  const [headerHeight, setHeaderHeight] = useState(68);
  const [activeSection, setActiveSection] = useState(formParts.intro);
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollControls = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = Math.abs(container.scrollLeft);

    setCanScrollBackward(currentScroll > 2);
    setCanScrollForward(currentScroll < maxScroll - 2);
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const pending = pendingNavigation.current;
      if (pending) {
        setActiveSection(pending.value);
        if (Math.abs(window.scrollY - pending.top) <= 2)
          pendingNavigation.current = null;
        return;
      }
      const anchor =
        (navRef.current?.getBoundingClientRect().bottom ?? 140) + 12;
      const footer = document.querySelector('[data-form-footer]');
      const visibleBottom = Math.min(
        window.innerHeight,
        footer?.getBoundingClientRect().top ?? window.innerHeight
      );
      const sections = menuItems.flatMap((item) => {
        const section = document.getElementById(item.value);
        if (!section) return [];
        const rect = section.getBoundingClientRect();
        return [{ value: item.value, top: rect.top, bottom: rect.bottom }];
      });
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 3;
      const current = activeFormSection(
        sections,
        anchor,
        visibleBottom,
        atPageEnd
      );
      if (current) setActiveSection(current);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };
    const cancelNavigation = () => {
      pendingNavigation.current = null;
      scheduleUpdate();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
        ].includes(event.key) &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest(
            'input, textarea, select, button, [contenteditable]'
          )
        )
      ) {
        cancelNavigation();
      }
    };
    const header = document.querySelector('header');
    const observer = new ResizeObserver(() => {
      setHeaderHeight(header?.getBoundingClientRect().height ?? 0);
      scheduleUpdate();
    });
    if (header) observer.observe(header);
    if (navRef.current) observer.observe(navRef.current);
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', cancelNavigation);
    window.addEventListener('wheel', cancelNavigation, { passive: true });
    window.addEventListener('touchstart', cancelNavigation, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', cancelNavigation);
      window.removeEventListener('wheel', cancelNavigation);
      window.removeEventListener('touchstart', cancelNavigation);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const scrollToSection = (value: string) => {
    const section = document.getElementById(value);
    if (!section) return;

    setActiveSection(value);
    window.history.replaceState(null, '', `#${value}`);
    const top = sectionScrollTop(
      section.getBoundingClientRect().top,
      window.scrollY,
      headerHeight + (navRef.current?.offsetHeight ?? 54) + 12,
      document.documentElement.scrollHeight - window.innerHeight
    );
    pendingNavigation.current = { value, top };
    window.scrollTo({
      top,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  const scrollMenu = (direction: 'backward' | 'forward') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({
      left: (direction === 'forward' ? -1 : 1) * container.clientWidth * 0.75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  const keepActiveItemVisible = useCallback((value: string) => {
    const container = scrollContainerRef.current;
    const activeItem = container?.querySelector<HTMLElement>(
      `[data-form-nav="${value}"]`
    );

    if (!container || !activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const activeItemRect = activeItem.getBoundingClientRect();

    container.scrollBy({
      left:
        activeItemRect.left -
        containerRect.left -
        (containerRect.width - activeItemRect.width) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, []);

  useEffect(() => {
    const update = () => {
      keepActiveItemVisible(activeSection);
      updateScrollControls();
    };
    update();
    const observer = new ResizeObserver(update);
    if (scrollContainerRef.current)
      observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, [activeSection, keepActiveItemVisible, updateScrollControls]);

  const activeIndex = menuItems.findIndex(
    (item) => item.value === activeSection
  );
  const number = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(value);
  const arrowClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-0 text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:opacity-30';

  return (
    <nav
      ref={navRef}
      aria-label="دسترسی سریع به بخش‌های فرم"
      dir="rtl"
      style={{ top: headerHeight }}
      className={cn(
        'sticky z-20 mb-2 min-w-0 rounded-xl border border-gray-200 bg-gray-0/95 p-2 shadow-sm backdrop-blur-md dark:border-gray-300 dark:bg-gray-50/95',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 sm:hidden">
        <button
          type="button"
          aria-label="بخش قبلی"
          disabled={activeIndex <= 0}
          className={arrowClass}
          onClick={() => scrollToSection(menuItems[activeIndex - 1].value)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="company-form-section"
            className="mb-1 block px-1 text-[10px] text-gray-500"
          >
            بخش {number(activeIndex + 1)} از {number(menuItems.length)}
          </label>
          <select
            id="company-form-section"
            value={activeSection}
            onChange={(event) => scrollToSection(event.target.value)}
            className="h-9 w-full min-w-0 rounded-lg border border-primary-light bg-primary-lighter py-1 pe-8 ps-3 text-xs font-semibold text-primary-dark [background-position:left_0.5rem_center] focus:border-primary focus:ring-primary"
          >
            {menuItems.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-label="بخش بعدی"
          disabled={activeIndex >= menuItems.length - 1}
          className={arrowClass}
          onClick={() => scrollToSection(menuItems[activeIndex + 1].value)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label="مشاهده بخش‌های قبلی"
          onClick={() => scrollMenu('backward')}
          disabled={!canScrollBackward}
          className={arrowClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <div
          ref={scrollContainerRef}
          onScroll={updateScrollControls}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max min-w-full items-center gap-1.5">
            {menuItems.map((tab, index) => (
              <a
                key={tab.value}
                href={`#${tab.value}`}
                data-form-nav={tab.value}
                aria-current={
                  activeSection === tab.value ? 'location' : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(tab.value);
                }}
                className={cn(
                  'inline-flex min-h-[36px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-1000 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  activeSection === tab.value &&
                    '!border-primary-light !bg-primary-lighter !font-semibold !text-primary-dark'
                )}
              >
                <span aria-hidden="true" className="text-[10px] opacity-60">
                  {number(index + 1)}
                </span>
                {tab.label}
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="مشاهده بخش‌های بعدی"
          onClick={() => scrollMenu('forward')}
          disabled={!canScrollForward}
          className={arrowClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
