'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { Control, RegisterOptions, useController, useWatch } from 'react-hook-form';
import { Check, ChevronDown, MapPin, X } from 'lucide-react';
import cn from '@/utils/class-names';
import {
  getCityOptions,
  isLocationPlaceholder,
  LocationKind,
  locationSelections,
  normalizeLocationName,
  provinceOptions,
} from '@/utils/iran-locations';

type Props = {
  name: string;
  control: Control<any>;
  kind: LocationKind;
  label?: string;
  description?: string;
  disabled?: boolean;
  provinceFieldName?: string;
  requireOneOf?: string[];
  maxItems?: number;
  rules?: RegisterOptions;
};

export default function SchemaLocationMultiField({
  name, control, kind, label, description, disabled,
  provinceFieldName, requireOneOf = [], maxItems, rules,
}: Props) {
  const id = useId();
  const [query, setQuery] = useState('');
  const province = useWatch({ control, name: provinceFieldName || name });
  const groupValues = useWatch({ control, name: requireOneOf.length ? requireOneOf : [name] });
  const options = useMemo(() => kind === 'province' ? provinceOptions :
    getCityOptions(provinceFieldName ? province : undefined), [kind, province, provinceFieldName]);
  const { field, fieldState } = useController({
    name, control, defaultValue: [],
    rules: {
      ...rules,
      deps: requireOneOf.filter((key) => key !== name),
      validate: {
        ...(typeof rules?.validate === 'object' ? rules.validate : {}),
        coverage: (value) => !requireOneOf.length || locationSelections(value).length > 0 ||
          groupValues.some((item, index) => requireOneOf[index] !== name && locationSelections(item).length > 0) ||
          'حداقل یک استان یا شهر انتخاب کنید',
        limit: (value) => maxItems === undefined || locationSelections(value).length <= maxItems ||
          `حداکثر ${maxItems} مورد مجاز است`,
        validLocation: (value) => !Array.isArray(value) || !value.some(isLocationPlaceholder) ||
          'نام شهر یا استان را وارد کنید',
      },
    },
  });
  const selected = locationSelections(field.value);
  const storedValue = field.value;
  const onChange = field.onChange;
  useEffect(() => {
    // Preserve single values from records created before the schema used arrays.
    if (typeof storedValue === 'string') onChange(locationSelections(storedValue));
  }, [storedValue, onChange]);
  const search = normalizeLocationName(query);
  const filtered = options.filter((option) => normalizeLocationName(option.label).includes(search));
  const customName = query.trim();
  const canAddCustom = search && !isLocationPlaceholder(customName) &&
    !options.some((option) => normalizeLocationName(option.value) === search) &&
    !selected.some((item) => normalizeLocationName(item) === search);
  const error = fieldState.error?.message;
  const atLimit = maxItems !== undefined && selected.length >= maxItems;
  const change = (values: string[]) => {
    const next = locationSelections(values);
    if (maxItems !== undefined && next.length > maxItems) return;
    field.onChange(next);
    field.onBlur();
    setQuery('');
  };

  return (
    <div className="min-w-0 space-y-2.5" dir="rtl" id={`field-${name}`}>
      <Combobox multiple value={selected} onChange={change} disabled={disabled}>
        {label && <Combobox.Label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</Combobox.Label>}
        <div className="relative">
          <div className={cn('flex h-11 items-center gap-2 rounded-xl border bg-gray-0 px-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20', error ? 'border-red' : 'border-gray-300', disabled && 'opacity-70')}>
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400" />
            <Combobox.Input ref={field.ref} name={name} onBlur={field.onBlur}
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
              aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : `${id}-help`}
              placeholder={kind === 'province' ? 'جست‌وجو و انتخاب چند استان' : 'جست‌وجو و انتخاب چند شهر'}
              value={query} displayValue={() => query} onChange={(event) => setQuery(event.target.value)} />
            <Combobox.Button disabled={!search || disabled} aria-label="نمایش گزینه‌ها" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-default disabled:opacity-40">
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            </Combobox.Button>
          </div>
          {search && <Combobox.Options className="absolute inset-x-0 top-full z-[1200] mt-2 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-0 p-1.5 shadow-xl focus:outline-none">
            {!filtered.length && !canAddCustom && <p className="px-3 py-3 text-xs text-gray-500">موردی پیدا نشد.</p>}
            {filtered.map((option) => (
              <Combobox.Option key={option.value} value={option.value}
                disabled={atLimit && !selected.includes(option.value)}
                className={({ active, disabled }) => cn('flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm', active && 'bg-primary/5 text-primary', disabled && 'opacity-40')}>
                {({ selected }) => <><span>{option.label}</span>{selected && <Check aria-hidden="true" className="h-4 w-4 text-primary" />}</>}
              </Combobox.Option>
            ))}
            {canAddCustom && <Combobox.Option value={customName} disabled={atLimit}
              className={({ active }) => cn('cursor-pointer rounded-lg border-t border-gray-100 px-3 py-2.5 text-sm', active && 'bg-primary/5 text-primary')}>
              افزودن «{customName}»
            </Combobox.Option>}
          </Combobox.Options>}
        </div>
      </Combobox>
      {selected.length > 0 && <div className="flex flex-wrap gap-2" aria-label="موارد انتخاب‌شده">
        {selected.map((item) => <span key={normalizeLocationName(item)} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm">
          {item}<button type="button" disabled={disabled} aria-label={`حذف ${item}`} onClick={() => change(selected.filter((value) => value !== item))} className="rounded-full p-0.5 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary">
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </span>)}
      </div>}
      <p id={`${id}-help`} className="text-xs text-gray-500">{description || 'می‌توانید چند مورد انتخاب کنید؛ اگر نامی در لیست نیست، آن را جست‌وجو و اضافه کنید.'}</p>
      {maxItems !== undefined && <p className="text-xs text-gray-500">حداکثر {maxItems} مورد</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red">{error}</p>}
    </div>
  );
}
