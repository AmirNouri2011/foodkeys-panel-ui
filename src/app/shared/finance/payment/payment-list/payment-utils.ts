export type Payment = {
  id?: string | number;
  createdAtStr?: string;
  createdAtTimeStr?: string;
  amount?: number | string;
  description?: string;
  paymentStatus?: string;
  paymentStatusColor?: string;
  refId?: string | number;
};

export type Status = 'all' | 'success' | 'failed' | 'other';
export type Sort = 'newest' | 'oldest' | 'highest' | 'lowest';

export const normalizeText = (value: unknown) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[,٬]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200e\u200f]/g, '')
    .trim()
    .toLowerCase();

export const paymentAmount = (payment: Payment) => {
  if (
    payment.amount === undefined ||
    payment.amount === null ||
    payment.amount === ''
  )
    return null;
  const amount = Number(normalizeText(payment.amount).replace(/[,٬\s]/g, ''));
  return Number.isFinite(amount) ? amount : null;
};

export const formatNumber = (value: number) => value.toLocaleString('fa-IR');

export function getStatus(payment: Payment): Exclude<Status, 'all'> {
  const status = normalizeText(payment.paymentStatus);
  if (
    ['failed', 'failure', 'cancelled', 'canceled', 'rejected'].includes(
      status
    ) ||
    /ناموفق|لغو|رد شده/.test(status)
  )
    return 'failed';
  if (
    ['success', 'successful', 'paid', 'completed'].includes(status) ||
    /موفق|پرداخت شده/.test(status)
  )
    return 'success';
  return 'other';
}

export function filterPayments(
  payments: Payment[],
  search: string,
  status: Status,
  sort: Sort
) {
  const words = normalizeText(search).split(/\s+/).filter(Boolean);
  const filtered = payments.filter((payment) => {
    const text = normalizeText(
      [
        payment.refId,
        payment.description,
        payment.createdAtStr,
        payment.amount,
        payment.paymentStatus,
      ].join(' ')
    );
    return (
      (status === 'all' || getStatus(payment) === status) &&
      words.every((word) => text.includes(word))
    );
  });
  // The endpoint returns newest first; retain that order without parsing Persian display dates.
  if (sort === 'oldest') return filtered.reverse();
  if (sort === 'highest' || sort === 'lowest') {
    return filtered.sort((a, b) => {
      const left = paymentAmount(a);
      const right = paymentAmount(b);
      if (left === null) return right === null ? 0 : 1;
      if (right === null) return -1;
      return sort === 'highest' ? right - left : left - right;
    });
  }
  return filtered;
}

export function paymentsCsv(payments: Payment[]) {
  const escape = (value: unknown) => {
    const text = String(value ?? '');
    // Spreadsheet programs must treat descriptions and references as text, not formulas.
    const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return (
    '\uFEFF' +
    [
      ['تاریخ', 'ساعت', 'مبلغ (تومان)', 'توضیحات', 'وضعیت', 'کد ارجاع'],
      ...payments.map((payment) => [
        payment.createdAtStr,
        payment.createdAtTimeStr,
        paymentAmount(payment),
        payment.description,
        payment.paymentStatus,
        payment.refId,
      ]),
    ]
      .map((row) => row.map(escape).join(','))
      .join('\r\n')
  );
}
