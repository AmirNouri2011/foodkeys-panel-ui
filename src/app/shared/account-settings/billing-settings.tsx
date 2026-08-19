// 'use client';
//
// import { Dispatch, ReactElement, useEffect, useState } from 'react';
// import cn from '@/utils/class-names';
// import { Text } from '@/components/ui/text';
// import { Button } from '@/components/ui/button';
// import { RadioGroup } from '@/components/ui/radio-group';
// import { Badge } from '@/components/ui/badge';
// import { useModal } from '@/app/shared/modal-views/use-modal';
// import { useRouter } from 'next/navigation';
// import HorizontalFormBlockWrapper from './horiozontal-block';
// import {
//   PiCheckBold,
//   PiCheckCircleFill,
//   PiDownloadSimpleBold,
//   PiFire,
//   PiLightning,
//   PiPlusBold,
//   PiStackSimple,
//   PiWallet,
// } from 'react-icons/pi';
// import { AdvancedRadio } from '@/components/ui/advanced-radio';
// import BillingHistoryTable from './billing-history/table';
// import AddBillingCardModalView from './modal/add-billing-card';
// import MasterCardIcon from '@/components/icons/mastercard';
// import VisaIcon from '@/components/icons/visa';
// import ApplePayIcon from '@/components/icons/apple-pay';
// import { billingHistoryData } from '@/data/billing-history';
// import { exportToCSV } from '@/utils/export-to-csv';
// import { BiTestTube } from 'react-icons/bi';
// import { FaCheckCircle } from 'react-icons/fa';
// import { IoIosArrowBack } from 'react-icons/io';
// import { SetStateAction } from 'jotai';
// import { JsxElement } from 'typescript';
// import mellat from 'public/mellat.png';
// import zarinPal from 'public/zarinPal.webp';
// import Image from 'next/image';
// import TomanIcon from '@/components/toman/tomanIcon';
// import { Input } from 'rizzui';
// import { BsCreditCard } from 'react-icons/bs';
// import axiosInstance from '@/utils/axios-instance';
// import toast from 'react-hot-toast';
//
// const plansOptions: {
//   icon: ReactElement;
//   title: string;
//   description: string;
//   value: 'free' | 'basic' | 'premium';
// }[] = [
//   {
//     icon: <BiTestTube className="h-4 w-4 text-gray-900" />,
//     title: 'پلن تست رایگان 2 ماهه',
//     description:
//       'شامل یک سایت استاندارد ویژه، پشتیبانی 24 ساعته و دسترسی به تمامی ویژگی‌ها (برای شرکت هایی که برای بار اول ثبت نام کرده اند).',
//     value: 'free',
//   },
//   {
//     icon: <PiFire className="h-4 w-4 text-gray-900" />,
//     title: 'پلن پایه 500,000 تومان ماهیانه',
//     description:
//       'شامل یک سایت استاندارد ویژه، پشتیبانی 24 ساعته و دسترسی به تمامی ویژگی‌ها.',
//     value: 'basic',
//   },
//   {
//     icon: <PiLightning className="h-4 w-4 text-gray-900" />,
//     title: 'پلن ویژه 6,000,000 تومان سالیانه',
//     description:
//       'شامل یک سایت استاندارد ویژه، پشتیبانی 24 ساعته، دسترسی به تمامی ویژگی‌ها، 3 ماه اشتراک رایگاه اضافی، تخفیف سالیانه.',
//     value: 'premium',
//   },
// ];
//
// const cardsOptions = [
//   {
//     icon: <BsCreditCard size={25} />,
//     title: 'اعتبار کیف پول',
//     default: true,
//     value: 'credit',
//     isIcon: true,
//   },
//   {
//     icon: zarinPal,
//     title: 'درگاه زرین پال',
//     default: false,
//     value: 'zarinPal',
//   },
//   {
//     icon: mellat,
//     title: 'درگاه بانک ملت',
//     default: false,
//     value: 'mellat',
//   },
// ];
//
// // @ts-ignore
// export default function BillingSettingsView({ id }) {
//   const [currentPlan, setCurrentPlan] = useState<string>('premium');
//   function handleExportData() {
//     exportToCSV(
//       billingHistoryData,
//       'Title,Amount,Date,Status,Shared',
//       'billing_history'
//     );
//   }
//
//   return (
//     <>
//       {/*<HorizontalFormBlockWrapper*/}
//       {/*  childrenWrapperClassName="gap-0 @lg:gap-0"*/}
//       {/*  title="خرید اشتراک"*/}
//       {/*  titleClassName="text-xl font-semibold"*/}
//       {/*  description=" "*/}
//       {/*/>*/}
//       <HorizontalFormBlockWrapper
//         title="انتخاب پلن"
//         description="با توجه به نیاز خود پلن مورد نظر را برای استفاده از خدمات سایت انتخاب نمایید."
//         descriptionClassName="max-w-md"
//         childrenWrapperClassName="@3xl:grid-cols-1 max-w-5xl w-full"
//       >
//         <div>
//           <CurrentPlans
//             currentPlan={currentPlan}
//             setCurrentPlan={setCurrentPlan}
//           />
//           <ul className="mt-10 text-gray-500">
//             <li className="my-1 flex items-center gap-3 ">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               اختصاص یک سایت استاندارد ویژه با امکانات کامل (معرفی شرکت، عکس و
//               مشخصات کالا یا خدمات و ...)
//             </li>
//             <li className="my-1 flex items-center gap-3">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               امکان اعمال تغییرات و مدیریت سایت استاندارد ویژه در هر لحظه و بدون
//               مهارت فنی
//             </li>
//             <li className="my-1 flex items-center gap-3">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               حضور در صفحه اول گوگل در کمتر از یک ماه
//             </li>
//             <li className="my-1 flex items-center gap-3">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               بی نیاز از داشتن سایت اختصاصی و دغدغه نگهداری و هزینه های آن
//             </li>
//             <li className="my-1 flex items-center gap-3">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               ضمانت افزایش فروش کالا و خدمات شما
//             </li>
//             <li className="my-1 flex items-center gap-3">
//               <PiCheckBold
//                 className="flex-shrink-0 flex-grow-0 "
//                 size={20}
//                 color="#129974"
//               />
//               کمک به ارتقاء موقعیت شما نسبت به رقبا
//             </li>
//           </ul>
//         </div>
//       </HorizontalFormBlockWrapper>
//       <ConfirmationCard currentPlan={currentPlan} />
//       <TotalCard currentPlan={currentPlan} id={id} />
//     </>
//   );
// }
//
// export function CurrentPlans({
//   currentPlan,
//   setCurrentPlan,
// }: {
//   currentPlan: 'free' | 'basic' | 'premium' | string;
//   setCurrentPlan: Dispatch<SetStateAction<string>>;
// }) {
//   return (
//     <RadioGroup
//       value={currentPlan}
//       setValue={setCurrentPlan}
//       className="flex flex-col gap-5"
//     >
//       {plansOptions.map((plan, index) => (
//         <AdvancedRadio
//           key={`plan-${index}`}
//           name="current_plans"
//           value={plan.value}
//           onChange={() => setCurrentPlan(plan.value)}
//           checked={plan.value === currentPlan}
//           className="flex flex-col space-y-2 rounded-xl border border-gray-300 p-5 text-sm hover:cursor-pointer hover:border-gray-900"
//           inputClassName="[&:checked~span_div>.icon]:block [&:checked~span]:ring-1 [&:checked~span]:ring-offset-0 [&:checked~span]:ring-gray-900 [&:checked~span]:!border-gray-900"
//         >
//           <div className="flex items-center justify-between gap-3">
//             <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
//               {plan.icon}
//             </div>
//             <div className="flex-grow">
//               <div className="flex justify-between">
//                 <Text
//                   tag="h6"
//                   className="mb-1 text-sm font-medium text-gray-900"
//                 >
//                   {plan.title}
//                   {index == 2 && (
//                     <Badge
//                       variant="flat"
//                       rounded="DEFAULT"
//                       color="danger"
//                       className="mr-2"
//                     >
//                       محبوب ترین{' '}
//                     </Badge>
//                   )}
//                 </Text>
//                 <PiCheckCircleFill className="icon hidden h-6 w-6 flex-shrink-0 text-gray-900" />
//               </div>
//               <Text className="text-gray-500">{plan.description}</Text>
//             </div>
//           </div>
//         </AdvancedRadio>
//       ))}
//     </RadioGroup>
//   );
// }
//
// export function CardDetails() {
//   const [paymentMethod, setPaymentMethod] = useState('credit');
//
//   return (
//     <div>
//       <div className="flex flex-col gap-4 xs:flex-row">
//         {cardsOptions.map((cards, index) => (
//           <AdvancedRadio
//             key={`cards-${index}`}
//             name="card_details"
//             onChange={() => setPaymentMethod(cards.value)}
//             defaultChecked={cards.value === paymentMethod}
//             value={cards.value}
//             className="flex gap-3 rounded-xl border border-gray-300 p-5 text-sm hover:cursor-pointer hover:border-gray-900"
//             inputClassName="[&:checked~span_div>.icon]:block [&:checked~span]:ring-1 [&:checked~span]:ring-offset-0 [&:checked~span]:ring-gray-900 [&:checked~span]:!border-gray-900"
//           >
//             <div className="flex items-center justify-center">
//               <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md px-2 py-1.5">
//                 {/*// @ts-ignore*/}
//                 {cards.isIcon ? (
//                   <>{cards.icon}</>
//                 ) : (
//                   <Image src={cards.icon} alt="" />
//                 )}
//               </div>
//               <div className="block">
//                 <Text tag="h6" className="mb-1 text-sm font-medium">
//                   {cards.title}
//                 </Text>
//               </div>
//             </div>
//             {cards.value === paymentMethod ? (
//               <PiCheckCircleFill className="icon ms-auto h-6 w-6 flex-shrink-0 text-gray-900" />
//             ) : (
//               <div className="relative ms-auto flex h-5 w-5 items-center justify-center rounded-full border border-gray-300"></div>
//             )}
//           </AdvancedRadio>
//         ))}
//       </div>
//     </div>
//   );
// }
//
// const ConfirmationCard = ({
//   currentPlan,
// }: {
//   currentPlan: string | 'free' | 'basic' | 'premium';
// }) => {
//   const ordersMap = {
//     free: { title: 'خرید اشتراک تست 2 ماهه رایگان', price: '0' },
//     basic: { title: 'خرید اشتراک یک ماهه', price: '500,000' },
//     premium: { title: 'خرید اشتراک یک ساله', price: '6,000,000' },
//   };
//   return (
//     <div className="mt-5 flex w-full flex-col items-start justify-start rounded-xl border bg-white p-2 shadow-xl sm:p-6">
//       <span className="flex items-center justify-center">
//         <span className="ml-3 h-4 w-4 rounded-full bg-black" />
//         <h4>تایید و پرداخت</h4>
//       </span>
//
//       <div className="mt-10 flex w-full flex-col">
//         <div className="flex w-full justify-between pl-4 md:pl-24">
//           <p>سفارش ها</p>
//           <p>هزینه</p>
//         </div>
//         <div className="flex w-full justify-between">
//           <div className="ml-2 mt-5 flex w-3/4 items-center gap-2 rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-4/5 md:ml-8 md:p-4 xl:p-6">
//             <FaCheckCircle
//               size={20}
//               style={{ flexShrink: '0' }}
//               color="#10b981"
//             />
//             <p className="flex gap-1 text-xs md:text-base">
//               {/* @ts-ignore */}
//               {ordersMap[currentPlan].title} بانک صنایع غذایی
//             </p>
//           </div>
//           <div className="mt-5 flex w-1/4 items-center justify-center rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-1/5 md:p-4 xl:p-6">
//             <p className="flex gap-1 text-xs md:text-base">
//               {/* @ts-ignore */}
//               {ordersMap[currentPlan].price} تومان
//             </p>
//           </div>
//         </div>
//         {currentPlan === 'premium' && (
//           <div className="flex w-full justify-between">
//             <div className="ml-2 mt-5 flex w-3/4 items-center gap-2 rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-4/5 md:ml-8 md:p-4 xl:p-6">
//               <FaCheckCircle
//                 size={20}
//                 style={{ flexShrink: '0' }}
//                 color="#10b981"
//               />
//               <p className="flex gap-1 text-xs md:text-base">
//                 3 ماه اشتراک هدیه{' '}
//               </p>
//             </div>
//
//             <div className="mt-5 flex w-1/4 items-center justify-center rounded-xl  bg-gray-100 p-3 text-gray-600 sm:w-1/5 md:p-4 xl:p-6">
//               <p className="flex gap-1 text-xs md:text-base">0 تومان</p>
//             </div>
//           </div>
//         )}
//       </div>
//       <span className="mb-5 mt-10 flex items-center justify-center">
//         {/* <span className="ml-3 h-4 w-4 rounded-full bg-black" /> */}
//         <h4>درگاه و نوع پرداخت</h4>
//       </span>
//       <CardDetails />
//     </div>
//   );
// };
//
// const TotalCard = ({ currentPlan, id }: { currentPlan: string; id: any }) => {
//   const [discountCode, setDiscountCode] = useState('');
//   const [discount, setDiscount] = useState(0);
//   // @ts-ignore
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [totalDiscount, setTotalDiscount] = useState(0);
//   const router = useRouter();
//   const totalMapper = {
//     free: 0,
//     basic: 500_000,
//     premium: 6_000_000,
//   };
//   useEffect(() => {
//     // @ts-ignore
//     const basePrice = totalMapper[currentPlan];
//     const tax = basePrice * 0.1;
//     const discountAmount = (basePrice * discount) / 100;
//     // @ts-ignore
//     setTotalPrice(basePrice + tax - discountAmount);
//     setTotalDiscount(discountAmount);
//   }, [discount, currentPlan]);
//   const handlePayment = async () => {
//     let bundleId: number;
//     switch (currentPlan) {
//       case 'free':
//         bundleId = (id - 1) * 3 + 1;
//         break;
//       case 'basic':
//         bundleId = (id - 1) * 3 + 2;
//         break;
//       case 'premium':
//         bundleId = (id - 1) * 3 + 3;
//         break;
//     }
//     const createSubscription = async () => {
//       const API_URL = `http://localhost:8080/api/v1/subscription`;
//       let data = {
//         bundleId: bundleId,
//       };
//       if (discountCode) {
//         // @ts-ignore
//         data['discountCode'] = discountCode;
//       }
//       try {
//         const response = await axiosInstance.post(API_URL, data);
//
//         if (response.data.statusCode === 200) {
//           toast.success(response.data.message);
//           return {
//             data: response.data.data,
//           };
//         }
//       } catch (error) {
//         // @ts-ignore
//         toast.error(error?.response?.data?.message || 'خطا در خرید اشتراک');
//         console.error('Failed to buy subscription', error);
//       }
//     };
//     let response = await createSubscription();
//     if (response?.data) router.push(`/bundle/${id}`);
//
//     // dispatch(addCredit(amount));
//   };
//   const applyDiscountCode = async () => {
//     let bundleId;
//     switch (currentPlan) {
//       case 'free':
//         bundleId = 1;
//         break;
//       case 'basic':
//         bundleId = 2;
//         break;
//       case 'premium':
//         bundleId = 3;
//         break;
//     }
//     const applyDiscount = async () => {
//       const API_URL = `http://localhost:8080/api/v1/discount/${encodeURIComponent(
//         discountCode
//       )}/use`;
//       try {
//         const response = await axiosInstance.post(API_URL, {});
//
//         if (response.data.statusCode === 200) {
//           toast.success(response.data.message);
//           return {
//             data: response.data.data,
//           };
//         } else {
//           toast.error('کد تخفیف یافت نشد');
//           // throw new Error('Failed to start payment');
//         }
//       } catch (error) {
//         // @ts-ignore
//         toast.error(error?.response?.data?.message || 'کد تخفیف یافت نشد');
//         console.error('Failed to apply discount code', error);
//       }
//     };
//     let response = await applyDiscount();
//     if (response?.data) setDiscount(response?.data);
//     //   // window.location.href = response?.data?.url;
//     // else toast.error("کد تخفیف یافت نشد")
//     // dispatch(addCredit(amount));
//   };
//   // const discount = 0;
//   // @ts-ignore
//   // const totalPrice =
//   //   // @ts-ignore
//   //   totalMapper[currentPlan] + totalMapper[currentPlan] * 0.1 + discount;
//   // @ts-ignore
//   return (
//     <div className="mt-5 flex w-full flex-col items-start justify-start rounded-xl bg-white p-2 shadow-xl sm:p-6">
//       <span className="flex w-full items-center justify-start">
//         <span className="ml-3 h-4 w-4 rounded-full bg-black" />
//         <h4>فاکتور نهایی</h4>
//       </span>
//
//       <div className="mt-10 flex w-full flex-col gap-4">
//         <div className="flex w-full items-start justify-between">
//           <div className="w-4/5">
//             <p className="text-xs sm:text-base">مجموع</p>
//           </div>
//           <div className="w-1/5">
//             <div className="flex items-center justify-end gap-2">
//               <p className="text-xs sm:text-base">
//                 {/* @ts-ignore */}
//                 {totalMapper[currentPlan].toLocaleString()}
//               </p>
//               <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
//             </div>
//           </div>
//         </div>
//         <div className="flex w-full items-start justify-between">
//           <div className="w-4/5">
//             <p className="text-xs sm:text-base">مالیات بر ارزش افزوده</p>
//           </div>
//           <div className="w-1/5">
//             <div className="flex items-center justify-end gap-2">
//               <p className="text-xs sm:text-base">
//                 {/* @ts-ignore */}
//                 {(totalMapper[currentPlan] * 0.1).toLocaleString()}
//               </p>
//               <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
//             </div>
//           </div>
//         </div>
//         <div className="flex w-full items-start justify-between text-red-light">
//           <div className="w-4/5">
//             <p className="text-xs sm:text-base">تخفیف</p>
//           </div>
//           <div className="w-1/5">
//             <div className="flex items-center justify-end gap-2">
//               <p className="text-xs sm:text-base">{totalDiscount}</p>
//               <TomanIcon width="30px" height="30px" fillColor="#f43f5e" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="mt-10 w-full">
//         <p className="font-semibold">کد تخفیف دارید؟</p>
//         <div className="mt-5 flex w-full flex-col justify-between sm:flex-row">
//           <div className="w-full rounded-xl p-2 text-sm transition-all hover:scale-105 sm:w-2/5">
//             <Input
//               type="text"
//               variant="flat"
//               onChange={(e) => setDiscountCode(e.target.value)}
//               size="lg"
//               placeholder="کد خود را وارد کنید ..."
//               className="text-sm"
//             />
//           </div>
//           <div className="mt-5 w-1/2 content-center sm:mt-0 sm:w-1/5">
//             <Button onClick={applyDiscountCode} className="w-full">
//               اعمال کد
//             </Button>
//           </div>
//         </div>
//       </div>
//       <hr className=" text-slate-300 mb-10 mt-10 w-full" />
//       <div className="flex w-full flex-col items-center justify-between sm:flex-row">
//         <h4>مجموع قابل پرداخت</h4>
//         <div className="flex items-center justify-end gap-2">
//           {/* @ts-ignore */}
//           <h4>{totalPrice.toLocaleString()}</h4>
//           <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
//         </div>
//       </div>
//
//       <Button onClick={handlePayment} className="mt-5 w-full">
//         تایید و پرداخت
//       </Button>
//     </div>
//   );
// };


