export type Transaction = {
  id: string;
  amount: number;
  status: string;
  statusStr?: string;
  serviceName?: string;
  serviceNameFa?: string;
  createdStr?: string;
  createdAtStr?: string;
  createdAtTimeStr?: string;
  createdTimeStr?: string;
  refId?: string;
  billId?: string;
  invoiceId?: string;
  hasBill?: boolean;
  error?: string;
  gatewayName?: string;
  paymentGatewayName?: string;
  gatewayType?: string;
  paymentGateway?: string | { name?: string; nameFa?: string; type?: string };
  gateway?: string | { name?: string; nameFa?: string; type?: string };
};
export function gatewayLabel(row: Transaction): string {
  const gateway = row.paymentGateway ?? row.gateway;
  const value =
    row.paymentGatewayName ||
    row.gatewayName ||
    row.gatewayType ||
    (typeof gateway === 'string'
      ? gateway
      : gateway?.nameFa || gateway?.name || gateway?.type);
  if (!value) return 'ثبت نشده';
  const key = value.toLowerCase().replace(/[\s_‌-]/g, '');
  if (key.includes('zarinpal') || key.includes('زرین')) return 'زرین‌پال';
  if (key.includes('saman') || key === 'sep' || key.includes('سامان'))
    return 'بانک سامان';
  if (
    key.includes('mellat') ||
    key.includes('behpardakht') ||
    key.includes('ملت')
  )
    return 'بانک ملت';
  if (key.includes('wallet') || key.includes('کیفپول')) return 'کیف پول';
  return value;
}
export function transactionStatus(row: Transaction) {
  if (['SUCCESS', 'COMPLETED'].includes(row.status))
    return { label: 'موفق', tone: 'success' };
  if (['FAIL', 'FAILED'].includes(row.status))
    return { label: 'ناموفق', tone: 'failed' };
  if (['IN_PROGRESS', 'PENDING', 'PENDING_REVIEW'].includes(row.status))
    return {
      label:
        row.status === 'PENDING_REVIEW'
          ? 'در انتظار بازبینی'
          : 'در انتظار تأیید',
      tone: 'pending',
    };
  return {
    label:
      row.statusStr || (row.status === 'ARCHIVED' ? 'آرشیو شده' : 'نامشخص'),
    tone: 'neutral',
  };
}
export const numberFa = (value: number) => value.toLocaleString('fa-IR');
export function transactionKind(row: Transaction) {
  const label = (row.serviceNameFa || '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s‌]+/g, '');
  if (row.serviceName === 'BUY_SUBSCRIPTION' || label === 'خریداشتراک')
    return 'subscription';
  if (label === 'افزایشاعتبار') return 'credit';
  if (label === 'کاهشاعتبار') return 'debit';
  return 'unknown';
}

export function transactionAmountLabel(row: Transaction) {
  const kind = transactionKind(row);
  const amount = amountValue(row);
  // A pending or failed request must not look like a confirmed balance change.
  if (transactionStatus(row).tone === 'success' && amount !== 0) {
    if (kind === 'credit') return `+${numberFa(Math.abs(amount))}`;
    if (kind === 'debit') return `−${numberFa(Math.abs(amount))}`;
  }
  return numberFa(amount);
}
export const amountValue = (row: Transaction) =>
  Number.isFinite(Number(row.amount)) ? Number(row.amount) : 0;
export const transactionDate = (row: Transaction) =>
  row.createdStr || row.createdAtStr || '—';
export const transactionTime = (row: Transaction) =>
  row.createdAtTimeStr || row.createdTimeStr || '';
