'use client';

import MultiDatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import { PiCalendarBlank, PiCaretDownBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { FieldError } from '@/components/ui/field-error';
import './birth-date-picker.css';

type BirthDatePickerProps = {
  value?: Date | null;
  onChange: (value: Date | null) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  className?: string;
  maxDate?: Date;
};

const isValidDate = (value?: Date | null): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

export default function BirthDatePicker({
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'تاریخ تولد',
  className,
  maxDate = new Date(),
}: BirthDatePickerProps) {
  const selectedDate = isValidDate(value) ? value : null;

  return (
    <div className={cn('w-full', className)} dir="rtl">
      <MultiDatePicker
        value={selectedDate}
        onChange={(date) =>
          onChange(date instanceof DateObject ? date.toDate() : null)
        }
        onClose={() => {
          onBlur?.();
        }}
        calendar={persian}
        locale={persianFa}
        format="YYYY/MM/DD"
        maxDate={maxDate}
        editable={false}
        showOtherDays
        highlightToday
        calendarPosition="bottom-right"
        containerClassName="birth-date-picker-container"
        className="birth-date-calendar"
        zIndex={1000}
        render={(formattedValue, openCalendar) => (
          <button
            type="button"
            onClick={openCalendar}
            aria-label={placeholder}
            aria-haspopup="dialog"
            className={cn(
              'flex h-12 w-full items-center justify-between gap-3 rounded-md border bg-white px-4 text-sm shadow-sm outline-none transition',
              'hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-900',
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <PiCalendarBlank className="h-5 w-5 shrink-0 text-gray-500" />
              <span
                className={cn(
                  'truncate',
                  formattedValue
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500'
                )}
              >
                {formattedValue || placeholder}
              </span>
            </span>
            <PiCaretDownBold className="h-4 w-4 shrink-0 text-gray-500" />
          </button>
        )}
      />
      {error && <FieldError error={error} className="mt-1" />}
    </div>
  );
}
