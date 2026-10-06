import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { PiPlusBold } from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import CreateCompany from '@/app/shared/info/food-industry/company/create';

const pageHeader = {
  title: ' بانک صنعت غذا - ثبت شرکت جدید',
  breadcrumb: [
    {
      href: routes.info.dashboard,
      name: 'مدیریت اطلاعات',
    },
    {
      href: routes.info.foodIndustryList,
      name: 'بانک صنعت غذا',
    },
    // {
    //   href: routes.info.foodIndustryList,
    //   name: 'لیست شرکت‌ها',
    // },
    {
      href: routes.info.foodIndustryAdd,
      name: 'ثبت شرکت جدید',
    },
    // {
    //   name: params.id,
    // },
  ],
};

export default function CreateCompanyPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <Link
          href={routes.info.foodIndustryAdd}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button
            tag="span"
            className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
          >
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            ثبت شرکت جدید
          </Button>
        </Link> */}
      </PageHeader>

      <CreateCompany category={1} />
    </>
  );
}
