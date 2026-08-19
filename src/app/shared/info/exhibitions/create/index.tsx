'use client';

import { API_BASE_URL } from '@/config/api.config';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Text } from 'rizzui';
import FormNav, { formParts } from './form-nav';
import {
  defaultValues,
  exhibitionFormSchema,
  CreateEventInput,
} from '@/app/shared/info/exhibitions/create/form-utils';
import ProductMedia from '@/app/shared/info/exhibitions/create/product-media';
import PricingInventory from '@/app/shared/info/exhibitions/create/pricing-inventory';
import ProductIdentifiers from '@/app/shared/info/exhibitions/create/product-identifiers';
import ShippingInfo from '@/app/shared/info/exhibitions/create/shipping-info';
import ProductSeo from '@/app/shared/info/exhibitions/create/product-seo';
import DeliveryEvent from '@/app/shared/info/exhibitions/create/delivery-event';
import ProductVariants from '@/app/shared/info/exhibitions/create/product-variants';
import ProductTaxonomies from '@/app/shared/info/exhibitions/create/product-tags';
import FormFooter from '@/components/form-footer';
import cn from '@/utils/class-names';
import ExhibitionContact from './exhibition-contact';
import ExhibitionDescription from './exhibition-description';
import ExhibitionSummary from './exhibition-summary';
import ExhibitionGallery from './exhibition-gallery';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { data } from 'autoprefixer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {fetchSubscriptions} from "@/utils/fetch-subscriptions";

const MAP_STEP_TO_COMPONENT = {
  [formParts.intro]: ExhibitionSummary,
  [formParts.contact]: ExhibitionContact,
  [formParts.description]: ExhibitionDescription,
  [formParts.logo]: ExhibitionGallery,
};

interface IndexProps {
  id?: string;
  exhibition?: CreateEventInput;
  className?: string;
}

export default function CreateExhibition({
  id,
  exhibition,
  className,
}: IndexProps) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const _axios = useAxiosPrivate();
  const [exhibitionData, setExhibitionData] = useState<any | null>(null);
  const [resetAll, setResetAll] = useState(false);

  const methods = useForm<CreateEventInput>({
    defaultValues: defaultValues(exhibitionData),
    resolver: zodResolver(exhibitionFormSchema),
  });

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        const response = await _axios.get(`/service/${id}`);
        if (response.data.status === 'SUCCESS') {
          setExhibitionData(response.data.data);
          methods.reset(defaultValues(response.data.data));
        }
      } catch (error) {
        console.error('Error fetching exhibition:', error);
      }
    };

    if (id) {
      fetchExhibition();
    }
  }, [id, _axios]);

  // const fetchSubscriptions = async (subCategoryId: number) => {
  //   try {
  //     const response = await _axios.get(`/subscription/${subCategoryId}`);
  //     if (response.data.status === 'SUCCESS') {
  //       if (!response.data?.data) {
  //         toast.success(
  //           <div>
  //             <Text tag="b">{'اطلاعات شما به طور موقت ثبت شد.\n\n'}</Text>
  //             <Text>
  //               {
  //                 'برای تایید نهایی و استفاده از خدمات سایت، لطفا اشتراک فعال جدیدی تهیه کنید.\n'
  //               }
  //             </Text>
  //             <Button
  //               className="mt-3"
  //               size="sm"
  //               onClick={() => console.log('DISMISS')}
  //             >
  //               خرید اشتراک
  //             </Button>
  //           </div>,
  //           { duration: 5000 }
  //         );
  //         router.replace('/bundle/buy');
  //       }
  //       return true;
  //     }
  //   } catch (error) {
  //     console.error('Error fetching subscription:', error);
  //     toast.error(
  //       <div>
  //         <Text tag="b">{'اطلاعات شما به طور موقت ثبت شد.\n\n'}</Text>
  //         <Text>
  //           {'اما هنگام دریافت وضعیت اشتراک شما، خطایی رخ داده است.\n' +
  //             'برای تایید نهایی و استفاده از خدمات سایت، لطفا اشتراک فعال جدیدی تهیه کنید.\n'}
  //         </Text>
  //         <Button
  //           className="mt-3"
  //           size="sm"
  //           onClick={() => console.log('DISMISS')}
  //         >
  //           خرید اشتراک
  //         </Button>
  //       </div>,
  //       { duration: 60000 }
  //     );
  //   }
  // };
  const onSubmit: SubmitHandler<CreateEventInput> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.title,
        subCategoryId: 24,
        serviceSchemaId: 16,
        serviceData: {
          fax: data.fax,
          tel: data.tel,
          logo: data.logo,
          type: data.type,
          title: data.title,
          venue: data.venue,
          address: data.address,
          country: data.country,
          endDate: data.endDate,
          website: data.website,
          category: data.category.value,
          keywords: data.keywords,
          organizer: data.organizer,
          startDate: data.startDate,
          description: data.description,
        },
        serviceAdditionalData: null,
        dataFileIds: data.dataFileIds,
        additionalDataFileIds: null,
      };

      // console.log('data: ', JSON.stringify(data));
      // console.log('payload: ', JSON.stringify(payload));

      const response = await _axios.post(
        `${API_BASE_URL}/service`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        // toast.success(
        //   <Text tag="b">
        //     {id ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'} موفقیت آمیز بود
        //   </Text>
        // );
        methods.reset();
        // router.push('/info/service');
        let hasSubscription = await fetchSubscriptions(24, _axios, router);
        if (hasSubscription) router.push('/info/service');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      toast.error('خطا در ارسال اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="@container">
      <FormNav />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn('[&_label.block>span]:font-medium', className)}
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 dark:divide-gray-300 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => (
              <Element
                key={key}
                name={formParts[key as keyof typeof formParts]}
              >
                {
                  <Component
                    resetAll={resetAll}
                    className="pt-7 @2xl:pt-9 @3xl:pt-11"
                  />
                }
              </Element>
            ))}
          </div>

          <FormFooter
            isLoading={isLoading}
            submitBtnText={id ? 'بروز رسانی نمایشگاه' : 'ثبت نمایشگاه'}
          />
        </form>
      </FormProvider>
    </div>
  );
}
