// import { routes } from '@/config/routes';
// import { DUMMY_ID } from '@/config/constants';
// import {
//   PiShoppingCartDuotone,
//   PiHeadsetDuotone,
//   PiPackageDuotone,
//   PiChartBarDuotone,
//   PiFileImageDuotone,
//   PiCurrencyDollarDuotone,
//   PiSquaresFourDuotone,
//   PiGridFourDuotone,
//   PiFeatherDuotone,
//   PiChartLineUpDuotone,
//   // PiImageDuotone,
//   PiMapPinLineDuotone,
//   PiUserGearDuotone,
//   PiBellSimpleRingingDuotone,
//   PiUserDuotone,
//   PiEnvelopeSimpleOpenDuotone,
//   PiStepsDuotone,
//   PiCreditCardDuotone,
//   PiStackDuotone,
//   PiTableDuotone,
//   PiBrowserDuotone,
//   PiBoundingBoxDuotone,
//   PiHourglassSimpleDuotone,
//   PiUserCircleDuotone,
//   PiShootingStarDuotone,
//   PiRocketLaunchDuotone,
//   PiFolderLockDuotone,
//   PiBinocularsDuotone,
//   PiHammerDuotone,
//   PiNoteBlankDuotone,
//   PiUserPlusDuotone,
//   PiShieldCheckDuotone,
//   PiLockKeyDuotone,
//   PiChatCenteredDotsDuotone,
//   PiMagicWandDuotone,
//   PiBuildings,
//   PiPlant,
//   PiMessengerLogo,
//   PiContactlessPayment,
//   PiMonitorPlayDuotone,
//   PiWarehouseDuotone,
//   PiListNumbersDuotone,
//   PiTractorDuotone,
//   PiPlantDuotone,
//   PiOrangeDuotone,
//   PiMailboxDuotone,
//   PiChatCenteredTextDuotone,
// } from 'react-icons/pi';
// import {
//   MdAccountBalance,
//   MdEmail,
//   MdMessage,
//   MdSubscriptions,
// } from 'react-icons/md';
// import { CgHome, CgProfile } from 'react-icons/cg';
// import { FaTractor } from 'react-icons/fa6';
// import { AiTwotoneHome } from 'react-icons/ai';
//
// // Note: do not add href in the label object, it is rendering as label
// export const menuItems = [
//   // label start
//   {
//     name: 'خانه',
//   },
//   {
//     name: 'خانه',
//     href: '/',
//     icon: <AiTwotoneHome />,
//   },
//   {
//     name: 'حساب کاربری',
//     href: '/profile',
//     icon: <PiUserCircleDuotone />,
//   },
//   {
//     name: 'مدیریت اشتراک',
//     href: routes.subscriptionList,
//     icon: <PiCreditCardDuotone />,
//   },
//   // label end
//   // {
//   //   name: 'مدیریت فایل ها',
//   //   href: '/',
//   //   // href: routes.file.dashboard,
//   //   icon: <PiFileImageDuotone />,
//   // },
//   // {
//   //   name: 'آمار و حساب',
//   //   href: routes.logistics.dashboard,
//   //   icon: <PiPackageDuotone />,
//   // },
//   // {
//   //   name: 'ایکامرس',
//   //   href: routes.eCommerce.dashboard,
//   //   icon: <PiShoppingCartDuotone />,
//   // },
//   // {
//   //   name: 'آنالیز',
//   //   href: routes.analytics,
//   //   icon: <PiChartBarDuotone />,
//   // },
//   // {
//   //   name: 'پشتیبانی',
//   //   href: routes.support.dashboard,
//   //   icon: <PiHeadsetDuotone />,
//   // },
//   // label start
//   // {
//   //   name: 'بسته نرم‌افزاری (Apps Kit)',
//   // },
//   // // label end
//   // {
//   //   name: 'ایکامرس',
//   //   href: '#',
//   //   icon: <PiShoppingCartDuotone />,
//   //   dropdownItems: [
//   //     {
//   //       name: 'محصولات',
//   //       href: routes.eCommerce.products,
//   //     },
//   //     {
//   //       name: 'جزییات محصول',
//   //       href: routes.eCommerce.productDetails(DUMMY_ID),
//   //     },
//   //     {
//   //       name: 'ساخت محصول',
//   //       href: routes.eCommerce.createProduct,
//   //     },
//   //     {
//   //       name: 'ویرایش محصول',
//   //       href: routes.eCommerce.ediProduct(DUMMY_ID),
//   //     },
//   //     {
//   //       name: 'دسته بندی',
//   //       href: routes.eCommerce.categories,
//   //     },
//   //     {
//   //       name: 'ساخت دسته بندی',
//   //       href: routes.eCommerce.createCategory,
//   //     },
//   //     {
//   //       name: 'ویرایش دسته بندی',
//   //       href: routes.eCommerce.editCategory(DUMMY_ID),
//   //     },
//   //     {
//   //       name: 'سفارشات',
//   //       href: routes.eCommerce.orders,
//   //     },
//   //     {
//   //       name: 'جزییات سفارش',
//   //       href: routes.eCommerce.orderDetails(DUMMY_ID),
//   //     },
//   //     {
//   //       name: 'ساخت سفارش',
//   //       href: routes.eCommerce.createOrder,
//   //     },
//   //     {
//   //       name: 'ویرایش سفارش',
//   //       href: routes.eCommerce.editOrder(DUMMY_ID),
//   //     },
//   //     {
//   //       name: 'تظرات',
//   //       href: routes.eCommerce.reviews,
//   //     },
//   //     {
//   //       name: 'خرید',
//   //       href: routes.eCommerce.shop,
//   //     },
//   //     {
//   //       name: 'سبد خرید',
//   //       href: routes.eCommerce.cart,
//   //     },
//   //     {
//   //       name: 'پرداخت و تسویه حساب',
//   //       href: routes.eCommerce.checkout,
//   //     },
//   //   ],
//   // },
//   {
//     name: 'مدیریت اطلاعات',
//   },
//   {
//     name: 'لیست شرکت‌های ثبت شده',
//     href: routes.info.foodIndustryList,
//     icon: <PiListNumbersDuotone />,
//   },
//   {
//     name: 'بانک صنعت غذا',
//     href: '#',
//     icon: <PiOrangeDuotone />,
//     dropdownItems: [
//       // {
//       //   name: 'لیست شرکت‌های ثبت شده',
//       //   href: routes.info.foodIndustryList,
//       // },
//       // {
//       //   name: 'ثبت شرکت جدید',
//       //   href: routes.info.foodIndustryAdd,
//       // },
//       {
//         name: 'ثبت شرکت جدید',
//         href: routes.info.foodIndustryAdd,
//       },
//       // {
//       //   name: 'ثبت شرکت جدید',
//       //   href: routes.info.foodIndustryAdd,
//       // },
//       // {
//       //   name: 'نمایش اطلاعات',
//       //   href: routes.info.foodIndustryView(1234),
//       // },
//       // {
//       //   name: 'ویرایش اطلاعات',
//       //   href: routes.info.foodIndustryEdit(1234),
//       // },
//       // {
//       //   name: 'ویرایش اطلاعات',
//       //   href: routes.eCommerce.ediProduct(DUMMY_ID),
//       // },
//       // {
//       //   name: 'دسته بندی',
//       //   href: routes.eCommerce.categories,
//       // },
//       // {
//       //   name: 'ساخت دسته بندی',
//       //   href: routes.eCommerce.createCategory,
//       // },
//       // {
//       //   name: 'ویرایش دسته بندی',
//       //   href: routes.eCommerce.editCategory(DUMMY_ID),
//       // },
//       // {
//       //   name: 'سفارشات',
//       //   href: routes.eCommerce.orders,
//       // },
//       // {
//       //   name: 'جزییات سفارش',
//       //   href: routes.eCommerce.orderDetails(DUMMY_ID),
//       // },
//       // {
//       //   name: 'ساخت سفارش',
//       //   href: routes.eCommerce.createOrder,
//       // },
//       // {
//       //   name: 'ویرایش سفارش',
//       //   href: routes.eCommerce.editOrder(DUMMY_ID),
//       // },
//       // {
//       //   name: 'تظرات',
//       //   href: routes.eCommerce.reviews,
//       // },
//       // {
//       //   name: 'خرید',
//       //   href: routes.eCommerce.shop,
//       // },
//       // {
//       //   name: 'سبد خرید',
//       //   href: routes.eCommerce.cart,
//       // },
//       // {
//       //   name: 'پرداخت و تسویه حساب',
//       //   href: routes.eCommerce.checkout,
//       // },
//     ],
//   },
//   {
//     name: 'بانک صنعت کشاورزی',
//     href: '#',
//     icon: <PiPlantDuotone />,
//     dropdownItems: [
//       // {
//       //   name: 'لیست شرکت‌های ثبت شده',
//       //   href: routes.info.agricultureIndustryList,
//       // },
//       {
//         name: 'ثبت شرکت جدید',
//         href: routes.info.agricultureIndustryAdd,
//       },
//       // {
//       //   name: 'نمایش اطلاعات',
//       //   href: routes.info.agricultureIndustryView(1234),
//       // },
//       // {
//       //   name: 'ویرایش اطلاعات',
//       //   href: routes.info.agricultureIndustryEdit(1234),
//       // },
//     ],
//   },
//   {
//     name: 'بانک ماشین‌آلات',
//     href: '#',
//     icon: <PiTractorDuotone />,
//     dropdownItems: [
//       {
//         name: 'لیست شرکت‌های ثبت شده',
//         href: routes.info.machinery,
//       },
//       {
//         name: 'ثبت خریداران ماشین‌آلات',
//         href: routes.info.machineryBuyerAdd,
//       },
//       {
//         name: 'ثبت فروشندگان ماشین‌آلات',
//         href: routes.info.machinerySellerAdd,
//       },
//     ],
//   },
//   {
//     name: 'بانک خدمات',
//     href: '#',
//     icon: <PiWarehouseDuotone />,
//     dropdownItems: [
//       {
//         name: 'لیست شرکت‌های ثبت شده',
//         href: routes.info.serviceIndustryList,
//       },
//       {
//         name: 'نمایشگاه‌های داخلی و خارجی',
//         href: routes.info.exhibitionsCreate,
//       },
//       {
//         name: 'همایش‌های داخلی و خارجی',
//         href: routes.info.conferencesCreate,
//       },
//       {
//         name: 'آگهی استخدام شرکت‌ها',
//         href: routes.info.employmentCreate,
//       },
//       {
//         name: 'مشخصات متقاضیان استخدام',
//         href: routes.info.jobsCreate,
//       },
//       {
//         name: 'متقاضیان نمایندگی فروش',
//         href: routes.info.requestCreate,
//       },
//       {
//         name: 'اعطاکنندگان نمایندگی فروش',
//         href: routes.info.resellerCreate,
//       },
//       {
//         name: 'آزمایشگاه‌های کنترل کیفیت',
//         href: routes.info.labsCreate,
//       },
//       {
//         name: 'صادرکنندگان گواهینامه‌های بین‌المللی',
//         href: routes.info.certificationsCreate,
//       },
//       {
//         name: 'کارخانه و کارگاه‌های فروشی',
//         href: routes.info.saleFactoryCreate,
//       },
//       {
//         name: 'ظرفیت مازاد کارخانجات',
//         href: routes.info.surplusCreate,
//       },
//       {
//         name: 'انجمن‌ها و تشکل‌های علمی و صنفی',
//         href: routes.info.associationsCreate,
//       },
//     ],
//   },
//
//   {
//     name: 'رسانه‌ها',
//     href: '#',
//     icon: <PiMonitorPlayDuotone />,
//     dropdownItems: [
//       {
//         name: 'لیست شرکت‌های ثبت شده',
//         href: routes.info.mediaBankList,
//       },
//       {
//         name: 'ثبت شرکت جدید',
//         href: routes.info.mediaBankAdd,
//       },
//     ],
//   },
//   {
//     name: 'پشتیبانی',
//   },
//   {
//     name: 'تیکت',
//     href: '/support/ticket',
//     icon: <PiHeadsetDuotone />,
//   },
//   {
//     name: 'ایمیل',
//     href: '/support/email',
//     icon: <PiMailboxDuotone />,
//   },
//   {
//     name: 'پیام',
//     href: '/support/message',
//     icon: <PiChatCenteredTextDuotone />,
//   },
//   // {
//   //   name: 'پشتیبانی قدیمی',
//   // },
//   // {
//   //   name: 'پشتیبانی قدیمی',
//   //   href: '#',
//   //   icon: <PiHeadsetDuotone />,
//   //   dropdownItems: [
//   //     {
//   //       name: 'صندوق ورودی',
//   //       href: routes.support.inbox,
//   //     },
//   //     {
//   //       name: 'فراگیرها(snippets)',
//   //       href: routes.support.snippets,
//   //     },
//   //     {
//   //       name: 'قالب ها',
//   //       href: routes.support.templates,
//   //     },
//   //     {
//   //       name: 'تیکت‌ها',
//   //       href: routes.support.ticket,
//   //     },
//   //   ],
//   // },
//   {
//     name: 'مدیریت مالی',
//   },
//   {
//     name: 'پرداخت‌',
//     href: '#',
//     icon: <PiContactlessPayment />,
//     dropdownItems: [
//       {
//         name: 'لیست پرداخت‌ها',
//         href: routes.finance.paymentList,
//       },
//       {
//         name: 'لیست تراکنش‌ها',
//         href: routes.finance.transactionList,
//       },
//       {
//         name: 'ایجاد',
//         href: routes.invoice.create,
//       },
//       // {
//       //   name: 'ویرایش',
//       //   href: routes.invoice.edit(DUMMY_ID),
//       // },
//     ],
//   },
//   {
//     name: 'فاکتور',
//     href: '#',
//     icon: <PiCurrencyDollarDuotone />,
//     dropdownItems: [
//       {
//         name: 'لیست',
//         href: routes.invoice.home,
//       },
//       {
//         name: 'جزییات (تنها برای محیط آزمایشی)',
//         href: routes.invoice.details(DUMMY_ID),
//       },
//       {
//         name: 'ایجاد',
//         href: routes.invoice.create,
//       },
//       // {
//       //   name: 'ویرایش',
//       //   href: routes.invoice.edit(DUMMY_ID),
//       // },
//     ],
//   },
//   {
//     name: 'بخش مدیریت (موقت)',
//     href: '#',
//     icon: <PiCurrencyDollarDuotone />,
//     dropdownItems: [
//       {
//         name: 'داشبورد',
//         href: routes.management.dashboard,
//       },
//       {
//         name: 'درخواست‌های کاربران',
//         href: routes.management.requestList,
//       },
//       // {
//       //   name: 'ویرایش',
//       //   href: routes.invoice.edit(DUMMY_ID),
//       // },
//     ],
//   },
//   // {
//   //   name: 'آمار و حساب',
//   //   href: '#',
//   //   icon: <PiPackageDuotone />,
//   //   dropdownItems: [
//   //     {
//   //       name: 'لیست حمل‌ونقل',
//   //       href: routes.logistics.shipmentList,
//   //     },
//   //     {
//   //       name: 'جزئیات حمل‌ونقل',
//   //       href: routes.logistics.shipmentDetails,
//   //     },
//   //     {
//   //       name: 'ایجاد حمل‌ونقل',
//   //       href: routes.logistics.createShipment,
//   //     },
//   //     {
//   //       name: 'پروفایل مشتری',
//   //       href: routes.logistics.customerProfile,
//   //     },
//   //     {
//   //       name: 'ردیابی',
//   //       href: routes.logistics.tracking(DUMMY_ID),
//   //     },
//   //   ],
//   // },
//   // {
//   //   name: 'مدیریت فایل ها',
//   //   href: routes.file.manager,
//   //   icon: <PiFileImageDuotone />,
//   // },
//   //   // label start
//   //   {
//   //     name: 'ویجت ها',
//   //   },
//   //   // label end
//   //   {
//   //     name: 'کارت ها',
//   //     href: routes.widgets.cards,
//   //     icon: <PiSquaresFourDuotone />,
//   //   },
//   //   {
//   //     name: 'آیکون',
//   //     href: routes.widgets.icons,
//   //     icon: <PiFeatherDuotone />,
//   //   },
//   //   {
//   //     name: 'نمودار ها',
//   //     href: routes.widgets.charts,
//   //     icon: <PiChartLineUpDuotone />,
//   //   },
//   //   // {
//   //   //   name: 'Banners',
//   //   //   href: routes.widgets.banners,
//   //   //   icon: <PiImageDuotone />,
//   //   // },
//   //   {
//   //     name: 'نقشه ها',
//   //     href: routes.widgets.maps,
//   //     icon: <PiMapPinLineDuotone />,
//   //   },
//   // label start
//   // //   {
//   // //     name: 'فرم ها',
//   // //   },
//   // //   // label end
//   // //   {
//   // //     name: 'تنطیمات حساب کاربری',
//   // //     href: routes.forms.profileSettings,
//   // //     icon: <PiUserGearDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'ترجیحات اعلان',
//   // //     href: routes.forms.notificationPreference,
//   // //     icon: <PiBellSimpleRingingDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'اطلاعات شخصی',
//   // //     href: routes.forms.personalInformation,
//   // //     icon: <PiUserDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'روزنامه',
//   // //     href: routes.forms.newsletter,
//   // //     icon: <PiEnvelopeSimpleOpenDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'چند قدم',
//   // //     href: routes.multiStep,
//   // //     icon: <PiStepsDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'تسویه حساب پرداخت',
//   // //     href: routes.eCommerce.checkout,
//   // //     icon: <PiCreditCardDuotone />,
//   // //   },
//   // //   // label start
//   // //   {
//   // //     name: 'جدول ها',
//   // //   },
//   // //   // label end
//   // //   {
//   // //     name: 'ساده',
//   // //     href: routes.tables.basic,
//   // //     icon: <PiGridFourDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'قابل جمع شدن',
//   // //     href: routes.tables.collapsible,
//   // //     icon: <PiStackDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'بهبود یافته',
//   // //     href: routes.tables.enhanced,
//   // //     icon: <PiTableDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'هدر چسبان',
//   // //     href: routes.tables.stickyHeader,
//   // //     icon: <PiBrowserDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'صفحه‌بندی',
//   // //     href: routes.tables.pagination,
//   // //     icon: <PiBoundingBoxDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'جستجو',
//   // //     href: routes.tables.search,
//   // //     icon: <PiHourglassSimpleDuotone />,
//   // //   },
//   // //   // label start
//   // //   {
//   // //     name: 'صفحه ها',
//   // //   },
//   // //   // label end
//   // //   {
//   // //     name: 'جستجو و فیلتر',
//   // //     href: '#',
//   // //     icon: <PiMagicWandDuotone />,
//   // //     dropdownItems: [
//   // //       {
//   // //         name: 'مشاور املاک',
//   // //         href: routes.search.realEstate,
//   // //       },
//   // //     ],
//   // //   },
//   // //   {
//   // //     name: 'پروفایل',
//   // //     href: routes.profile,
//   // //     icon: <PiUserCircleDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'خوش آمدید',
//   // //     href: routes.welcome,
//   // //     icon: <PiShootingStarDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'به زودی',
//   // //     href: routes.comingSoon,
//   // //     icon: <PiRocketLaunchDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'دسترسی ممنوع',
//   // //     href: routes.accessDenied,
//   // //     icon: <PiFolderLockDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'یافت نشد',
//   // //     href: routes.notFound,
//   // //     icon: <PiBinocularsDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'تعمیر و نگهداری',
//   // //     href: routes.maintenance,
//   // //     icon: <PiHammerDuotone />,
//   // //   },
//   // //   {
//   // //     name: 'خالی',
//   // //     href: routes.blank,
//   // //     icon: <PiNoteBlankDuotone />,
//   // //   },
//
//   // //   // label start
//   // //   {
//   // //     name: 'اعتبار سنجی',
//   // //   },
//   // //   // label end
//   // //   {
//   // //     name: 'ثبت نام',
//   // //     href: '#',
//   // //     icon: <PiUserPlusDuotone />,
//   // //     dropdownItems: [
//   // //       {
//   // //         name: 'ثبت نام مدرن',
//   // //         href: routes.auth.signUp1,
//   // //       },
//   // //       {
//   // //         name: 'ثبت نام وینتیج',
//   // //         href: routes.auth.signUp2,
//   // //       },
//   // //       {
//   // //         name: 'ثبت نام روز',
//   // //         href: routes.auth.signUp3,
//   // //       },
//   // //       {
//   // //         name: 'ثبت نام شیک',
//   // //         href: routes.auth.signUp4,
//   // //       },
//   // //       {
//   // //         name: 'ثبت نام کلاسیک',
//   // //         href: routes.auth.signUp5,
//   // //       },
//   // //     ],
//   // //   },
//   // //   {
//   // //     name: 'ورود',
//   // //     href: '#',
//   // //     icon: <PiShieldCheckDuotone />,
//   // //     dropdownItems: [
//   // //       {
//   // //         name: 'ورود مدرن',
//   // //         href: routes.auth.signIn1,
//   // //       },
//   // //       {
//   // //         name: 'ورود وینتیج',
//   // //         href: routes.auth.signIn2,
//   // //       },
//   // //       {
//   // //         name: 'ورود روز',
//   // //         href: routes.auth.signIn3,
//   // //       },
//   // //       {
//   // //         name: 'ورود شیک',
//   // //         href: routes.auth.signIn4,
//   // //       },
//   // //       {
//   // //         name: 'ورود کلاسیک',
//   // //         href: routes.auth.signIn5,
//   // //       },
//   // //     ],
//   // //   },
//   // //   {
//   // //     name: 'فراموشی رمز عبور',
//   // //     href: '#',
//   // //     icon: <PiLockKeyDuotone />,
//   // //     dropdownItems: [
//   // //       {
//   // //         name: 'فراموشی رمز عبور مدرن',
//   // //         href: routes.auth.forgotPassword1,
//   // //       },
//   // //       {
//   // //         name: 'فراموشی رمز عبور وینتیج',
//   // //         href: routes.auth.forgotPassword2,
//   // //       },
//   // //       {
//   // //         name: 'فراموشی رمز عبور روز',
//   // //         href: routes.auth.forgotPassword3,
//   // //       },
//   // //       {
//   // //         name: 'فراموشی رمز عبور شیک',
//   // //         href: routes.auth.forgotPassword4,
//   // //       },
//   // //       {
//   // //         name: 'فراموشی رمز عبور کلاسیک',
//   // //         href: routes.auth.forgotPassword5,
//   // //       },
//   // //     ],
//   // //   },
//   // //   {
//   // //     name: 'OTP صفحه ',
//   // //     href: '#',
//   // //     icon: <PiChatCenteredDotsDuotone />,
//   // //     dropdownItems: [
//   // //       {
//   // //         name: 'صفحه OTP مدرن',
//   // //         href: routes.auth.otp1,
//   // //       },
//   // //       {
//   // //         name: 'صفحه OTP وینتیج',
//   // //         href: routes.auth.otp2,
//   // //       },
//   // //       {
//   // //         name: 'صفحه OTP روز',
//   // //         href: routes.auth.otp3,
//   // //       },
//   // //       {
//   // //         name: 'صفحه OTP شیک',
//   // //         href: routes.auth.otp4,
//   // //       },
//   // //       {
//   // //         name: 'صفحه OTP کلاسیک',
//   // //         href: routes.auth.otp5,
//   // //       },
//   //     ],
//   //   },
// ];
'use client';

