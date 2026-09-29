'use client';

import cn from '@/utils/class-names';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface FormFooterProps {
  className?: string;
  draftBtnText?: string;
  submitBtnText?: string;
  isLoading?: boolean;
  onDraftClick?: () => void;
  draftButtonClassName?: string;
  submitButtonClassName?: string;
}

export const negMargin = '-mx-4 md:-mx-5 lg:-mx-6 3xl:-mx-8 4xl:-mx-10';

export default function FormFooter({
  isLoading,
  draftBtnText = 'ذخیره به عنوان پیش نویس',
  submitBtnText = 'تایید',
  onDraftClick,
  draftButtonClassName,
  submitButtonClassName,
  className,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 -mb-8 flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-0 px-4 py-4 dark:border-gray-300 dark:bg-gray-50 md:px-5 lg:px-6 3xl:px-8 4xl:px-10',
        className,
        negMargin
      )}
    >
      <Button
        type="button"
        onClick={onDraftClick ?? (() => toast.error('این فیچر در حال توسعه است'))}
        variant="outline"
        className={cn('w-full @xl:w-auto', draftButtonClassName)}
      >
        {draftBtnText}
      </Button>
      <Button
        type="submit"
        data-form-submit="true"
        isLoading={isLoading}
        className={cn(
          'w-full @xl:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100',
          submitButtonClassName
        )}
      >
        {submitBtnText}
      </Button>
    </div>
  );
}
