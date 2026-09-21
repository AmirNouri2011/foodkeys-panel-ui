'use client';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  PiArrowClockwiseBold,
  PiWarningCircleBold,
  PiXBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { Modal, ActionIcon } from 'rizzui';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

type CaptchaFieldProps = {
  imageSrc: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  error?: string;
  loadError?: string;
  className?: string;
  color?: 'success' | 'info' | 'primary' | 'secondary' | 'danger' | 'warning';
  compact?: boolean;
  inline?: boolean;
};

export default function CaptchaField({
  imageSrc,
  answer,
  onAnswerChange,
  onRefresh,
  loading = false,
  error,
  loadError,
  className,
  color = 'success',
  compact = false,
  inline = false,
}: CaptchaFieldProps) {
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useEffect(() => {
    if (loadError) setErrorModalOpen(true);
  }, [loadError]);

  const handleRetry = async () => {
    setErrorModalOpen(false);
    await onRefresh();
  };

  return (
    <>
      <div
        dir={inline ? 'ltr' : undefined}
        className={cn(
          inline ? 'flex items-end gap-2' : compact ? 'space-y-2' : 'space-y-3',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2',
            inline && 'w-[48%] min-w-0 shrink-0'
          )}
        >
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="برای دریافت کپچای جدید کلیک کنید"
            className={cn(
              'relative flex flex-1 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-50',
              inline ? 'min-w-0' : 'min-w-[160px]',
              compact || inline ? 'h-11' : 'h-14',
              loading && 'opacity-60'
            )}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="کپچا"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Text className="text-sm text-gray-500">
                {loading ? 'در حال بارگذاری...' : 'کپچا موجود نیست'}
              </Text>
            )}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="بازنشانی کپچا"
            className={cn(
              'flex shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50',
              inline ? 'h-11 w-10' : compact ? 'h-11 w-12' : 'h-14 w-12'
            )}
          >
            <PiArrowClockwiseBold
              className={cn('h-5 w-5', loading && 'animate-spin')}
            />
          </button>
        </div>
        <Input
          dir={inline ? 'rtl' : undefined}
          type="text"
          size="lg"
          // label="کد کپچا"
          placeholder="کد تصویر را وارد کنید"
          color={color}
          autoComplete="off"
          autoCapitalize="characters"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          error={error}
          className={cn(
            '[&>label>span]:font-medium',
            inline && 'min-w-0 flex-1'
          )}
          inputClassName={cn(
            'text-sm tracking-widest uppercase',
            inline && 'text-left [direction:ltr]',
            (compact || inline) && 'h-11'
          )}
        />
        {!compact && !inline && (
          <Text className="text-xs text-gray-500">
            روی تصویر کلیک کنید تا کپچا عوض شود. حروف بزرگ و کوچک یکسان‌اند.
          </Text>
        )}
      </div>

      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        className="flex items-center justify-center p-4"
        backdropClassName="bg-gray-900/55 backdrop-blur-sm"
      >
        <div
          dir="rtl"
          className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <div className="mb-2 flex justify-end">
            <ActionIcon
              type="button"
              variant="text"
              size="sm"
              onClick={() => setErrorModalOpen(false)}
              aria-label="بستن"
            >
              <PiXBold className="h-5 w-5" />
            </ActionIcon>
          </div>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-lighter text-red-dark">
            <PiWarningCircleBold className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-black text-gray-900">
            کپچا بارگذاری نشد
          </h3>
          <p className="mb-6 text-sm leading-7 text-gray-500">
            {loadError || 'در دریافت کپچا مشکلی پیش آمد.'}
          </p>
          <Button
            type="button"
            color="success"
            isLoading={loading}
            onClick={handleRetry}
            className="h-11 w-full bg-[#129974] font-semibold"
          >
            دوباره تلاش کنید
          </Button>
        </div>
      </Modal>
    </>
  );
}
