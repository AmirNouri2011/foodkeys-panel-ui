'use client';

import { API_BASE_URL } from '@/config/api.config';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import cn from '../../../../../../utils/class-names';
import { Text } from 'rizzui';
import FormNav, {
  formParts,
} from '../../../../info/food-industry/company/create/form-nav';
import CompanySummary from '@/app/shared/info/food-industry/company/create/company-summary';
import {
  defaultValues,
  companyFormSchema,
  CreateCompanyInput,
} from '@/app/shared/info/food-industry/company/create/form-utils';
import ProductMedia from '@/app/shared/info/food-industry/company/create/product-media';
import PricingInventory from '@/app/shared/info/food-industry/company/create/pricing-inventory';
import ProductIdentifiers from '@/app/shared/info/food-industry/company/create/product-identifiers';
import ShippingInfo from '@/app/shared/info/food-industry/company/create/shipping-info';
import ProductSeo from '@/app/shared/info/food-industry/company/create/product-seo';
import DeliveryEvent from '@/app/shared/info/food-industry/company/create/delivery-event';
import ProductVariants from '@/app/shared/info/food-industry/company/create/product-variants';
import ProductTaxonomies from '@/app/shared/info/food-industry/company/create/product-tags';
import FormFooter from '@/components/form-footer';
import CompanyFactory from '@/app/shared/info/food-industry/company/create/company-factory';
import CompanyOffice from '@/app/shared/info/food-industry/company/create/company-office';
import CompanySocial from '@/app/shared/info/food-industry/company/create/company-social';
import CompanyComplementary from '@/app/shared/info/food-industry/company/create/company-complementary';
import CompanyHistory from './company-history';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { z } from 'zod';
import CompanyGallery from '@/app/shared/info/food-industry/company/create/company-gallery';
import CompanyLocation from '@/app/shared/info/food-industry/company/create/company-location';
import { useRouter } from 'next/navigation';
import { createGlobalState } from 'react-use';
import { socialMediaConverter } from '@/utils/social-media-converter';
import { telConverter } from '@/utils/tel-converter';

const MAP_STEP_TO_COMPONENT = {
  [formParts.intro]: CompanySummary,
  [formParts.history]: CompanyHistory,
  [formParts.location]: CompanyLocation,
  [formParts.factory]: CompanyFactory,
  [formParts.office]: CompanyOffice,
  [formParts.social]: CompanySocial,
  [formParts.products]: ProductMedia,
  [formParts.gallery]: CompanyGallery,
  [formParts.supplementary]: CompanyComplementary,
  // [formParts.pricingInventory]: PricingInventory,
  // [formParts.productIdentifiers]: ProductIdentifiers,
  // [formParts.shipping]: ShippingInfo,
  // [formParts.seo]: ProductSeo,
  // [formParts.deliveryEvent]: DeliveryEvent,
  // [formParts.variantOptions]: ProductVariants,
  // [formParts.tagsAndCategory]: ProductTaxonomies,
};

interface Picture {
  id: string;
  fileExtension: string;
  fileName: string;
  filePath: string;
  permanent: boolean;
  fileSize: number;
  contentType: string;
  fileCategory: string | null;
  userId: number | null;
  createdAt: number[];
  updatedAt: number[];
  createdAtStr: string | null;
  updatedAtStr: string | null;
  productId: number | null;
}

interface Product {
  id: number;
  name: string;
  type: number;
  categoryType: number;
  companyId: number | null;
  description: string | null;
  createdAt: number[];
  createdAtStr: string | null;
  updatedAt: number[];
  updatedAtStr: string | null;
  pictures: Picture[];
  outsourced: boolean;
  machineUsage: boolean;
  showProduct: boolean;
}

interface Location {
  officeLocation: string;
  factoryLocation: string;
  officePoBox: string;
  factoryPoBox: string;
  officeState: string;
  officeCity: string;
  factoryState: string;
  factoryCity: string;
  industrialCity: string;
  country: string;
  factoryLongitude?: number;
  factoryLatitude?: number;
  officeLongitude?: number;
  officeLatitude?: number;
}

