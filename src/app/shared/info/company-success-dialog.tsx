'use client';

import { Dialog } from '@headlessui/react';
import { ArrowLeft, Check, CheckCircle2, Clock3 } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  notice: string;
  actionLabel: string;
  onContinue: () => void;
  onLater?: () => void;
  purchased?: boolean;
  statusLabel?: string;
  steps?: [string, string, string];
  stepsAriaLabel?: string;
  laterLabel?: string;
};

export default function CompanySuccessDialog({
  open,
  title,
  description,
  notice,
  actionLabel,
  onContinue,
  onLater,
  purchased = false,
  statusLabel,
  steps = ['ثبت شرکت', 'تهیه اشتراک', 'بررسی و انتشار'],
  stepsAriaLabel = 'مراحل انتشار شرکت',
  laterLabel = 'بعداً؛ رفتن به کسب‌وکارهای من',
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      className="relative z-[9999]"
      dir="rtl"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-lg rounded-3xl bg-white p-6 text-right shadow-2xl dark:bg-gray-100 sm:p-8">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#047857]">
              <CheckCircle2 size={34} aria-hidden="true" />
            </div>
            <p className="mb-2 text-sm font-medium text-[#047857]">
              {statusLabel ||
                (purchased ? 'خرید اشتراک تکمیل شد' : 'اطلاعات شرکت ذخیره شد')}
            </p>
            <Dialog.Title className="text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-base leading-8 text-gray-600">
              {description}
            </Dialog.Description>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] p-4 text-[#064e3b]">
              <Clock3 className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-7">{notice}</p>
            </div>
            <ol
              aria-label={stepsAriaLabel}
              className="my-6 flex items-start gap-2 text-center text-xs leading-6 text-gray-600"
            >
              {steps.map((label, index) => (
                <li
                  key={label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      index === 0 || (purchased && index === 1)
                        ? 'bg-[#047857] text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-200'
                    }`}
                  >
                    {index === 0 || (purchased && index === 1) ? (
                      <Check size={16} aria-hidden="true" />
                    ) : index === 1 ? (
                      '۲'
                    ) : (
                      '۳'
                    )}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={onContinue}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#065f46] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#064e3b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#047857]"
            >
              {actionLabel}
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            {onLater && (
              <button
                type="button"
                onClick={onLater}
                className="mt-3 min-h-[44px] w-full rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#047857]"
              >
                {laterLabel}
              </button>
            )}
            <p className="mt-4 text-center text-xs leading-6 text-gray-500">
              این پیام تا انتخاب شما باز می‌ماند.
            </p>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
