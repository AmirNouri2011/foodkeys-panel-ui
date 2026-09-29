import type { AxiosInstance } from 'axios';
import { routes } from '@/config/routes';

export interface DashboardSummary {
  companyCount: number | null;
  visitCount: number | null;
  credit: number | null;
}

export interface DashboardCompany {
  id: number;
  key: string;
  kind: 'company' | 'service' | 'other';
  categoryId: number | null;
  categoryLabel: string | null;
  companyName: string;
  logo?: string | null;
  createdAtStr?: string | null;
  subCategory?: string | null;
  subCategoryId?: number | null;
  subCategoryNameEn?: string | null;
  companyStatus?: string | null;
  statusLabel?: string | null;
  hasDetailsPage?: boolean;
  visit?: number | null;
}

export interface DashboardSubscription {
  id?: number | string;
  bundleTitle?: string;
  subscriptionStatus?: string;
  endDateStr?: string;
  subCategoryName?: string;
  subCategoryId?: number | string;
}

export const faNumber = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value);

export function finiteCount(value: unknown): number | null {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    String(value).trim() === ''
  )
    return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function requireSuccess(body: { status?: string; statusCode?: number }) {
  if (
    (body.status && body.status !== 'SUCCESS') ||
    (body.statusCode && body.statusCode !== 200)
  ) {
    throw new Error('Dashboard request failed');
  }
}

export async function fetchSummary(
  client: AxiosInstance,
  signal?: AbortSignal
): Promise<DashboardSummary> {
  const { data: body } = await client.get('/dashboard', {
    signal,
    timeout: 15000,
  });
  requireSuccess(body);
  if (!body.data || typeof body.data !== 'object')
    throw new Error('Invalid dashboard response');
  return {
    companyCount: finiteCount(body.data.companyCount),
    visitCount: finiteCount(body.data.visitCount),
    credit: finiteCount(body.data.credit),
  };
}

export async function fetchDashboardCompanies(
  client: AxiosInstance,
  page: number,
  pageSize: number,
  search: string,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(pageSize),
  });
  if (search.trim()) params.set('query', search.trim());
  const { data: body } = await client.get(`/company/all?${params}`, {
    signal,
    timeout: 15000,
  });
  requireSuccess(body);
  if (!Array.isArray(body.data)) throw new Error('Invalid company response');
  return {
    items: body.data
      .map(normalizeBusiness)
      .filter(
        (item: DashboardCompany | null): item is DashboardCompany =>
          item !== null
      ) as DashboardCompany[],
    total: finiteCount(body.pagination?.totalElements) ?? body.data.length,
    pages: Math.max(1, finiteCount(body.pagination?.totalPages) ?? 1),
  };
}

export function normalizeBusiness(
  raw: Record<string, unknown>
): DashboardCompany | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = finiteCount(raw.id ?? raw.companyId ?? raw.serviceId);
  if (id === null) return null;
  const categoryId = finiteCount(raw.categoryId);
  const type = String(
    raw.type ?? raw.entityType ?? raw.recordType ?? ''
  ).toLowerCase();
  const kind =
    type.includes('service') || categoryId === 4 || raw.serviceId != null
      ? 'service'
      : type.includes('company') || categoryId === 1 || categoryId === 2
      ? 'company'
      : 'other';
  const string = (value: unknown) => (typeof value === 'string' ? value : null);
  return {
    id,
    categoryId,
    kind,
    categoryLabel: string(raw.category),
    key: `${kind}:${categoryId ?? 'unknown'}:${id}`,
    companyName:
      string(raw.companyName ?? raw.name ?? raw.title) || 'بدون عنوان',
    logo: string(raw.logo ?? raw.avatar),
    createdAtStr: string(raw.createdAtStr),
    subCategory: string(
      raw.subCategory ?? raw.subCategoryName ?? raw.subCategoryDisplayName
    ),
    subCategoryId: finiteCount(raw.subCategoryId),
    subCategoryNameEn: string(raw.subCategoryEn ?? raw.subCategoryNameEn),
    companyStatus: string(raw.companyStatus ?? raw.status ?? raw.serviceStatus),
    statusLabel: string(raw.statusFa),
    hasDetailsPage: raw.hasDetailsPage === true,
    visit: finiteCount(raw.visit ?? raw.visitCount),
  };
}

export function businessKindLabel(item: DashboardCompany) {
  return item.kind === 'service'
    ? 'خدمت و آگهی'
    : item.kind === 'company'
    ? 'شرکت'
    : 'کسب‌وکار';
}

export function businessEditHref(item: DashboardCompany): string | null {
  if (item.kind === 'service' && item.subCategoryNameEn)
    return routes.info.serviceIndustryEdit(
      encodeURIComponent(item.subCategoryNameEn),
      item.id
    );
  if (item.categoryId === 2)
    return routes.info.agricultureIndustryEdit(item.id);
  if (item.categoryId === 1) return routes.info.foodIndustryEdit(item.id);
  return null;
}

export function normalizeSearch(value: string) {
  return value
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200d]/g, ' ')
    .trim()
    .toLocaleLowerCase('fa-IR');
}

export async function fetchDashboardSubscriptions(
  client: AxiosInstance,
  signal?: AbortSignal
): Promise<DashboardSubscription[]> {
  const { data: body } = await client.get('/subscription', {
    signal,
    timeout: 15000,
  });
  requireSuccess(body);
  if (!Array.isArray(body.data))
    throw new Error('Invalid subscription response');
  return body.data;
}

export const paymentStatuses = new Set([
  'PAYMENT_REQUIRED',
  'REQUIRE_PAYMENT',
  'SUBSCRIPTION_EXPIRED',
]);
export const companyStatuses: Record<
  string,
  { label: string; tone: 'green' | 'amber' | 'red' | 'neutral' }
> = {
  PUBLISHED: { label: 'منتشر شده', tone: 'green' },
  VERIFIED: { label: 'تأیید شده', tone: 'green' },
  PENDING: { label: 'در انتظار تأیید', tone: 'amber' },
  REVISION: { label: 'درخواست بازبینی', tone: 'amber' },
  DENIED: { label: 'نیازمند اصلاح', tone: 'red' },
  REQUIRE_PAYMENT: { label: 'نیازمند پرداخت', tone: 'amber' },
  PAYMENT_REQUIRED: { label: 'نیازمند پرداخت', tone: 'amber' },
  SUBSCRIPTION_EXPIRED: { label: 'اشتراک منقضی', tone: 'red' },
  ARCHIVED: { label: 'آرشیو شده', tone: 'neutral' },
  DELETED: { label: 'حذف شده', tone: 'neutral' },
  UPDATED: { label: 'به‌روزرسانی شده', tone: 'neutral' },
  SUBMIT: { label: 'ثبت شده', tone: 'neutral' },
};

export function csvCell(value: unknown) {
  const text = String(value ?? '');
  // Prevent spreadsheet formulas from executing in user-supplied company names.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function companiesCsv(companies: DashboardCompany[]) {
  return (
    '\uFEFF' +
    [
      ['نام کسب‌وکار یا خدمت', 'نوع', 'حوزه فعالیت', 'دسته‌بندی', 'وضعیت'],
      ...companies.map((company) => [
        company.companyName,
        businessKindLabel(company),
        company.categoryLabel,
        company.subCategory,
        companyStatuses[company.companyStatus || '']?.label ||
          company.statusLabel ||
          'نامشخص',
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')
  );
}
