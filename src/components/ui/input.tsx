'use client';

import { forwardRef, type ChangeEvent } from 'react';
import { Input as RizzuiInput, type InputProps } from 'rizzui';
import cn from '@/utils/class-names';

const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const sanitizeNumericValue = (value: string, allowDecimal: boolean) => {
  const normalized = toEnglishDigits(value);

  if (!allowDecimal) return normalized.replace(/\D/g, '');

  const [integer = '', ...fractionParts] = normalized
    .replace(/[^\d.]/g, '')
    .split('.');

  return fractionParts.length
    ? `${integer}.${fractionParts.join('')}`
    : integer;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, inputMode, type, className, inputClassName, ...props }, ref) => {
    const restrictToNumbers =
      inputMode === 'numeric' || inputMode === 'decimal' || type === 'number';

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (restrictToNumbers) {
        const input = event.currentTarget;
        const sanitizedValue = sanitizeNumericValue(
          input.value,
          inputMode === 'decimal'
        );

        if (input.value !== sanitizedValue) input.value = sanitizedValue;
      }

      onChange?.(event);
    };

    return (
      <RizzuiInput
        ref={ref}
        type={type}
        inputMode={inputMode}
        onChange={handleChange}
        {...props}
        className={cn('min-w-0 max-w-full', className)}
        inputClassName={cn('min-w-0', inputClassName)}
      />
    );
  }
);

Input.displayName = 'Input';

export type { InputProps };
