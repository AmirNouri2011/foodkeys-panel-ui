// 'use client';
//
// import Link from 'next/link';
// import { Fragment, useState } from 'react';
// import { usePathname } from 'next/navigation';
// import { Text } from '@/components/ui/text';
// import { Collapse } from '@/components/ui/collapse';
// import cn from '@/utils/class-names';
// import { PiCaretDownBold } from 'react-icons/pi';
// import SimpleBar from '@/components/ui/simplebar';
// import { menuItems } from './menu-items';
// import Logo from '@/components/logo';
//
// export default function Sidebar({ className }: { className?: string }) {
//   // const [menuItems, setMenuItems] = useState([])
//   const pathname = usePathname();
//   // useEffect(() => {
//   //   const getMenuItems = async () => {}
//   //   if (!)
//
//   // }, []);
//   return (
//     <aside
//       className={cn(
//         'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 print:hidden 2xl:w-72',
//         className
//       )}
//     >
//       <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
//         <Link
//           href={'/'}
//           className="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap"
//         >
//           <Logo className="max-w-[155px]" />
//           <h2 className="text-sm font-black">
//             مرجع صنایع غذایی و کشاورزی ایران
//           </h2>
//         </Link>
//       </div>
//
//       <SimpleBar className="h-[calc(100%-80px)]">
//         <div className="mt-4 pb-3 3xl:mt-6">
//           {menuItems.map((item, index) => {
//             const isActive = pathname === (item?.href as string);
//             const pathnameExistInDropdowns: any = item?.dropdownItems?.filter(
//               (dropdownItem) => dropdownItem.href === pathname
//             );
//             const isDropdownOpen = Boolean(pathnameExistInDropdowns?.length);
//
//             return (
//               <Fragment key={item.name + '-' + index}>
//                 {item?.href ? (
//                   <>
//                     {item?.dropdownItems ? (
//                       <Collapse
//                         defaultOpen={isDropdownOpen}
//                         header={({ open: collapseOpen, toggle }) => (
//                           <div
//                             onClick={toggle}
//                             className={cn(
//                               'group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2',
//                               isDropdownOpen
//                                 ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
//                                 : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700'
//                             )}
//                           >
//                             <span className="flex items-center">
//                               {item?.icon && (
//                                 <span
//                                   className={cn(
//                                     'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[19px] [&>svg]:w-[19px]',
//                                     isDropdownOpen
//                                       ? 'text-primary'
//                                       : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
//                                   )}
//                                 >
//                                   {item?.icon}
//                                 </span>
//                               )}
//                               {item.name}
//                             </span>
//
//                             <PiCaretDownBold
//                               strokeWidth={3}
//                               className={
//                                 collapseOpen
//                                   ? 'h-3.5 w-3.5 rotate-0 text-gray-500 transition-transform duration-200'
//                                   : 'h-3.5 w-3.5 rotate-90 text-gray-500 transition-transform duration-200'
//                               }
//                             />
//                           </div>
//                         )}
//                       >
//                         {item?.dropdownItems?.map((dropdownItem, index) => {
//                           const isChildActive =
//                             pathname === (dropdownItem?.href as string);
//
//                           return (
//                             <Link
//                               href={dropdownItem?.href}
//                               key={dropdownItem?.name + index}
//                               className={cn(
//                                 'mx-3.5 mb-0.5 flex items-center rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5',
//                                 isChildActive
//                                   ? 'text-gray-900'
//                                   : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900'
//                               )}
//                             >
//                               <span
//                                 className={cn(
//                                   'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
//                                   isChildActive
//                                     ? 'bg-primary ring-[1px] ring-primary'
//                                     : 'opacity-40'
//                                 )}
//                               />{' '}
//                               {dropdownItem?.name}
//                             </Link>
//                           );
//                         })}
//                       </Collapse>
//                     ) : (
//                       <Link
//                         href={item?.href}
//                         className={cn(
//                           'group relative mx-3 my-0.5 flex items-center rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
//                           isActive
//                             ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
//                             : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
//                         )}
//                       >
//                         {item?.icon && (
//                           <span
//                             className={cn(
//                               'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[19px] [&>svg]:w-[19px]',
//                               isActive
//                                 ? 'text-primary'
//                                 : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
//                             )}
//                           >
//                             {item?.icon}
//                           </span>
//                         )}
//                         {item.name}
//                       </Link>
//                     )}
//                   </>
//                 ) : (
//                   <Text
//                     tag="h6"
//                     className={cn(
//                       'mb-2 truncate px-6 text-[11px] font-medium uppercase text-gray-500 dark:text-gray-500 2xl:px-8',
//                       index !== 0 && 'mt-6 3xl:mt-7'
//                     )}
//                   >
//                     {item.name}
//                   </Text>
//                 )}
//               </Fragment>
//             );
//           })}
//         </div>
//       </SimpleBar>
//     </aside>
//   );
// }

