'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import TransactionsTable from '@/app/shared/finance/transaction/transaction-list/table';
export default function TransactionListPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <TransactionsTable />
    </QueryClientProvider>
  );
}
