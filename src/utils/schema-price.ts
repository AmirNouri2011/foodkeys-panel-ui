import { numberToWords } from '@persian-tools/persian-tools';

export function normalizePriceInput(value: string): string | null {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[,،٬\s]/g, '');
  return /^\d*$/.test(normalized) ? normalized.replace(/^0+(?=\d)/, '') : null;
}

export function formatPriceInput(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  const normalized = normalizePriceInput(String(value));
  return normalized === null
    ? String(value)
    : normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function currencyLabel(currency: string): string {
  const labels: Record<string, string> = {
    IRR: 'ریال',
    IRT: 'تومان',
    TOMAN: 'تومان',
    USD: 'دلار',
    EUR: 'یورو',
    AED: 'درهم',
  };
  return labels[currency.toUpperCase()] || currency;
}

export function priceInWords(value: unknown, currency: string): string {
  if (value === undefined || value === null || value === '') return '';
  const normalized = normalizePriceInput(String(value));
  if (normalized === null || normalized === '') return '';
  const amount = Number(normalized);
  if (!Number.isSafeInteger(amount)) return '';
  return `${String(numberToWords(amount))} ${currencyLabel(currency)}`;
}

export function priceDisplayEquivalent(
  value: unknown,
  currency: string,
  displayCurrency?: string
): string {
  if (!displayCurrency || value === '' || value === null || value === undefined)
    return '';
  const normalized = normalizePriceInput(String(value));
  if (!normalized || !Number.isSafeInteger(Number(normalized))) return '';
  const label = currencyLabel(displayCurrency);
  if (label === currencyLabel(currency)) return '';
  // Values in the form and API always use the schema's base currency.
  const isRial = currency.toUpperCase() === 'IRR' || currency === 'ریال';
  const isToman = currencyLabel(currency) === 'تومان';
  const amount = Number(normalized);
  const converted =
    isRial && label === 'تومان'
      ? amount / 10
      : isToman && label === 'ریال'
      ? amount * 10
      : null;
  if (converted === null) return '';
  return `معادل ${converted.toLocaleString('fa-IR', {
    maximumFractionDigits: 1,
  })} ${label}`;
}