'use client';

import { Dispatch, ReactElement, useEffect, useState } from 'react';
import cn from '@/utils/class-names';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { RadioGroup } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useRouter } from 'next/navigation';
import HorizontalFormBlockWrapper from './horiozontal-block';
import {
  PiCheckBold,
  PiCheckCircleFill,
  PiDownloadSimpleBold,
  PiFire,
  PiLightning,
  PiPlusBold,
  PiStackSimple,
  PiWallet,
} from 'react-icons/pi';
import { AdvancedRadio } from '@/components/ui/advanced-radio';
import BillingHistoryTable from './billing-history/table';
import AddBillingCardModalView from './modal/add-billing-card';
import MasterCardIcon from '@/components/icons/mastercard';
import VisaIcon from '@/components/icons/visa';
import ApplePayIcon from '@/components/icons/apple-pay';
import { billingHistoryData } from '@/data/billing-history';
import { exportToCSV } from '@/utils/export-to-csv';
import { BiTestTube } from 'react-icons/bi';
import { FaCheckCircle } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { SetStateAction } from 'jotai';
import mellat from 'public/mellat.png';
import zarinPal from 'public/zarinPal.webp';
import Image from 'next/image';
import TomanIcon from '@/components/toman/tomanIcon';
import { Input, Loader } from 'rizzui';
import { BsCreditCard } from 'react-icons/bs';
import axiosInstance from '@/utils/axios-instance';
import toast from 'react-hot-toast';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';