export interface Company {
  createdAt: string | null;
  updatedAt: string | null;
  id: number;
  companyName: string;
  companyNameEn: string;
  ceo: string;
  owner: string;
  answerName: string;
  history: string;
  visit: number;
  ranking: number | null;
  rankingAll: number;
  buildingArea: string;
  landArea: string;
  holding: string;
  description: string;
  advertisingSlogan: string;
  employeesCount: string;
  companyType: string;
  backgroundImage: string;
  logo: string;
  subjectOfActivity: string;
  establishDate: number[];
  registrant: string;
  registrantUsername: string;
  registrantPhone: string;
  registrantTel: string;
  rawMaterialsOrigin: string;
  record: string;
  keyWords: string;
  tags: string;
  companyKeyWords: string[];
  companyTags: string[];
  companyBrands: string | null;
  primaryBrand: string | null;
  mainBrandEn: string | null;
  category: string;
  categoryId: number;
  subCategory: string;
  subCategoryId: number;
  relatedIndustries: string[];
  mainIndustry: string | null;
  companyStatus: string;
  userId: number | null;
  parentCompanyId: number | null;
  socialMedias: any[];
  contacts: any[];
  subCompanies: any[];
  metadata: any | null;
  products: Product[];
  location: Location;
}
interface IndexProps {
  id?: string;
  company?: Company;
  className?: string;
  category: number;
}

