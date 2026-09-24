'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock3,
  MessageSquarePlus,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { API_BASE_URL } from '@/config/api.config';
import useAxiosPrivate from '@/hooks/use-axios-private';
import styles from './company-list.module.css';

type CompanySummary = {
  id: number;
  companyName: string;
  ranking?: number | null;
  rankingAll?: number | null;
};

type RevisionRequest = {
  requestId: string;
  status: string;
  statusFa?: string | null;
  adminMessage?: string | null;
  createdAt?: string | null;
  createdAtStr?: string | null;
  answeredAtStr?: string | null;
};

type RevisionHistory = {
  companyId: number;
  companyName: string;
  ranking?: number | null;
  rankingAll?: number | null;
  requests?: RevisionRequest[] | null;
};

const numberFormatter = new Intl.NumberFormat('fa-IR');

function requestStatus(request: RevisionRequest) {
  if (request.status === 'PENDING') return 'در انتظار پاسخ';
  if (request.status === 'APPROVED') return 'تایید شده';
  if (request.status === 'REJECTED' || request.status === 'DENIED')
    return 'رد شده';
  return request.statusFa || 'بررسی شده';
}

function requestStyle(status: string) {
  if (status === 'PENDING') return styles.revisionPending;
  if (status === 'APPROVED') return styles.revisionApproved;
  if (status === 'REJECTED' || status === 'DENIED')
    return styles.revisionRejected;
  return styles.revisionOther;
}

export default function RevisionDialog({
  company,
  onClose,
  onUpdated,
}: {
  company: CompanySummary | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const privateAxios = useAxiosPrivate();
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    setJustSubmitted(false);
  }, [company?.id]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery(
    ['company-revision-history', company?.id],
    async (): Promise<RevisionHistory[]> => {
      const response = await privateAxios.get(
        `${API_BASE_URL}/company/revision?companyId=${company!.id}`
      );
      if (response.data.statusCode !== 200) {
        throw new Error('Failed to fetch revision history');
      }
      return response.data.data ?? [];
    },
    { enabled: Boolean(company?.id), refetchOnWindowFocus: false, staleTime: 0 }
  );

  const history =
    data?.find((item) => item.companyId === company?.id) ?? data?.[0];
  const requests = useMemo(
    () =>
      [...(history?.requests ?? [])].sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      ),
    [history?.requests]
  );
  const hasPending = requests.some((request) => request.status === 'PENDING');
  const latest = requests[0];
  const ranking = history?.ranking ?? company?.ranking;
  const rankingAll = history?.rankingAll ?? company?.rankingAll;

  async function submitRequest() {
    if (!company || isLoading || isError || hasPending || justSubmitted) return;
    setSubmitting(true);
    try {
      const response = await privateAxios.post(
        `company/${company.id}/revision/`,
        {}
      );
      if (response.status === 200 && response.data.statusCode === 200) {
        setJustSubmitted(true);
        toast.success(response.data.message || 'درخواست تجدید رتبه ثبت شد');
        await refetch();
        onUpdated();
      } else {
        toast.error(response.data.message || 'خطا در ثبت درخواست تجدید رتبه');
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'خطا در ثبت درخواست تجدید رتبه'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={Boolean(company)}
      onClose={onClose}
      containerClassName={styles.revisionModal}
    >
      <div className={styles.revisionDialog} dir="rtl">
        <div className={styles.revisionHeader}>
          <div className={styles.revisionHeading}>
            <span className={styles.revisionHeadingIcon}>
              <MessageSquarePlus size={21} />
            </span>
            <div>
              <h2>درخواست تجدید رتبه</h2>
              <p>{company?.companyName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره"
            className={styles.revisionClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className={styles.revisionBody}>
          <div className={styles.currentRank}>
            <span>رتبه فعلی شرکت</span>
            <strong>
              {ranking != null || rankingAll != null
                ? `${numberFormatter.format(
                    ranking ?? 0
                  )} از ${numberFormatter.format(rankingAll ?? 0)}`
                : 'ثبت نشده'}
            </strong>
          </div>

          {isLoading ? (
            <div className={styles.revisionMessage} role="status">
              در حال دریافت سوابق درخواست...
            </div>
          ) : isError ? (
            <div className={styles.revisionMessage}>
              <p>
                سوابق درخواست دریافت نشد. برای جلوگیری از ثبت درخواست تکراری،
                ابتدا دوباره تلاش کنید.
              </p>
              <button type="button" onClick={() => refetch()}>
                تلاش دوباره
              </button>
            </div>
          ) : (
            <>
              {hasPending || justSubmitted ? (
                <div className={styles.pendingNotice}>
                  <Clock3 size={18} />
                  <span>
                    درخواست شما ثبت شده و در انتظار پاسخ است. پس از بررسی، نتیجه
                    و پیام مدیر در همین بخش نمایش داده می‌شود.
                  </span>
                </div>
              ) : latest ? (
                <p className={styles.revisionIntro}>
                  آخرین نتیجه و سوابق درخواست‌های شما در ادامه آمده است. در صورت
                  نیاز می‌توانید درخواست تازه‌ای ثبت کنید.
                </p>
              ) : (
                <p className={styles.revisionIntro}>
                  هنوز درخواست تجدید رتبه‌ای برای این شرکت ثبت نشده است.
                </p>
              )}

              {requests.length > 0 && (
                <div className={styles.history}>
                  <h3>
                    سوابق درخواست‌ها{' '}
                    <span>{numberFormatter.format(requests.length)}</span>
                  </h3>
                  <div className={styles.historyList}>
                    {requests.map((request) => (
                      <article
                        key={request.requestId}
                        className={styles.historyItem}
                      >
                        <div className={styles.historyTop}>
                          <span
                            className={`${styles.revisionStatus} ${requestStyle(
                              request.status
                            )}`}
                          >
                            {request.status === 'APPROVED' ? (
                              <CheckCircle2 size={15} />
                            ) : request.status === 'REJECTED' ||
                              request.status === 'DENIED' ? (
                              <XCircle size={15} />
                            ) : (
                              <Clock3 size={15} />
                            )}
                            {requestStatus(request)}
                          </span>
                          <time>
                            {request.createdAtStr ||
                              request.createdAt ||
                              'تاریخ نامشخص'}
                          </time>
                        </div>
                        {request.adminMessage?.trim() && (
                          <div className={styles.adminMessage}>
                            <strong>پیام مدیر</strong>
                            <p>{request.adminMessage}</p>
                          </div>
                        )}
                        {request.answeredAtStr && (
                          <p className={styles.answeredAt}>
                            تاریخ پاسخ: {request.answeredAtStr}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.revisionFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.revisionCancel}
          >
            بستن
          </button>
          <button
            type="button"
            onClick={submitRequest}
            disabled={
              isLoading ||
              isError ||
              isFetching ||
              hasPending ||
              justSubmitted ||
              submitting
            }
            className={styles.revisionSubmit}
          >
            {hasPending || justSubmitted ? (
              <Clock3 size={17} />
            ) : (
              <Send size={17} />
            )}
            {submitting
              ? 'در حال ثبت...'
              : hasPending || justSubmitted
              ? 'در انتظار پاسخ'
              : 'ثبت درخواست جدید'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