interface Bundle {
  id: number;
  title: string;
  duration: number;
  price: number;
  features: string;
  bonusMonths: number | null;
  active: boolean;
  pageOrder: number;
}

interface ApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    bundles: Bundle[];
    subCategoryName: string;
    subCategoryId: number;
  };
  pagination: null;
}

const cardsOptions = [
  {
    icon: <BsCreditCard size={25} />,
    title: 'اعتبار کیف پول',
    default: true,
    value: 'credit',
    isIcon: true,
    disabled: false,
  },
  {
    icon: zarinPal,
    title: 'درگاه زرین پال',
    default: false,
    value: 'zarinPal',
    disabled: true,
  },
  {
    icon: mellat,
    title: 'درگاه بانک ملت',
    default: false,
    value: 'mellat',
    disabled: true,
  },
];

// @ts-ignore
export default function BillingSettingsView({ id }) {
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [plansOptions, setPlansOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchBundleData();
  }, [id]);

  const fetchBundleData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
          `${API_BASE_URL}/bundle/subcategory/${id}`
      );

      if (response.data.statusCode === 200) {
        setApiData(response.data.data);

        // Map bundles to plansOptions format
        if (response.data.data.bundles && response.data.data.bundles.length > 0) {
          const mappedPlans = response.data.data.bundles.map((bundle: Bundle, index: number) => {
            let icon = <PiLightning className="h-4 w-4 text-gray-900" />;
            let description = bundle.features.split(',').map((f: string) => f.trim()).join('، ');

            // Determine icon based on price or duration
            if (bundle.price === 0) {
              icon = <BiTestTube className="h-4 w-4 text-gray-900" />;
            } else if (bundle.duration <= 1) {
              icon = <PiFire className="h-4 w-4 text-gray-900" />;
            }

            return {
              icon,
              title: bundle.title,
              description,
              value: bundle.id.toString(),
              bundleId: bundle.id,
              price: bundle.price,
              duration: bundle.duration,
              bonusMonths: bundle.bonusMonths,
              isPopular: bundle.duration === 12 // Assuming yearly plans are popular
            };
          });

          setPlansOptions(mappedPlans);
          // Set the first plan as default
          if (mappedPlans.length > 0) {
            setCurrentPlan(mappedPlans[0].value);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch bundle data:', error);
      setError('خطا در بارگذاری اطلاعات');
      toast.error('خطا در بارگذاری اطلاعات باندل');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="xl" />
        </div>
    );
  }

  if (error || !apiData || !apiData.bundles || apiData.bundles.length === 0) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            {apiData?.subCategoryName ? `${apiData.subCategoryName}` : ''}
          </Text>
          <Text className="text-gray-500">
            {error || 'هیچ باندلی برای این زیرشاخه یافت نشد'}
          </Text>
        </div>
    );
  }

  return (
      <>
        <HorizontalFormBlockWrapper
            title={`انتخاب پلن ${apiData.subCategoryTitle}`}
            description="با توجه به نیاز خود پلن مورد نظر را برای استفاده از خدمات سایت انتخاب نمایید."
            descriptionClassName="max-w-md"
            childrenWrapperClassName="@3xl:grid-cols-1 max-w-5xl w-full"
        >
          <div>
            <CurrentPlans
                currentPlan={currentPlan}
                setCurrentPlan={setCurrentPlan}
                plansOptions={plansOptions}
            />
            <ul className="mt-10 text-gray-500">
              <li className="my-1 flex items-center gap-3 ">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                اختصاص یک سایت استاندارد ویژه با امکانات کامل (معرفی شرکت، عکس و
                مشخصات کالا یا خدمات و ...)
              </li>
              <li className="my-1 flex items-center gap-3">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                امکان اعمال تغییرات و مدیریت سایت استاندارد ویژه در هر لحظه و بدون
                مهارت فنی
              </li>
              <li className="my-1 flex items-center gap-3">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                حضور در صفحه اول گوگل در کمتر از یک ماه
              </li>
              <li className="my-1 flex items-center gap-3">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                بی نیاز از داشتن سایت اختصاصی و دغدغه نگهداری و هزینه های آن
              </li>
              <li className="my-1 flex items-center gap-3">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                ضمانت افزایش فروش کالا و خدمات شما
              </li>
              <li className="my-1 flex items-center gap-3">
                <PiCheckBold
                    className="flex-shrink-0 flex-grow-0 "
                    size={20}
                    color="#129974"
                />
                کمک به ارتقاء موقعیت شما نسبت به رقبا
              </li>
            </ul>
          </div>
        </HorizontalFormBlockWrapper>
        <ConfirmationCard
            currentPlan={currentPlan}
            plansOptions={plansOptions}
            subCategoryName={apiData.subCategoryName}
        />
        <TotalCard
            currentPlan={currentPlan}
            id={id}
            plansOptions={plansOptions}
        />
      </>
  );
}

