'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import {
  Control,
  RegisterOptions,
  useController,
  useWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/outlined-text-field';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import cn from '@/utils/class-names';
import {
  getCityOptions,
  isLocationPlaceholder,
  LocationKind,
  normalizeLocationName,
  OTHER_LOCATION,
  provinceOptions,
  validateLocationValue,
} from '@/utils/iran-locations';

type Props = {
  name: string;
  control: Control<any>;
  kind: LocationKind;
  label?: string;
  description?: string;
  disabled?: boolean;
  provinceFieldName?: string;
  rules?: RegisterOptions;
};

export default function SchemaLocationField({
  name,
  control,
  kind,
  label,
  description,
  disabled,
  provinceFieldName,
  rules,
}: Props) {
  const id = useId();
  const province = useWatch({ control, name: provinceFieldName || name });
  const options = useMemo(
    () =>
      kind === 'province'
        ? provinceOptions
        : getCityOptions(provinceFieldName ? province : undefined),
    [kind, province, provinceFieldName]
  );
  const [custom, setCustom] = useState(false);
  const [query, setQuery] = useState('');
  const lastEdit = useRef<unknown>(undefined);
  const { field, fieldState } = useController({
    name,
    control,
    rules: {
      ...rules,
      validate: {
        ...(typeof rules?.validate === 'object' ? rules.validate : {}),
        location: (value) =>
          validateLocationValue(
            value,
            custom ||
              Boolean(
                value &&
                  !options.some(
                    (option) =>
                      normalizeLocationName(option.value) ===
                      normalizeLocationName(String(value))
                  )
              )
          ),
      },
    },
  });
  const value =
    typeof field.value === 'string' && !isLocationPlaceholder(field.value)
      ? field.value
      : '';
  const selected = options.find(
    (option) =>
      normalizeLocationName(option.value) === normalizeLocationName(value)
  );
  const other = custom || Boolean(value && !selected);
  useEffect(() => {
    // An external reset returns to the dropdown without interrupting custom typing.
    if (field.value !== lastEdit.current) setCustom(false);
  }, [field.value, selected]);
  const filtered = options.filter((option) =>
    normalizeLocationName(option.label).includes(normalizeLocationName(query))
  );
  const error = fieldState.error?.message;

  return (
    <div className="min-w-0 space-y-2.5" dir="rtl" id={`field-${name}`}>
      <Combobox
        value={other ? OTHER_LOCATION : selected?.value || ''}
        disabled={disabled}
        onChange={(next: string) => {
          setQuery('');
          setCustom(next === OTHER_LOCATION);
          lastEdit.current = next === OTHER_LOCATION ? '' : next;
          field.onChange(lastEdit.current);
        }}
      >
        {label && (
          <Combobox.Label className="mb-1.5 block text-sm font-medium text-gray-900">
            {label}
          </Combobox.Label>
        )}
        <div className="relative">
          <div
            className={cn(
              'flex h-11 items-center gap-2 rounded-xl border bg-gray-0 px-3 shadow-sm transition duration-200',
              'focus-within:ring-primary/15 focus-within:border-primary focus-within:ring-2 hover:border-gray-400',
              disabled && 'cursor-not-allowed bg-gray-100 opacity-70',
              error
                ? 'focus-within:ring-red/15 border-red focus-within:border-red'
                : 'border-gray-300'
            )}
          >
            <MapPin
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-gray-400"
            />
            <Combobox.Input
              ref={field.ref}
              name={name}
              onBlur={field.onBlur}
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 disabled:cursor-not-allowed"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              placeholder={
                kind === 'province'
                  ? 'جست‌وجو و انتخاب استان'
                  : 'جست‌وجو و انتخاب شهر'
              }
              displayValue={() => (other ? 'سایر' : selected?.label || '')}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="نمایش گزینه‌ها"
            >
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute inset-x-0 top-full z-[1200] mt-2 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-0 p-1.5 shadow-xl focus:outline-none">
            {!filtered.length && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500">
                <Search aria-hidden="true" className="h-4 w-4" />
                موردی پیدا نشد؛ می‌توانید «سایر» را انتخاب کنید.
              </div>
            )}
            {filtered.map((option) => (
              <Combobox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm',
                    active && 'bg-primary/5 text-primary'
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span>{option.label}</span>
                    {selected && (
                      <Check
                        aria-hidden="true"
                        className="h-4 w-4 text-primary"
                      />
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
            <Combobox.Option
              value={OTHER_LOCATION}
              className={({ active }) =>
                cn(
                  'mt-1 flex cursor-pointer items-center justify-between rounded-lg border-t border-gray-100 px-3 py-2.5 text-sm font-medium',
                  active && 'bg-primary/5 text-primary'
                )
              }
            >
              <span>سایر</span>
              <span className="text-xs font-normal text-gray-500">
                ورود نام دلخواه
              </span>
            </Combobox.Option>
          </Combobox.Options>
        </div>
      </Combobox>
      {other && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
          <Input
            label={
              kind === 'province' ? 'نام استان موردنظر' : 'نام شهر موردنظر'
            }
            value={value}
            placeholder="نام را وارد کنید"
            required
            disabled={disabled}
            onBlur={field.onBlur}
            inputClassName="bg-gray-0"
            labelClassName="text-xs text-gray-600"
            onChange={(event) => {
              lastEdit.current = event.target.value;
              field.onChange(event.target.value);
            }}
          />
        </div>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red">
          {error}
        </p>
      )}
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}
