'use client';

import { useId, useRef, useState } from 'react';
import { FileCheck2, FileUp, FileX2, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import useAxiosPrivate from '@/hooks/use-axios-private';
import cn from '@/utils/class-names';

interface FileUploadProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  label?: string;
  fileServiceType?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '۰ بایت';
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const unitIndex = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;
  return `${new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 1,
  }).format(value)} ${units[unitIndex]}`;
}

function acceptedFormats(accept: string) {
  if (!accept || accept === '*') return 'همه فرمت‌های فایل';
  return accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      item.startsWith('.')
        ? item.slice(1).toUpperCase()
        : item.replace('/*', '').replace('application/', '').toUpperCase()
    )
    .join('، ');
}

function matchesAccept(file: File, accept: string) {
  if (!accept || accept === '*') return true;
  return accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((item) => {
      if (item.startsWith('.')) return file.name.toLowerCase().endsWith(item);
      if (item.endsWith('/*')) return file.type.startsWith(item.slice(0, -1));
      return file.type.toLowerCase() === item;
    });
}

export default function FileUpload({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  multiple = false,
  accept = '*',
  maxSize = 5 * 1024 * 1024,
  maxFiles = 1,
  label = 'آپلود فایل',
  fileServiceType = 'SERVICE_FILE',
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const axiosPrivate = useAxiosPrivate();

  const files = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : value
    ? [value]
    : [];
  const hasUploadedFile = files.length > 0;
  const uploadDisabled = disabled || isUploading;
  const reachedLimit = multiple && files.length >= maxFiles;
  const visibleError = error || localError;

  const uploadFiles = async (incomingFiles: File[]) => {
    if (uploadDisabled || incomingFiles.length === 0) return;
    const selectedFiles = multiple ? incomingFiles : incomingFiles.slice(0, 1);
    setLocalError(null);

    if (multiple && files.length + selectedFiles.length > maxFiles) {
      setLocalError(
        `حداکثر ${new Intl.NumberFormat('fa-IR').format(
          maxFiles
        )} فایل می‌توانید بارگذاری کنید.`
      );
      return;
    }
    const invalidFormat = selectedFiles.find(
      (file) => !matchesAccept(file, accept)
    );
    if (invalidFormat) {
      setLocalError(`فرمت فایل «${invalidFormat.name}» مجاز نیست.`);
      return;
    }
    const oversizedFile = selectedFiles.find((file) => file.size > maxSize);
    if (oversizedFile) {
      setLocalError(
        `حجم فایل «${oversizedFile.name}» باید حداکثر ${formatBytes(
          maxSize
        )} باشد.`
      );
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      const fileProgress = selectedFiles.map(() => 0);
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append('files', file);
          formData.append('serviceName', fileServiceType || 'SERVICE_FILE');
          const response = await axiosPrivate.post('/service/file/temp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
              if (!event.total) return;
              fileProgress[index] = Math.round(
                (event.loaded * 100) / event.total
              );
              setProgress(
                Math.round(
                  fileProgress.reduce((sum, item) => sum + item, 0) /
                    selectedFiles.length
                )
              );
            },
          });
          const responseData = response.data?.data;
          const uploadedFile = Array.isArray(responseData)
            ? responseData[0]
            : responseData;
          if (!uploadedFile?.id) {
            throw new Error(
              response.data?.message || 'بارگذاری فایل ناموفق بود.'
            );
          }
          return uploadedFile;
        })
      );

      setProgress(100);
      onChange(multiple ? [...files, ...uploadedFiles] : uploadedFiles[0]);
      onBlur?.();
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      setLocalError(
        (isAxiosError(uploadError) && uploadError.response?.data?.message) ||
          (uploadError instanceof Error && uploadError.message) ||
          'بارگذاری فایل ناموفق بود؛ لطفاً دوباره تلاش کنید.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    if (!uploadDisabled && !reachedLimit) fileInputRef.current?.click();
  };

  return (
    <div className="w-full" dir="rtl">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'mb-2 block text-sm font-medium',
            visibleError ? 'text-red-dark' : 'text-gray-700'
          )}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={(event) => {
          const input = event.currentTarget;
          void uploadFiles(Array.from(input.files || [])).finally(() => {
            input.value = '';
          });
        }}
        accept={accept === '*' ? undefined : accept}
        multiple={multiple}
        disabled={uploadDisabled || reachedLimit}
        aria-invalid={Boolean(visibleError)}
        aria-describedby={`${inputId}-help ${inputId}-status`}
      />

      <div
        role="button"
        tabIndex={uploadDisabled || reachedLimit ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!uploadDisabled && !reachedLimit) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploadDisabled && !reachedLimit) {
            event.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          'min-h-44 group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          visibleError
            ? 'border-red-light bg-red-lighter/40'
            : isDragging
            ? 'border-primary bg-primary-lighter/40'
            : hasUploadedFile
            ? 'border-green-300 bg-green-50/50 hover:border-green-400'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary-lighter/20',
          (uploadDisabled || reachedLimit) &&
            'cursor-not-allowed opacity-60 hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <span
          className={cn(
            'mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            visibleError
              ? 'bg-red-100 text-red-dark'
              : hasUploadedFile
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-500 shadow-sm group-hover:text-primary'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : visibleError ? (
            <FileX2 className="h-6 w-6" />
          ) : hasUploadedFile ? (
            <FileCheck2 className="h-6 w-6" />
          ) : (
            <FileUp className="h-6 w-6" />
          )}
        </span>

        <p className="text-sm font-semibold text-gray-900">
          {isUploading
            ? 'در حال بارگذاری فایل…'
            : reachedLimit
            ? 'حداکثر تعداد فایل بارگذاری شده است'
            : hasUploadedFile && !multiple
            ? 'برای جایگزینی فایل کلیک کنید'
            : 'فایل را اینجا رها کنید یا انتخاب کنید'}
        </p>
        {!isUploading && !reachedLimit && (
          <p className="mt-1 text-xs text-gray-500">
            {hasUploadedFile && !multiple
              ? 'فایل فعلی با فایل جدید جایگزین می‌شود.'
              : 'انتخاب فایل از دستگاه'}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>فرمت: {acceptedFormats(accept)}</span>
          <span aria-hidden="true">•</span>
          <span>حداکثر حجم: {formatBytes(maxSize)}</span>
          {multiple && (
            <>
              <span aria-hidden="true">•</span>
              <span>
                حداکثر {new Intl.NumberFormat('fa-IR').format(maxFiles)} فایل
              </span>
            </>
          )}
        </div>

        {isUploading && (
          <div className="mt-4 w-full max-w-xs">
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-1 block text-xs text-gray-500" dir="ltr">
              {new Intl.NumberFormat('fa-IR').format(progress)}%
            </span>
          </div>
        )}
      </div>

      <div id={`${inputId}-status`} aria-live="polite">
        {visibleError && (
          <p
            role="alert"
            className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-dark"
          >
            <FileX2 className="mt-0.5 h-4 w-4 shrink-0" />
            {visibleError}
          </p>
        )}
      </div>

      {!visibleError && helperText && (
        <p
          id={`${inputId}-help`}
          className="mt-2 text-xs leading-5 text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