export function CurrentPlans({
                               currentPlan,
                               setCurrentPlan,
                               plansOptions,
                             }: {
  currentPlan: string;
  setCurrentPlan: Dispatch<SetStateAction<string>>;
  plansOptions: any[];
}) {
  return (
      <RadioGroup
          value={currentPlan}
          setValue={setCurrentPlan}
          className="flex flex-col gap-5"
      >
        {plansOptions.map((plan, index) => (
            <AdvancedRadio
                key={`plan-${index}`}
                name="current_plans"
                value={plan.value}
                onChange={() => setCurrentPlan(plan.value)}
                checked={plan.value === currentPlan}
                className="flex flex-col space-y-2 rounded-xl border border-gray-300 p-5 text-sm hover:cursor-pointer hover:border-gray-900"
                inputClassName="[&:checked~span_div>.icon]:block [&:checked~span]:ring-1 [&:checked~span]:ring-offset-0 [&:checked~span]:ring-gray-900 [&:checked~span]:!border-gray-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  {plan.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Text
                        tag="h6"
                        className="mb-1 text-sm font-medium text-gray-900"
                    >
                      {plan.title}
                      {plan.isPopular && (
                          <Badge
                              variant="flat"
                              rounded="DEFAULT"
                              color="danger"
                              className="mr-2"
                          >
                            محبوب ترین{' '}
                          </Badge>
                      )}
                    </Text>
                    <PiCheckCircleFill className="icon hidden h-6 w-6 flex-shrink-0 text-gray-900" />
                  </div>
                  <Text className="text-gray-500">{plan.description}</Text>
                </div>
              </div>
            </AdvancedRadio>
        ))}
      </RadioGroup>
  );
}