'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Text } from '@/components/ui/text';
import { Collapse } from '@/components/ui/collapse';
import cn from '@/utils/class-names';
import SimpleBar from '@/components/ui/simplebar';
import Logo from '@/components/logo';
import { useServiceSubcategories } from '@/hooks/use-service-subcategories';
import { routes } from '@/config/routes';
import {
  PiWarehouseDuotone,
  PiOrangeDuotone,
  PiPlantDuotone,
  PiTractorDuotone,
  PiMonitorPlayDuotone,
  PiHeadsetDuotone,
  PiMailboxDuotone,
  PiChatCenteredTextDuotone,
  PiContactlessPayment,
  PiCurrencyDollarDuotone,
  PiUserCircleDuotone,
  PiCreditCardDuotone,
  PiListNumbersDuotone,
  PiCaretDownBold,
  PiTable,
} from 'react-icons/pi';
import { AiTwotoneHome } from 'react-icons/ai';
import { DUMMY_ID } from '@/config/constants';

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { subcategories } = useServiceSubcategories();
  const [dynamicMenuItems, setDynamicMenuItems] = useState<any[]>([]);

  // Generate dynamic menu items when subcategories change
  useEffect(() => {
    // Base menu items structure
    const generatedMenuItems = [
      {
        name: 'خانه',
      },
      {
        name: 'خانه',
        href: '/',
        icon: <AiTwotoneHome />,
      },
      {
        name: 'حساب کاربری',
        href: '/profile',
        icon: <PiUserCircleDuotone />,
      },
      {
        name: 'مدیریت اشتراک',
        href: routes.subscriptionList,
        icon: <PiCreditCardDuotone />,
      },
      {
        name: 'مدیریت اطلاعات',
      },
      {
        name: 'لیست شرکت‌های ثبت شده',
        href: routes.info.dashboard,
        icon: <PiListNumbersDuotone />,
      },
      {
        name: 'بانک صنعت غذا',
        href: '#',
        icon: <PiOrangeDuotone />,
        dropdownItems: [
          {
            name: 'ثبت شرکت جدید',
            href: routes.info.foodIndustryAdd,
          },
        ],
      },
      {
        name: 'بانک صنعت کشاورزی',
        href: '#',
        icon: <PiPlantDuotone />,
        dropdownItems: [
          {
            name: 'ثبت شرکت جدید',
            href: routes.info.agricultureIndustryAdd,
          },
        ],
      },
      {
        name: 'بانک ماشین‌آلات',
        href: '#',
        icon: <PiTractorDuotone />,
        dropdownItems: [
          {
            name: 'لیست شرکت‌های ثبت شده',
            href: routes.info.machinery,
          },
          {
            name: 'ثبت خریداران ماشین‌آلات',
            href: routes.info.machineryBuyerAdd,
          },
          {
            name: 'ثبت فروشندگان ماشین‌آلات',
            href: routes.info.machinerySellerAdd,
          },
        ],
      },
      {
        name: 'بانک خدمات',
        href: '#',
        icon: <PiWarehouseDuotone />,
        dropdownItems: [
          {
            name: 'لیست شرکت‌های ثبت شده',
            href: routes.info.serviceIndustryList,
          },
          // Dynamic subcategory items added from the API
          ...subcategories.map((subcat) => ({
            name: subcat.subCategoryDisplayName,
            href: `/info/service/${subcat.subCategoryName}/list`,
          })),
        ],
      },
      {
        name: 'رسانه‌ها',
        href: '#',
        icon: <PiMonitorPlayDuotone />,
        dropdownItems: [
          {
            name: 'لیست شرکت‌های ثبت شده',
            href: routes.info.mediaBankList,
          },
          {
            name: 'ثبت شرکت جدید',
            href: routes.info.mediaBankAdd,
          },
        ],
      },
      {
        name: 'پشتیبانی',
      },
      {
        name: 'تیکت',
        href: '/support/ticket',
        icon: <PiHeadsetDuotone />,
      },
      // {
      //   name: 'ایمیل',
      //   href: '/support/email',
      //   icon: <PiMailboxDuotone />,
      // },
      // {
      //   name: 'پیام',
      //   href: '/support/message',
      //   icon: <PiChatCenteredTextDuotone />,
      // },
      {
        name: 'مدیریت مالی',
      },
      {
        name: 'پرداخت‌',
        href: '#',
        icon: <PiCurrencyDollarDuotone />,
        dropdownItems: [
          {
            name: 'لیست پرداخت‌ها',
            href: routes.finance.paymentList,
          },
          {
            name: 'لیست تراکنش‌ها',
            href: routes.finance.transactionList,
          },
          // {
          //       name: 'جزییات (تنها برای محیط آزمایشی)',
          //       href: routes.invoice.details(DUMMY_ID),
          //     },
          // {
          //   name: 'ایجاد',
          //   href: routes.invoice.create,
          // },
        ],
      },
      // {
      //   name: 'فاکتور',
      //   href: '#',
      //   icon: <PiCurrencyDollarDuotone />,
      //   dropdownItems: [
      //     {
      //       name: 'لیست',
      //       href: routes.invoice.home,
      //     },
      //     {
      //       name: 'جزییات (تنها برای محیط آزمایشی)',
      //       href: routes.invoice.details(DUMMY_ID),
      //     },
      //     {
      //       name: 'ایجاد',
      //       href: routes.invoice.create,
      //     },
      //   ],
      // },
      // {
      //   name: 'بخش مدیریت (موقت)',
      //   href: '#',
      //   icon: <PiTable />,
      //   dropdownItems: [
      //     // {
      //     //   name: 'داشبورد',
      //     //   href: routes.management.dashboard,
      //     // },
      //     {
      //       name: 'درخواست‌های کاربران',
      //       href: routes.management.requestList,
      //     },
      //   ],
      // },
    ];

    setDynamicMenuItems(generatedMenuItems);
  }, [subcategories]);

  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 print:hidden 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 bg-white px-6 pb-5 pt-5 dark:bg-gray-100 2xl:px-7 2xl:pt-6">
        <Link
          href={'/'}
          className="flex items-center gap-2.5"
        >
          <span className="w-10 shrink-0">
            <Logo />
          </span>
          <span className="min-w-0 leading-tight">
            <strong className="block whitespace-nowrap text-sm font-black text-gray-900 dark:text-white">
              پنل کاربری کسب‌وکارها
            </strong>
            <span className="mt-1 block whitespace-nowrap text-[10px] font-medium text-gray-500 dark:text-gray-400">
              مرجع صنایع غذایی و کشاورزی ایران
            </span>
          </span>
        </Link>
      </div>

      <SimpleBar className="h-[calc(100%-80px)]">
        <div className="mt-4 pb-3 3xl:mt-6">
          {dynamicMenuItems.map((item, index) => {
            const isActive = pathname === (item?.href as string);
            const pathnameExistInDropdowns: any = item?.dropdownItems?.filter(
              (dropdownItem) => dropdownItem.href === pathname
            );
            const isDropdownOpen = Boolean(pathnameExistInDropdowns?.length);

            return (
              <Fragment key={item.name + '-' + index}>
                {item?.href ? (
                  <>
                    {item?.dropdownItems ? (
                      <Collapse
                        defaultOpen={isDropdownOpen}
                        header={({ open: collapseOpen, toggle }) => (
                          <div
                            onClick={toggle}
                            className={cn(
                              'group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2',
                              isDropdownOpen
                                ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                                : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700'
                            )}
                          >
                            <span className="flex items-center">
                              {item?.icon && (
                                <span
                                  className={cn(
                                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[19px] [&>svg]:w-[19px]',
                                    isDropdownOpen
                                      ? 'text-primary'
                                      : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                                  )}
                                >
                                  {item?.icon}
                                </span>
                              )}
                              {item.name}
                            </span>

                            <PiCaretDownBold
                              strokeWidth={3}
                              className={
                                collapseOpen
                                  ? 'h-3.5 w-3.5 rotate-0 text-gray-500 transition-transform duration-200'
                                  : 'h-3.5 w-3.5 rotate-90 text-gray-500 transition-transform duration-200'
                              }
                            />
                          </div>
                        )}
                      >
                        {item?.dropdownItems?.map((dropdownItem, index) => {
                          const isChildActive =
                            pathname === (dropdownItem?.href as string);

                          return (
                            <Link
                              href={dropdownItem?.href}
                              key={dropdownItem?.name + index}
                              className={cn(
                                'mx-3.5 mb-0.5 flex items-center rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5',
                                isChildActive
                                  ? 'text-gray-900'
                                  : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900'
                              )}
                            >
                              <span
                                className={cn(
                                  'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
                                  isChildActive
                                    ? 'bg-primary ring-[1px] ring-primary'
                                    : 'opacity-40'
                                )}
                              />{' '}
                              {dropdownItem?.name}
                            </Link>
                          );
                        })}
                      </Collapse>
                    ) : (
                      <Link
                        href={item?.href}
                        className={cn(
                          'group relative mx-3 my-0.5 flex items-center rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                          isActive
                            ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                            : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                        )}
                      >
                        {item?.icon && (
                          <span
                            className={cn(
                              'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[19px] [&>svg]:w-[19px]',
                              isActive
                                ? 'text-primary'
                                : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                            )}
                          >
                            {item?.icon}
                          </span>
                        )}
                        {item.name}
                      </Link>
                    )}
                  </>
                ) : (
                  <Text
                    tag="h6"
                    className={cn(
                      'mb-2 truncate px-6 text-[11px] font-medium uppercase text-gray-500 dark:text-gray-500 2xl:px-8',
                      index !== 0 && 'mt-6 3xl:mt-7'
                    )}
                  >
                    {item.name}
                  </Text>
                )}
              </Fragment>
            );
          })}
        </div>
      </SimpleBar>
    </aside>
  );
}