export default function CreateCompany({
  id,
  className,
  category = 1,
}: IndexProps) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState();
  const _axios = useAxiosPrivate();
  const [companyData, setCompanyData] = useState<Company | null>(null); // Company data

  const methods = useForm<Company>({
    defaultValues: defaultValues(companyData),
    resolver: zodResolver(companyFormSchema),
  });
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await _axios.get(`/client/panel/company/${id}`);
        if (response.data.status === 'SUCCESS') {
          setCompanyData(response.data.data);
          methods.reset(defaultValues(response.data.data));
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, _axios]);

  // const onSubmit: SubmitHandler<CreateCompanyInput> = async (data) => {
  //   setLoading(true);
  //   const fetchSubscriptions = async (subCategoryId: number) => {
  //     try {
  //       const response = await _axios.get(`/subscription/${subCategoryId}`);
  //       if (response.data.status === 'SUCCESS') {
  //         if (!response.data?.data) router.replace('/bundle/buy');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching subcategories:', error);
  //     }
  //   };
  //   await fetchSubscriptions(data.subcategory?.value);
  //   setTimeout(() => {
  //     setLoading(false);
  //     console.log('product_data', data);

  //     toast.success(
  //       <Text tag="b">
  //         {id ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'} موفقیت آمیز بود
  //       </Text>
  //     );
  //     methods.reset();
  //   }, 600);
  // };
  const fetchSubscriptions = async (subCategoryId: number) => {
    try {
      const response = await _axios.get(`/subscription/${subCategoryId}`);
      if (response.data.status === 'SUCCESS') {
        if (!response.data?.data) router.replace('/bundle/buy');
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };
  const onSubmit: SubmitHandler<CreateCompanyInput> = async (data) => {
    setLoading(true);
    const computeDataFileIds = (products) => {
      return products.reduce((acc: string[], product) => {
        if (product.pictures && Array.isArray(product.pictures)) {
          acc.push(...product.pictures);
        }
        return acc.map;
      }, []);
    };
    // let dataFileIds = computeDataFileIds(data?.products || []);
    let dataFileIds = [];
    try {
      const socialMedias = socialMediaConverter({
        telegramPhoneNo: data.telegramPhoneNo,
        telegramId: data.telegramId,
        whatsAppPhoneNo: data.whatsAppPhoneNo,
        whatsAppId: data.whatsAppId,
        instagramId: data.instagramId,
        linkedInId: data.linkedInId,
        eitaaPhoneNo: data.eitaaPhoneNo,
        rubikaPhoneNo: data.rubikaPhoneNo,
        smsNumber: data.smsNumber,
        hotlineNumber: data.hotlineNumber,
        skypeId: data.skypeId,
        website: data.website,
        emails: data.emails,
      });

      let tels: any[] = [];
      tels = tels.concat(
        data.factoryTels || [],
        data.factoryFaxes || [],
        data.officeTels || [],
        data.officeFaxes || []
      );

      const location = {
        officeLocation: data.officeLocation,
        factoryLocation: data.factoryLocation,
        factoryCity: data.factoryCity,
        factoryState: data.factoryState,
        officeState: data.officeState,
        officeCity: data.officeCity,
        country: data.country || 'ایران',
        industrialCity: data.industrialCity,
        factoryPoBox: data.factoryPoBox,
        officePoBox: data.officePoBox,
        factoryLongitude: data.factoryLongitude,
        factoryLatitude: data.factoryLatitude,
        officeLongitude: data.officeLongitude,
        officeLatitude: data.officeLatitude,
      };

      const transformedData = {
        companyName: data.companyName,
        companyNameEn: data.companyNameEn,
        companyStakeHolders: data.companyStakeHolders,
        ceo: data.ceo,
        ceoPhoneNumber: data.ceoPhoneNumber,
        owner: data.owner,
        history: data.history,
        description: data.description,
        advertisingSlogan: data.advertisingSlogan,
        companyType: data.companyType?.value,
        companyTypeOther: data.companyTypeOther,
        subjectOfActivity: data.subjectOfActivity,
        subCategoryId: data.subcategory?.value,
        establishDate: data.establishDate,
        tags: data.companyTags,
        keywords: data.companyKeyWords,
        brands: data.brands,
        socialMedias: socialMedias,
        contacts: data.contacts,
        logo: data.logo,
        tels: tels,
        location: location,
        employeesCount: data.employeesCount,
        buildingArea: data.buildingArea,
        answerName: data.answerName,
        holding: data.holding,
        landArea: data.landArea,
        productAvailability: data.productAvailability,
      };

      data.products = [...data.products, ...data.outSourcedProducts];
      const productData = data.products
        ? data.products.map((product) => ({
            name: product.name,
            type: product.type,
            description: product.description,
            machineUsage: product.machineUsage,
            outsourced: product.outsourced,
            pictures: product.pictures,
            uploadedFileIds: product.uploadedFileIds,
            removedFileIds: product.removedFileIds,
          }))
        : [];

      const productsDataObject = productData;

      // const productFileIds = productData.reduce((acc: string[], p: any) => {
      //   if (p.pictures && Array.isArray(p.pictures)) {
      //     acc.push(...p.pictures);
      //   }
      //   return acc;
      // }, []);

      const formData = new FormData();

      formData.append('jsonData', JSON.stringify(transformedData));
      formData.append('productsData', JSON.stringify(productsDataObject));
      // formData.append('productFileIds', JSON.stringify(productFileIds));

      if (data.logo) formData.append('COMPANY_LOGO', data.logo);

      if (data.backgroundImages && data.backgroundImages.length > 0) {
        data.backgroundImages.forEach((imgFile: File) => {
          formData.append('COMPANY_BACKGROUND_IMAGE', imgFile);
        });
      }

      if (data.companyDocuments && data.companyDocuments.length > 0) {
        data.companyDocuments.forEach((docFile: File) => {
          formData.append('COMPANY_DOCUMENT', docFile);
        });
      }

      if (data.companyLicenses && data.companyLicenses.length > 0) {
        data.companyLicenses.forEach((licenseFile: File) => {
          formData.append('COMPANY_LICENSE', licenseFile);
        });
      }

      if (data.companyCertificates && data.companyCertificates.length > 0) {
        data.companyCertificates.forEach((certFile: File) => {
          formData.append('COMPANY_CERTIFICATE', certFile);
        });
      }

      if (data.gallery)
        formData.append('GALLERY', JSON.stringify(data.gallery));

      console.log('productsData: ', JSON.stringify(productsDataObject));
      // console.log('dataFileIds: ', JSON.stringify(dataFileIds));
      console.log('companyJsonData: ', formData.get('jsonData'));
      console.log('Logo: ', formData.get('COMPANY_LOGO'));
      console.log(
        `Background Images: `,
        formData.getAll('COMPANY_BACKGROUND_IMAGE')
      );
      console.log(`Company Documents: `, formData.getAll('COMPANY_DOCUMENT'));
      console.log(`Company Licenses: `, formData.getAll('COMPANY_LICENSE'));
      console.log(`Gallery: `, formData.getAll('GALLERY'));
      console.log(
        `Company Certificates: `,
        formData.getAll('COMPANY_CERTIFICATE')
      );
      // console.log('productFileIds: ', formData.get('productFileIds'));

      const response = await _axios.post(
        `${API_BASE_URL}/company/form`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          <Text tag="b">
            {id ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'} موفقیت آمیز بود
          </Text>
        );
        await fetchSubscriptions(data.subcategory?.value);
        methods.reset();
      }
      console.log(data);
      console.log(transformedData);
    } catch (error) {
      console.error('Error submitting the form:', error);
      toast.error('خطا در ارسال اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // const onSubmit: SubmitHandler<CreateCompanyInput> = async (data) => {
  //   setLoading(true);

  //   try {
  //     const socialMedias = socialMediaConverter({
  //       telegramPhoneNo: data.telegramPhoneNo,
  //       telegramId: data.telegramId,
  //       whatsAppPhoneNo: data.whatsAppPhoneNo,
  //       whatsAppId: data.whatsAppId,
  //       instagramId: data.instagramId,
  //       linkedInId: data.linkedInId,
  //       eitaaPhoneNo: data.eitaaPhoneNo,
  //       rubikaPhoneNo: data.rubikaPhoneNo,
  //       smsNumber: data.smsNumber,
  //       hotlineNumber: data.hotlineNumber,
  //       skypeId: data.skypeId,
  //       website: data.website,
  //       emails: data.emails
  //     })

  //     let tels: any[] = []
  //     tels = tels.concat(data.factoryTels, data.factoryFaxes, data.officeTels, data.officeFaxes)
  //     const location = {
  //       officeLocation: data.officeLocation,
  //       factoryLocation: data.factoryLocation,
  //       factoryCity: data.factoryCity,
  //       factoryState: data.factoryState,
  //       officeState: data.officeState,
  //       officeCity: data.officeCity,
  //       // @ts-ignore
  //       country: data.country || "ایران",
  //       industrialCity: data.industrialCity,
  //       factoryPoBox: data.factoryPoBox,
  //       officePoBox: data.officePoBox
  //     }
  //     const transformedData = {
  //       companyName: data.companyName,
  //       companyNameEn: data.companyNameEn,
  //       companyStakeHolders: data.companyStakeHolders,
  //       ceo: data.ceo,
  //       ceoPhoneNumber: data.ceoPhoneNumber,
  //       owner: data.owner,
  //       history: data.history,
  //       description: data.description,
  //       advertisingSlogan: data.advertisingSlogan,
  //       companyType: data.companyType?.value, //data.companyType,
  //       companyTypeOther: data.companyTypeOther,
  //       subjectOfActivity: data.subjectOfActivity,
  //       subCategoryId: data.subcategory?.value,
  //       establishDate: data.establishmentDate,
  //       tags: data.companyTags,
  //       keywords: data.companyKeyWords,
  //       brands: data.brands,
  //       socialMedias: socialMedias,
  //       contacts: data.contacts,
  //       logo: data.logo,
  //       // stakeholders: data.stakeholders,
  //       tels: tels,
  //       location: location,
  //       employeesCount: data.employeesCount,
  //       // subCompanyIds: data.subCompanyIds,
  //       buildingArea: data.buildingArea,
  //       answerName: data.answerName,
  //       holding: data.holding,
  //       landArea: data.landArea,
  //       // parentCompanyId: data.parentCompanyId,
  //     };
  //     const productData = {
  //       products: data.products,
  //     }
  //     //
  //     const formData = new FormData();
  //     formData.append("jsonData", JSON.stringify(transformedData));

  //     if (data.logo) formData.append("COMPANY_LOGO", data.logo);

  //     if (data.backgroundImages) formData.append("COMPANY_BACKGROUND_IMAGE", data.backgroundImages);

  //     if (data.companyDocuments) formData.append("COMPANY_DOCUMENT", data.companyDocuments);

  //     if (data.companyLicenses) formData.append("COMPANY_LICENSE", data.companyLicenses);

  //     if (data.companyCertificates) formData.append("COMPANY_CERTIFICATE", data.companyCertificates);

  //     console.log("productsData: " + JSON.stringify(productData));
  //     console.log("companyJsonData: " + formData.get("jsonData"))
  //     console.log("Logo: " + formData.get("COMPANY_LOGO"))
  //     console.log(`Background Images (length = ${data.backgroundImags?.length || 0}): ` + formData.getAll("COMPANY_BACKGROUND_IMAGE"));
  //     console.log(`Company Documents (length = ${data.companyDocuments?.length || 0}): ` + formData.getAll("COMPANY_DOCUMENTS"));
  //     console.log(`Company Licenses (length = ${data.companyLicenses?.length || 0}): ` + formData.getAll("COMPANY_LICENSES"));
  //     console.log(`Company Certificates (length = ${data.companyCertificates?.length || 0}): ` + formData.getAll("COMPANY_CERTIFICATES"));

  //     const response = await _axios.post(
  //         "/company/form",
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //     );

  //     if (response.status === 200) {
  //       toast.success(
  //           <Text tag="b">
  //             {id ? "بروزرسانی اطلاعات" : "ثبت اطلاعات"} موفقیت آمیز بود
  //           </Text>
  //       );
  //       methods.reset();
  //     }
  //     console.log(data)
  //     console.log(transformedData)
  //   } catch (error) {
  //     console.error("Error submitting the form:", error);
  //     toast.error("خطا در ارسال اطلاعات");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
                    className="pt-7 @2xl:pt-9 @3xl:pt-11"
                    category={category}
                  />
                }
              </Element>
            ))}
          </div>

          <FormFooter
            isLoading={isLoading}
            submitBtnText={id ? 'بروز رسانی شرکت' : 'ثبت شرکت'}
          />
        </form>
      </FormProvider>
    </div>
  );
}