export function CardDetails() {
  const [paymentMethod, setPaymentMethod] = useState('credit');

  return (
      <div>
        <div className="flex flex-col gap-4 xs:flex-row">
          {cardsOptions.map((cards, index) => (
              <AdvancedRadio
                  key={`cards-${index}`}
                  name="card_details"
                  onChange={() => setPaymentMethod(cards.value)}
                  defaultChecked={cards.value === paymentMethod}
                  value={cards.value}
                  disabled={cards.disabled}
                  className={cn(
                      'flex gap-3 rounded-xl border border-gray-300 p-5 text-sm',
                      cards.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:cursor-pointer hover:border-gray-900'
                  )}
                  inputClassName="[&:checked~span_div>.icon]:block [&:checked~span]:ring-1 [&:checked~span]:ring-offset-0 [&:checked~span]:ring-gray-900 [&:checked~span]:!border-gray-900"
              >
                <div className="flex items-center justify-center">
                  <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md px-2 py-1.5">
                    {/*// @ts-ignore*/}
                    {cards.isIcon ? (
                        <>{cards.icon}</>
                    ) : (
                        <Image src={cards.icon} alt="" />
                    )}
                  </div>
                  <div className="block">
                    <Text tag="h6" className="mb-1 text-sm font-medium">
                      {cards.title}
                    </Text>
                  </div>
                </div>
                {cards.value === paymentMethod ? (
                    <PiCheckCircleFill className="icon ms-auto h-6 w-6 flex-shrink-0 text-gray-900" />
                ) : (
                    <div className="relative ms-auto flex h-5 w-5 items-center justify-center rounded-full border border-gray-300"></div>
                )}
              </AdvancedRadio>
          ))}
        </div>
      </div>
  );
}

