'use client';

import { Input } from '@/components/ui/outlined-text-field';
import type { FieldType } from '@/utils/schema-converter';
import {
  currencyLabel,
  formatPriceInput,
  normalizePriceInput,
  priceDisplayEquivalent,
  priceInWords,
} from '@/utils/schema-price';

type Props = {
  field: FieldType;
  label?: string;
  value: unknown;
  onChange: (value: number | string) => void;
  onBlur: () => void;
  inputRef?: (instance: HTMLInputElement | null) => void;
  error?: string;
  disabled?: boolean;
};

export default function SchemaPriceField({
  field,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  disabled,
}: Props) {
  const currency = field.currency || 'IRR';
  const words = priceInWords(value, currency);
  const equivalent = priceDisplayEquivalent(
    value,
    currency,
    field.displayCurrency
  );
  const updateValue = (
    input: HTMLInputElement,
    raw: string,
    position: number
  ) => {
    const normalized = normalizePriceInput(raw);
    if (normalized === null || !Number.isSafeInteger(Number(normalized)))
      return;
    const digitsBeforeCaret = (
      normalizePriceInput(raw.slice(0, position)) || ''
    ).length;
    onChange(
      normalized === ''
        ? ''
        : field.type === 'number'
        ? Number(normalized)
        : normalized
    );
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      let digits = 0;
      let caret = 0;
      while (caret < input.value.length && digits < digitsBeforeCaret) {
        if (/\d/.test(input.value[caret])) digits++;
        caret++;
      }
      input.setSelectionRange(caret, caret);
    });
  };
  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        name={field.name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        label={label}
        placeholder={field.placeholder}
        suffix={
          <span className="whitespace-nowrap text-xs text-gray-500">
            {currencyLabel(currency)}
          </span>
        }
        value={formatPriceInput(value)}
        onChange={(event) => {
          const input = event.target;
          updateValue(
            input,
            input.value,
            input.selectionStart ?? input.value.length
          );
        }}
        onKeyDown={(event) => {
          const input = event.currentTarget;
          const position = input.selectionStart;
          if (
            position === null ||
            position !== input.selectionEnd ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
          )
            return;
          // Deleting beside a separator should remove a digit, not restore the comma.
          if (event.key === 'Backspace' && input.value[position - 1] === ',') {
            event.preventDefault();
            updateValue(
              input,
              input.value.slice(0, position - 2) + input.value.slice(position),
              position - 2
            );
          } else if (event.key === 'Delete' && input.value[position] === ',') {
            event.preventDefault();
            updateValue(
              input,
              input.value.slice(0, position) + input.value.slice(position + 2),
              position
            );
          }
        }}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        helperText={field.description}
      />
      {(words || equivalent) && (
        <div
          className="space-y-1 text-xs leading-6 text-gray-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {words && <p>{words}</p>}
          {equivalent && <p>{equivalent}</p>}
        </div>
      )}
    </div>
  );
}
