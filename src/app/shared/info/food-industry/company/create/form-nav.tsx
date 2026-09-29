'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from '@/utils/class-names';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    updateScrollControls();
    window.addEventListener('resize', updateScrollControls);

    return () => window.removeEventListener('resize', updateScrollControls);
  }, [updateScrollControls]);

  useEffect(() => {
    const updateActiveSection = () => {
      let currentSection = menuItems[0].value;

      for (const item of menuItems) {
        const section = document.querySelector<HTMLElement>(
          `div[name="${item.value}"]`
        );

        if (section && section.getBoundingClientRect().top <= 170) {
          currentSection = item.value;
        } else {
          break;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });

    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  const scrollMenu = (direction: 'backward' | 'forward') => {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'forward' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  const keepActiveItemVisible = (value: string) => {
    const activeItem = scrollContainerRef.current?.querySelector(
      `[data-form-nav="${value}"]`
    );

    activeItem?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  useEffect(() => {
    keepActiveItemVisible(activeSection);
  }, [activeSection]);

  return (
    <nav
      aria-label="دسترسی سریع به بخش‌های فرم"
      dir="rtl"
      className={cn(
        'sticky top-[68px] z-20 border-y border-gray-200 bg-gray-0/95 px-10 py-2 font-medium shadow-[0_8px_24px_-20px_rgba(15,23,42,0.55)] backdrop-blur-md @2xl:top-[72px] dark:border-gray-300 dark:bg-gray-50/95 2xl:top-20',
        className
      )}
    >
      <button
        type="button"
        aria-label="مشاهده بخش‌های قبلی"
        onClick={() => scrollMenu('backward')}
        disabled={!canScrollBackward}
        className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-gray-0 text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-gray-1000 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-300 dark:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <div
        ref={scrollContainerRef}
        onScroll={updateScrollControls}
        className="custom-scrollbar-x overflow-x-auto scroll-smooth px-1 pb-1"
      >
        <div className="flex w-max min-w-full items-center gap-2">
          {menuItems.map((tab) => (
            <a
              key={tab.value}
              href={`#${tab.value}`}
              data-form-nav={tab.value}
              aria-current={activeSection === tab.value ? 'step' : undefined}
              onClick={() => setActiveSection(tab.value)}
              className={cn(
                'cursor-pointer whitespace-nowrap rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-1000 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-300',
                activeSection === tab.value &&
                  '!border-gray-1000 !bg-gray-1000 !font-semibold !text-gray-0 shadow-sm dark:!border-gray-900 dark:!bg-gray-900'
              )}
            >
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
        className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-gray-0 text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-gray-1000 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-300 dark:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