const ConfirmationCard = ({
                            currentPlan,
                            plansOptions,
                            subCategoryName,
                          }: {
  currentPlan: string;
  plansOptions: any[];
  subCategoryName: string;
}) => {
  const selectedPlan = plansOptions.find(plan => plan.value === currentPlan);

  if (!selectedPlan) return null;

  return (
      <div className="mt-5 flex w-full flex-col items-start justify-start rounded-xl border border-gray-200 bg-gray-0 p-2 shadow-xl dark:border-gray-300 dark:bg-gray-50 sm:p-6">
      <span className="flex items-center justify-center">
        <span className="ml-3 h-4 w-4 rounded-full bg-black" />
        <h4>تایید و پرداخت</h4>
      </span>

        <div className="mt-10 flex w-full flex-col">
          <div className="flex w-full justify-between pl-4 md:pl-24">
            <p>سفارش ها</p>
            <p>هزینه</p>
          </div>
          <div className="flex w-full justify-between">
            <div className="ml-2 mt-5 flex w-3/4 items-center gap-2 rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-4/5 md:ml-8 md:p-4 xl:p-6">
              <FaCheckCircle
                  size={20}
                  style={{ flexShrink: '0' }}
                  color="#10b981"
              />
              <p className="flex gap-1 text-xs md:text-base">
                خرید {selectedPlan.title} {subCategoryName}
              </p>
            </div>
            <div className="mt-5 flex w-1/4 items-center justify-center rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-1/5 md:p-4 xl:p-6">
              <p className="flex gap-1 text-xs md:text-base">
                {selectedPlan.price.toLocaleString()} تومان
              </p>
            </div>
          </div>
          {selectedPlan.bonusMonths && selectedPlan.bonusMonths > 0 && (
              <div className="flex w-full justify-between">
                <div className="ml-2 mt-5 flex w-3/4 items-center gap-2 rounded-xl bg-gray-100 p-3 text-gray-600 sm:w-4/5 md:ml-8 md:p-4 xl:p-6">
                  <FaCheckCircle
                      size={20}
                      style={{ flexShrink: '0' }}
                      color="#10b981"
                  />
                  <p className="flex gap-1 text-xs md:text-base">
                    {selectedPlan.bonusMonths} ماه اشتراک هدیه
                  </p>
                </div>

                <div className="mt-5 flex w-1/4 items-center justify-center rounded-xl  bg-gray-100 p-3 text-gray-600 sm:w-1/5 md:p-4 xl:p-6">
                  <p className="flex gap-1 text-xs md:text-base">0 تومان</p>
                </div>
              </div>
          )}
        </div>
        <span className="mb-5 mt-10 flex items-center justify-center">
        <h4>درگاه و نوع پرداخت</h4>
      </span>
        <CardDetails />
      </div>
  );
};