import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';
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
  // Import other icons as needed
} from 'react-icons/pi';
import { AiTwotoneHome } from 'react-icons/ai';
import { useServiceSubcategories } from '@/hooks/use-service-subcategories';

const MenuItems = () => {
  // Use our custom hook to get service subcategories
  const { subcategories } = useServiceSubcategories();

  // Generate dynamic dropdown items for service bank
  const serviceBankItems = subcategories.map((subcat) => ({
    name: subcat.subCategoryDisplayName,
    href: routes.info.serviceIndustrySubCategoryCreate(subcat.subCategoryName),
  }));

  // The base menu items (static parts)
  return [
    // Label start
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
    // Label end
    {
      name: 'مدیریت اطلاعات',
    },
    {
      name: 'لیست شرکت‌های ثبت شده',
      href: routes.info.foodIndustryList,
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
        // Dynamic subcategory items
        ...serviceBankItems,
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
    //     name: 'ایمیل',
    //     href: '/support/email',
    //     icon: <PiMailboxDuotone />,
    // },
    // {
    //     name: 'پیام',
    //     href: '/support/message',
    //     icon: <PiChatCenteredTextDuotone />,
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
        //     name: 'جزییات (تنها برای محیط آزمایشی)',
        //     href: routes.invoice.details(DUMMY_ID),
        // },
        // {
        //     name: 'ایجاد',
        //     href: routes.invoice.create,
        // },
      ],
    },
    // {
    //     name: 'فاکتور',
    //     href: '#',
    //     icon: <PiCurrencyDollarDuotone />,
    //     dropdownItems: [
    //         // {
    //         //     name: 'لیست',
    //         //     href: routes.invoice.home,
    //         // },
    //
    //         // {
    //         //     name: 'ایجاد',
    //         //     href: routes.invoice.create,
    //         // },
    //     ],
    // },
    // {
    //     name: 'بخش مدیریت (موقت)',
    //     href: '#',
    //     icon: <PiCurrencyDollarDuotone />,
    //     dropdownItems: [
    //         // {
    //         //     name: 'داشبورد',
    //         //     href: routes.management.dashboard,
    //         // },
    //         {
    //             name: 'درخواست‌های کاربران',
    //             href: routes.management.requestList,
    //         },
    //     ],
    // },
  ];
};

export const menuItems = MenuItems();
