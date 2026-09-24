'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  Building2,
  ExternalLink,
  MessageSquarePlus,
  Pencil,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react';
import {
  API_BASE_URL,
  CLIENT_WEBSITE_URL,
  STATIC_FILES_URL,
} from '@/config/api.config';
import { routes } from '@/config/routes';
import axiosInstance from '@/utils/axios-instance';
import TablePagination from '@/components/controlled-table/table-pagination';
import RevisionDialog from './revision-dialog';
import styles from './company-list.module.css';

type Company = {
  id: number;
  companyName: string;
  logo?: string | null;
  createdAtStr?: string | null;
  subCategory?: string | null;
  subCategoryId?: number | null;
  subCategoryNameEn?: string | null;
  companyStatus?: string | null;
  visit?: number | null;
  ranking?: number | null;
  rankingAll?: number | null;
};

const statusLabels: Record<string, string> = {
  PENDING: 'در انتظار تایید',
  VERIFIED: 'تایید شده',
  DENIED: 'رد شده',
  ARCHIVED: 'آرشیو شده',
  DELETED: 'حذف شده',
  UPDATED: 'به‌روزرسانی شده',
  PUBLISHED: 'منتشر شده',
  REVISION: 'درخواست بازبینی',
  REQUIRE_PAYMENT: 'در انتظار پرداخت',
  PAYMENT_REQUIRED: 'در انتظار پرداخت',
  SUBSCRIPTION_EXPIRED: 'اشتراک منقضی شده',
  SUBMIT: 'ثبت شده',
};
const paymentStatuses = new Set([
  'PAYMENT_REQUIRED',
  'SUBSCRIPTION_EXPIRED',
  'REQUIRE_PAYMENT',
]);
const numberFormatter = new Intl.NumberFormat('fa-IR');

function statusClass(status?: string | null) {
  if (status === 'PUBLISHED') return styles.published;
  if (status === 'VERIFIED' || status === 'SUBMIT') return styles.approved;
  if (status === 'DENIED' || status === 'ARCHIVED' || status === 'DELETED')
    return styles.rejected;
  if (status === 'PENDING' || paymentStatuses.has(status || ''))
    return styles.pending;
  return styles.neutral;
}

async function fetchCompanies(
  query: string,
  page: number,
  size: number,
  category: number
): Promise<{ data: Company[]; totalItems: number }> {
  const params = new URLSearchParams(
    query
      ? { query, page: String(page), size: String(size) }
      : { pageNumber: String(page), pageSize: String(size) }
  );
  params.set('categoryId', String(category));
  const endpoint = query ? '/search/company' : '/company/';
  const response = await axiosInstance.get(
    `${API_BASE_URL}${endpoint}?${params}`
  );
  if (response.data.statusCode !== 200)
    throw new Error('Failed to fetch companies');
  return {
    data: response.data.data ?? [],
    totalItems: response.data.pagination?.totalElements ?? 0,
  };
}

