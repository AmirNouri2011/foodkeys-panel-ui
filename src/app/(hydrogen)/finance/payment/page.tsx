'use client';

import PaymentTransactionsTable from '@/app/shared/finance/payment/payment-list/payment-history';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function PaymentListPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <PaymentTransactionsTable />
    </QueryClientProvider>
  );
}
