'use client';

import PageHeader from '@/app/shared/page-header';
import PaymentTransactionsTable from '@/app/shared/finance/payment/payment-list/payment-history';
import { routes } from '@/config/routes';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const pageHeader = {
  title: 'تاریخچه پرداخت‌ها',
  breadcrumb: [
    { href: routes.finance.dashboard, name: 'مدیریت مالی' },
    { href: routes.finance.paymentList, name: 'پرداخت‌ها' },
  ],
};

export default function PaymentListPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <PaymentTransactionsTable />
    </QueryClientProvider>
  );
}