const TotalCard = ({
                     currentPlan,
                     id,
                     plansOptions
                   }: {
  currentPlan: string;
  id: any;
  plansOptions: any[];
}) => {
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const router = useRouter();

  const selectedPlan = plansOptions.find(plan => plan.value === currentPlan);

  useEffect(() => {
    if (selectedPlan) {
      const basePrice = selectedPlan.price;
      const tax = basePrice * 0.1;
      const discountAmount = (basePrice * discount) / 100;
      setTotalPrice(basePrice + tax - discountAmount);
      setTotalDiscount(discountAmount);
    }
  }, [discount, currentPlan, selectedPlan]);

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoadingPayment(true);
    const createSubscription = async () => {
      const API_URL = API_ENDPOINTS.subscription;
      let data = {
        bundleId: selectedPlan.bundleId,
      };
      if (discountCode) {
        // @ts-ignore
        data['discountCode'] = discountCode;
      }
      try {
        const response = await axiosInstance.post(API_URL, data);

        if (response.data.statusCode === 200) {
          toast.success(response.data.message);
          return {
            data: response.data.data,
          };
        }
      } catch (error) {
        // @ts-ignore
        toast.error(error?.response?.data?.message || 'خطا در خرید اشتراک');
        console.error('Failed to buy subscription', error);
      }
    };
    let response = await createSubscription();
    setLoadingPayment(false)
    if (response?.data) router.push(`/bundle/subscription-list`);
  };

  const applyDiscountCode = async () => {
    const applyDiscount = async () => {
      const API_URL = API_ENDPOINTS.discount(discountCode);
      try {
        const response = await axiosInstance.post(API_URL, {});

        if (response.data.statusCode === 200) {
          toast.success(response.data.message);
          return {
            data: response.data.data,
          };
        } else {
          toast.error('کد تخفیف یافت نشد');
        }
      } catch (error) {
        // @ts-ignore
        toast.error(error?.response?.data?.message || 'کد تخفیف یافت نشد');
        console.error('Failed to apply discount code', error);
      }
    };
    let response = await applyDiscount();
    if (response?.data) setDiscount(response?.data);
  };

  if (!selectedPlan) return null;

  const basePrice = selectedPlan.price;
  const tax = basePrice * 0.1;

  return (
      <div className="mt-5 flex w-full flex-col items-start justify-start rounded-xl bg-gray-0 p-2 shadow-xl dark:bg-gray-50 sm:p-6">
      <span className="flex w-full items-center justify-start">
        <span className="ml-3 h-4 w-4 rounded-full bg-black" />
        <h4>فاکتور نهایی</h4>
      </span>

        <div className="mt-10 flex w-full flex-col gap-4">
          <div className="flex w-full items-start justify-between">
            <div className="w-4/5">
              <p className="text-xs sm:text-base">مجموع</p>
            </div>
            <div className="w-1/5">
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs sm:text-base">
                  {basePrice.toLocaleString()}
                </p>
                <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
              </div>
            </div>
          </div>
          <div className="flex w-full items-start justify-between">
            <div className="w-4/5">
              <p className="text-xs sm:text-base">مالیات بر ارزش افزوده</p>
            </div>
            <div className="w-1/5">
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs sm:text-base">
                  {tax.toLocaleString()}
                </p>
                <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
              </div>
            </div>
          </div>
          <div className="flex w-full items-start justify-between text-red-light">
            <div className="w-4/5">
              <p className="text-xs sm:text-base">تخفیف</p>
            </div>
            <div className="w-1/5">
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs sm:text-base">{totalDiscount.toLocaleString()}</p>
                <TomanIcon width="30px" height="30px" fillColor="#f43f5e" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 w-full">
          <p className="font-semibold">کد تخفیف دارید؟</p>
          <div className="mt-5 flex w-full flex-col justify-between sm:flex-row">
            <div className="w-full rounded-xl p-2 text-sm transition-all hover:scale-105 sm:w-2/5">
              <Input
                  type="text"
                  variant="flat"
                  onChange={(e) => setDiscountCode(e.target.value)}
                  size="lg"
                  placeholder="کد خود را وارد کنید ..."
                  className="text-sm"
              />
            </div>
            <div className="mt-5 w-1/2 content-center sm:mt-0 sm:w-1/5">
              <Button onClick={applyDiscountCode} className="w-full">
                اعمال کد
              </Button>
            </div>
          </div>
        </div>
        <hr className=" text-slate-300 mb-10 mt-10 w-full" />
        <div className="flex w-full flex-col items-center justify-between sm:flex-row">
          <h4>مجموع قابل پرداخت</h4>
          <div className="flex items-center justify-end gap-2">
            <h4>{totalPrice.toLocaleString()}</h4>
            <TomanIcon width="30px" height="30px" fillColor="#1e293b" />
          </div>
        </div>

        <Button isLoading={loadingPayment} disabled={loadingPayment} onClick={handlePayment} className="mt-5 w-full">
          تایید و پرداخت
        </Button>
      </div>
  );
};
