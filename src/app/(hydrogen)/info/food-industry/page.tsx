'use client';

import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CompaniesTable from '@/app/shared/info/food-industry/company/company-list/table';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const pageHeader = {
  title: 'شرکت‌های من',
  breadcrumb: [
    {
      href: routes.info.dashboard,
      name: 'مدیریت اطلاعات',
    },
    {
      href: routes.info.foodIndustryList,
      name: 'بانک صنعت غذا',
    },
    {
      name: 'لیست',
    },
  ],
};

export default function FoodIndustryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <CompaniesTable category={1} />
    </QueryClientProvider>
  );
}