export default function CompaniesTable({
  category,
  defaultPageSize = 10,
}: {
  category: number;
  defaultPageSize?: number;
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['companies', category, searchTerm, currentPage, pageSize],
    () => fetchCompanies(searchTerm, currentPage, pageSize, category),
    { keepPreviousData: true }
  );

  const companies = data?.data ?? [];
  const total = data?.totalItems ?? 0;
  const addHref =
    category === 1
      ? routes.info.foodIndustryAdd
      : routes.info.agricultureIndustryAdd;

  return (
    <section dir="rtl" aria-label="فهرست شرکت‌ها" className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <h2>فهرست شرکت‌ها</h2>
          <span>{numberFormatter.format(total)} شرکت ثبت‌شده</span>
        </div>
        <div className={styles.toolbarActions}>
          <label className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="جست‌وجوی نام شرکت"
              aria-label="جست‌وجوی نام شرکت"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                aria-label="پاک کردن جست‌وجو"
              >
                <X size={16} />
              </button>
            )}
          </label>
          <Link href={addHref} className={styles.addLink}>
            <Plus size={16} /> ثبت شرکت جدید
          </Link>
        </div>
      </div>

      {isError ? (
        <div className={styles.message}>
          <p>دریافت اطلاعات شرکت‌ها با مشکل مواجه شد.</p>
          <button type="button" onClick={() => refetch()}>
            تلاش دوباره
          </button>
        </div>
      ) : isLoading ? (
        <div className={styles.message} role="status">
          در حال دریافت شرکت‌ها...
        </div>
      ) : companies.length === 0 ? (
        <div className={styles.message}>
          <Building2 size={32} aria-hidden="true" />
          <p>
            {searchTerm
              ? 'شرکتی با این نام پیدا نشد.'
              : 'هنوز شرکتی ثبت نکرده‌اید.'}
          </p>
          {searchTerm && (
            <button type="button" onClick={() => setInputValue('')}>
              پاک کردن جست‌وجو
            </button>
          )}
        </div>
      ) : (
        <>
          <p className={styles.scrollHint}>
            برای دیدن سایر ستون‌ها، جدول را به طرفین بکشید.
          </p>
          <div
            className={styles.scrollArea}
            role="region"
            aria-label="جدول شرکت‌ها"
            tabIndex={0}
          >
            <table className={styles.table}>
              <colgroup>
                <col className={styles.companyCol} />
                <col className={styles.categoryCol} />
                <col className={styles.statusCol} />
                <col className={styles.visitsCol} />
                <col className={styles.rankCol} />
                <col className={styles.actionsCol} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">شرکت</th>
                  <th scope="col">دسته‌بندی</th>
                  <th scope="col">وضعیت</th>
                  <th scope="col">بازدید</th>
                  <th scope="col">رتبه</th>
                  <th scope="col">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const publicHref = company.subCategoryNameEn
                    ? `${CLIENT_WEBSITE_URL}/view/${encodeURIComponent(
                        company.subCategoryNameEn
                      )}/details?id=${company.id}`
                    : null;
                  const canView =
                    company.companyStatus === 'PUBLISHED' &&
                    Boolean(publicHref);
                  const viewUnavailableReason =
                    company.companyStatus !== 'PUBLISHED'
                      ? 'شرکت شما بعد از انتشار قابل مشاهده خواهد بود'
                      : 'آدرس صفحه اختصاصی هنوز ثبت نشده است';
                  const editHref =
                    category === 1
                      ? routes.info.foodIndustryEdit(company.id)
                      : routes.info.agricultureIndustryEdit(company.id);
                  return (
                    <tr key={company.id}>
                      <td>
                        <div className={styles.companyCell}>
                          <div className={styles.logo}>
                            {company.logo ? (
                              <Image
                                src={`${STATIC_FILES_URL}${company.logo}`}
                                alt={`لوگوی ${company.companyName}`}
                                width={80}
                                height={80}
                                unoptimized
                                className={styles.logoImage}
                              />
                            ) : (
                              <Building2 size={28} aria-hidden="true" />
                            )}
                          </div>
                          <div className={styles.companyText}>
                            <strong>{company.companyName}</strong>
                            <span>
                              تاریخ ثبت: {company.createdAtStr || '—'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.category}>
                          {company.subCategory || '—'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <span
                            className={`${styles.status} ${statusClass(
                              company.companyStatus
                            )}`}
                          >
                            <span className={styles.statusDot} />
                            {statusLabels[company.companyStatus || ''] ||
                              'وضعیت نامشخص'}
                          </span>
                          {paymentStatuses.has(company.companyStatus || '') &&
                            company.subCategoryId && (
                              <Link
                                href={routes.bundle(company.subCategoryId)}
                                className={styles.paymentLink}
                              >
                                خرید اشتراک
                              </Link>
                            )}
                        </div>
                      </td>
                      <td className={styles.numberCell}>
                        {numberFormatter.format(company.visit ?? 0)}
                      </td>
                      <td className={styles.numberCell}>
                        <span className={styles.rank}>
                          <Star size={15} aria-hidden="true" />
                          {company.ranking || company.rankingAll
                            ? `${numberFormatter.format(
                                company.ranking ?? 0
                              )} / ${numberFormatter.format(
                                company.rankingAll ?? 0
                              )}`
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          {canView && publicHref ? (
                            <a
                              href={publicHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.viewAction}
                            >
                              <ExternalLink size={16} /> مشاهده صفحه اختصاصی
                            </a>
                          ) : (
                            <span
                              className={styles.disabledView}
                              tabIndex={0}
                              role="button"
                              aria-disabled="true"
                              aria-label={`مشاهده صفحه اختصاصی: ${viewUnavailableReason}`}
                            >
                              <button
                                type="button"
                                disabled
                                className={styles.viewAction}
                              >
                                <ExternalLink size={16} /> مشاهده صفحه اختصاصی
                              </button>
                              <span
                                className={styles.viewTooltip}
                                role="tooltip"
                              >
                                {viewUnavailableReason}
                              </span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCompany(company)}
                            title="مشاهده سوابق و ثبت درخواست تجدید رتبه"
                            className={styles.revisionAction}
                          >
                            <MessageSquarePlus size={16} />
                            درخواست تجدید رتبه
                          </button>
                          <Link href={editHref} className={styles.editAction}>
                            <Pencil size={16} /> ویرایش
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isFetching && (
            <p className={styles.updating} role="status">
              در حال به‌روزرسانی...
            </p>
          )}
          {total > pageSize && (
            <TablePagination
              pageSize={pageSize}
              setPageSize={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              total={total}
              current={currentPage}
              onChange={setCurrentPage}
              paginatorClassName={styles.pagination}
            />
          )}
        </>
      )}
      <RevisionDialog
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onUpdated={() => refetch()}
      />
    </section>
  );
}
