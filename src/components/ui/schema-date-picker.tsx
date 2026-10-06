'use client';

import MultiDatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import { PiCalendarBlank, PiCaretDownBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import './schema-date-picker.css';

type SchemaDatePickerProps = {
  value?: Date | string | null;
  onChange: (value: Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
  describedBy?: string;
};

const weekDays = [
  ['شنبه', 'ش'],
  ['یکشنبه', 'ی'],
  ['دوشنبه', 'د'],
  ['سه‌شنبه', 'س'],
  ['چهارشنبه', 'چ'],
  ['پنجشنبه', 'پ'],
  ['جمعه', 'ج'],
];

function normalizeDate(value?: Date | string | null) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
}

export default function SchemaDatePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
  hasError = false,
  id,
  label,
  required = false,
  describedBy,
}: SchemaDatePickerProps) {
  return (
    <div className="w-full" dir="rtl" aria-invalid={hasError || undefined}>
      <MultiDatePicker
        value={normalizeDate(value)}
        onChange={(date) =>
          onChange(date instanceof DateObject ? date.toDate() : null)
        }
        onClose={() => onBlur?.()}
        calendar={persian}
        locale={persianFa}
        weekDays={weekDays}
        format="YYYY/MM/DD"
        editable={false}
        disabled={disabled}
        onOpenPickNewDate={false}
        showOtherDays
        highlightToday
        calendarPosition="bottom-right"
        containerClassName="schema-date-picker-container"
        className="schema-date-calendar"
        zIndex={1100}
        render={(formattedValue, openCalendar) => (
          <button
            id={id}
            type="button"
            onClick={openCalendar}
            onBlur={onBlur}
            disabled={disabled}
            aria-label={`${label || placeholder}${required ? ' (الزامی)' : ''}`}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            className={cn(
              'flex h-12 w-full items-center justify-between gap-3 rounded-md border bg-white px-4 text-sm shadow-sm outline-none transition',
              'focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70 dark:bg-gray-900',
              hasError
                ? 'border-red focus:border-red focus:ring-red'
                : 'border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary dark:border-gray-600'
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
    </div>
  );
}
