'use client';

import { UploadValidationState } from '@/hooks/use-company-upload-validation';
import { uploadExtensions, uploadSize } from '@/utils/file-upload-validation';
import { Info, RotateCw } from 'lucide-react';
import cn from '@/utils/class-names';

export default function FileUploadGuidelines({
  state,
  id,
  className,
  compact = false,
}: {
  state: UploadValidationState;
  multiple?: boolean;
  id?: string;
  className?: string;
  compact?: boolean;
}) {
  const guide = state.validation?.rules?.guide;
  const description = typeof guide === 'string' ? guide.trim() : '';
  const extensions = state.validation ? uploadExtensions(state.validation) : [];
  const formats = extensions.length
    ? extensions.map((extension) => extension.toUpperCase())
    : state.validation?.mimeTypes ?? [];

  return (
    <div
      id={id}
      className={cn(
        'mt-3 min-w-0 max-w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-start @container/upload-guide',
        compact && 'mt-2 rounded-none border-0 bg-transparent px-0 py-0',
        className
      )}
    >
      {state.loading ? (
        <p role="status" className="text-xs text-gray-500">
          در حال دریافت مشخصات فایل مجاز…
        </p>
      ) : !state.validation ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <span className="text-gray-600">
            مشخصات فایل دریافت نشد؛ برای انتخاب فایل دوباره تلاش کنید.
          </span>
          <button
            type="button"
            onClick={state.retry}
            className="relative z-10 inline-flex items-center gap-1 rounded px-1 py-1 font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCw className="h-3.5 w-3.5" />
            تلاش مجدد
          </button>
        </div>
      ) : compact ? (
        <div className="space-y-1 text-xs leading-5 text-gray-500">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {formats.length > 0 && (
              <bdi dir="ltr" className="flex flex-wrap gap-x-1.5">
                {formats.map((format, index) => (
                  <span
                    key={`${format}-${index}`}
                    className="whitespace-nowrap"
                  >
                    {format}
                    {index < formats.length - 1 ? '،' : ''}
                  </span>
                ))}
              </bdi>
            )}
            {state.validation.maxSizeBytes != null && (
              <span>حداکثر {uploadSize(state.validation.maxSizeBytes)}</span>
            )}
          </div>
          {description && (
            <details>
              <summary className="w-fit cursor-pointer rounded text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                راهنمای تصویر
              </summary>
              <p className="mt-1 whitespace-pre-line break-words">
                {description}
              </p>
            </details>
          )}
        </div>
      ) : (
        <>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <Info className="h-3.5 w-3.5 shrink-0" />
            راهنمای آپلود
          </p>
          <dl className="space-y-2 text-xs leading-6">
            <div className="grid min-w-0 grid-cols-1 items-baseline gap-x-3 gap-y-1 @xs/upload-guide:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="text-gray-500">فرمت‌های مجاز:</dt>
              <dd className="min-w-0 font-medium text-gray-700">
                {formats.length ? (
                  <bdi dir="ltr" className="flex flex-wrap gap-x-2 gap-y-1">
                    {formats.map((format, index) => (
                      <span
                        key={`${format}-${index}`}
                        className="whitespace-nowrap"
                      >
                        {format}
                        {index < formats.length - 1 ? '،' : ''}
                      </span>
                    ))}
                  </bdi>
                ) : (
                  'فرمت خاصی تعیین نشده است'
                )}
              </dd>
            </div>
            {state.validation.maxSizeBytes != null && (
              <div className="grid min-w-0 grid-cols-1 items-baseline gap-x-3 gap-y-1 @xs/upload-guide:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="text-gray-500">حداکثر حجم هر فایل:</dt>
                <dd className="min-w-0 font-medium text-gray-700">
                  {uploadSize(state.validation.maxSizeBytes)}
                </dd>
              </div>
            )}
            {description && (
              <div className="border-t border-gray-200/70 pt-2">
                <dt className="text-gray-500">توضیحات:</dt>
                <dd className="mt-1 whitespace-pre-line break-words text-gray-700">
                  {description}
                </dd>
              </div>
            )}
          </dl>
        </>
      )}
    </div>
  );
}
