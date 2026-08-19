'use client';

import { API_BASE_URL } from '@/config/api.config';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import cn from '../../../../../../utils/class-names';
import { Button, Text } from 'rizzui';
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
import CompanyPortalCooperation from '@/app/shared/info/food-industry/company/create/company-portal-cooperation';
import CompanyHistory from './company-history';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { z } from 'zod';
import CompanyGallery from '@/app/shared/info/food-industry/company/create/company-gallery';
import { useRouter } from 'next/navigation';
import { createGlobalState } from 'react-use';
import { socialMediaConverter } from '@/utils/social-media-converter';
import { telConverter } from '@/utils/tel-converter';
import { routes } from '@/config/routes';
import Link from 'next/link';
import CompanyLocation from "@/app/shared/info/food-industry/company/create/company-location";
import {
  prepareCompanyDataWithGallery,
  prepareGalleryFilesForSubmission
} from "@/app/shared/info/food-industry/company/create/galleryTransformUtils";
import {ensureSeconds} from "@/utils/date-util";
import Spinner from "@/components/ui/spinner";
import {AiOutlineCheckCircle} from "react-icons/ai";

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
  [formParts.portalCooperation]: CompanyPortalCooperation,
  // [formParts.pricingInventory]: PricingInventory,
  // [formParts.productIdentifiers]: ProductIdentifiers,
  // [formParts.shipping]: ShippingInfo,
  // [formParts.seo]: ProductSeo,
  // [formParts.deliveryEvent]: DeliveryEvent,
  // [formParts.variantOptions]: ProductVariants,
  // [formParts.tagsAndCategory]: ProductTaxonomies,
};

export interface TelDTO {
  /** e.g. 'FACTORY_PHONE' | 'FACTORY_FAX' | 'OFFICE_PHONE' | 'OFFICE_FAX' */
  type: string
  number: string
}

/** A single contact person */
export interface ContactDTO {
  id?: number
  name: string
  position?: string
  email?: string
  phoneNumber?: string
  // …add any other fields you expect
}

/** A company stakeholder (e.g. board member, investor) */
export interface StakeholderDTO {
  id?: number
  name: string
  share?: string   // e.g. percentage
}

/** Social link or handle */
export interface SocialMediaDTO {
  /** platform key, e.g. 'Telegram'|'WhatsApp'|'Instagram'|… */
  platform: string
  /** the ID/username/URL/phone associated */
  value: string
}

/** A saved brand */
export interface BrandDTO {
  id?: number
  name: string
  logoUrl?: string
}

/** A single product entry */
export interface ProductDTO {
  id?: number
  name: string
  type: string
  description?: string
  machineUsage?: string
  outsourced: boolean
  pictures: string[]           // file-ID strings or URLs
  uploadedFileIds?: string[]   // newly added files
  removedFileIds?: string[]    // files to delete on update
}

/** One gallery file (image/document) */
export interface GalleryFileDTO {
  id?: number
  url: string
  title?: string
  description?: string
}

/** An activity or event tied to the company */
export interface CreateActivityDTO {
  id?: number
  title: string
  description?: string
  date: string      // ISO date string
}

/** Geographical / address details */
export interface LocationDTO {
  officeLocation?: string
  factoryLocation?: string
  officeCity?: string
  officeState?: string
  factoryCity?: string
  factoryState?: string
  industrialCity?: string
  country?: string
  officePoBox?: string
  factoryPoBox?: string
  latitude?: number
  longitude?: number
  commonName?: string
  fullAddress?: string
  factoryLongitude?: number
  factoryLatitude?: number
  officeLongitude?: number
  officeLatitude?: number
}

// --- main payload DTO ---

export interface CompanyCreateDTO {
  id?: number
  companyName: string
  companyNameEn?: string
  companyType?: string
  companyTypeOther?: string
  ceo?: string
  ceoPhoneNumber?: string
  owner?: string
  adminComment?: string
  answerName?: string
  history?: string
  description?: string
  advertisingSlogan?: string
  establishDate?: string
  subjectOfActivity?: string
  rawMaterialsOrigin?: string
  landArea?: string
  buildingArea?: string
  companyStakeholders?: string
  employeesCount?: string
  productTitles?: string
  outSourcedProductTitles?: string
  productAvailability?: string
  hasPrivatePage?: boolean
  miniAppIframeSource?: string
  ranking?: number
  rankingAll?: number
  location?: LocationDTO
  companyKeyWords?: string[]
  companyTags?: string[]
  brands?: BrandDTO[]
  primaryBrand?: string
  mainBrandEn?: string
  factoryTels?: TelDTO[]
  factoryFaxes?: TelDTO[]
  officeTels?: TelDTO[]
  officeFaxes?: TelDTO[]
  contacts?: ContactDTO[]
  stakeholders?: StakeholderDTO[]
  products?: ProductDTO[]
  outSourcedProducts?: ProductDTO[]
  socialMedias?: SocialMediaDTO[]
  galleryFiles?: GalleryFileDTO[]
  activities?: CreateActivityDTO[]
  userId?: number
  subCategoryId?: number
  parentCompanyId?: number
  subCompanyIds?: number[]
  telegramId?: string
  telegramPhoneNo?: string
  whatsAppId?: string
  whatsAppPhoneNo?: string
  instagramId?: string
  linkedInId?: string
  skypeId?: string
  eitaaPhoneNo?: string
  rubikaPhoneNo?: string
  website?: string
  emails?: string[]
  smsNumber?: string
  hotlineNumber?: string
  specialLineNumber?: string
  logo?: string            // URL or ID returned from upload
  backgroundImage?: string // URL or ID returned from upload
  latitude?: number
  longitude?: number
  commonName?: string
  fullAddress?: string
  status?: number
  acceptInternViaPortal?: boolean | null
  timelyInfoUpdate?: boolean | null
  sendRelatedNewsToPortal?: boolean | null
  acceptStudentGroupVisit?: boolean | null
}

// --- your React form input (with File uploads) ---

export interface CreateCompanyInput {
  // all the same string/number/boolean fields as CompanyCreateDTO…
  companyName: string
  companyNameEn?: string
  companyType?: { value: string; label: string }
  companyTypeOther?: string
  ceo?: string
  ceoPhoneNumber?: string
  owner?: string
  adminComment?: string
  answerName?: string
  history?: string
  description?: string
  advertisingSlogan?: string
  establishDate?: string
  subjectOfActivity?: string
  rawMaterialsOrigin?: string
  landArea?: string
  buildingArea?: string
  companyStakeHolders?: string
  employeesCount?: string
  productTitles?: string
  outSourcedProductTitles?: string
  productAvailability?: string
  hasPrivatePage?: boolean
  miniAppIframeSource?: string
  ranking?: number
  rankingAll?: number
  officeLocation?: string
  factoryLocation?: string
  officeCity?: string
  officeState?: string
  factoryCity?: string
  factoryState?: string
  industrialCity?: string
  country?: string
  officePoBox?: string
  factoryPoBox?: string
  latitude?: number
  longitude?: number
  commonName?: string
  fullAddress?: string

  companyKeyWords?: string[]
  companyTags?: string[]
  brands?: BrandDTO[]
  primaryBrand?: string
  mainBrandEn?: string

  factoryTels?: string[]
  factoryFaxes?: string[]
  officeTels?: string[]
  officeFaxes?: string[]

  contacts?: ContactDTO[]
  stakeholders?: StakeholderDTO[]

  products?: ProductInput[]
  outSourcedProducts?: ProductInput[]

  telegramId?: string
  telegramPhoneNo?: string
  whatsAppId?: string
  whatsAppPhoneNo?: string
  instagramId?: string
  linkedInId?: string
  skypeId?: string
  eitaaPhoneNo?: string
  rubikaPhoneNo?: string
  website?: string
  emails?: string[]
  smsNumber?: string
  hotlineNumber?: string
  specialLineNumber?: string

  // file uploads
  logo?: File
  backgroundImages?: File[]
  companyDocuments?: File[]
  companyLicenses?: File[]
  companyCertificates?: File[]

  // gallery as DTOs (after upload you’ll have IDs/URLs)
  gallery?: GalleryFileDTO[]

  subcategory?: { value: number; label: string }
  userId?: number
  parentCompanyId?: number
  subCompanyIds?: number[]
  activities?: CreateActivityDTO[]
}

/** You’ll often want to shape your form-product object separately */
export interface ProductInput {
  id?: number
  name: string
  type?: string
  description?: string
  machineUsage?: string
  outsourced?: boolean
  pictures?: string[]            // existing file IDs
  uploadedFileIds?: string[]     // newly added
  removedFileIds?: string[]      // to delete
}
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
  acceptInternViaPortal?: boolean | null;
  timelyInfoUpdate?: boolean | null;
  sendRelatedNewsToPortal?: boolean | null;
  acceptStudentGroupVisit?: boolean | null;
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
  const [isFetching, setFetching] = useState(false);
  const methods = useForm<Company>({
    defaultValues: defaultValues(companyData),
    resolver: zodResolver(companyFormSchema),
  });
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setFetching(true);
        const response = await _axios.get(`/company/${id}`);
        if (response.data.status === 'SUCCESS') {
          const preparedData = prepareCompanyDataWithGallery(response.data.data);
          setCompanyData(preparedData);
          methods.reset(defaultValues(preparedData));
        }
      } catch (error) {
        toast.error("خطا در دریافت اطلاعات شرکت", {duration: 3000})
        console.error('Error fetching company:', error);
      } finally {
        setFetching(false);
    }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, _axios]);

  if (id && isFetching) {
    return (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Spinner size="xl" />
        </div>
    );
  }
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
      const response = await _axios.get(`/subscription/subcategory/${subCategoryId}?status=ACTIVE`);
      if (response.data.status === 'SUCCESS') {
        if (!response.data?.data || !response.data?.data?.length) {
          toast.success(
            <div>
              <Text tag="b">{'اطلاعات شما به طور موقت ثبت شد.\n\n'}</Text>
              <Text>
                {
                  'برای تایید نهایی و استفاده از خدمات سایت، لطفا اشتراک فعال جدیدی تهیه کنید.\n'
                }
              </Text>
              <Link href={`/bundle/${subCategoryId}/buy`}>
                <Button
                  className="mt-3"
                  size="sm"
                  // onClick={() => router.replace()}
                >
                  خرید اشتراک
                </Button>
              </Link>
            </div>,
            { duration: 5000 }
          );
          // toast.custom((t) => (
          //   <div
          //     className={`${
          //       t.visible ? 'animate-enter' : 'animate-leave'
          //     } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
          //   >
          //     <div className="w-0 flex-1 p-4">
          //       <div className="flex items-start">
          //         <div className="flex-shrink-0 pt-0.5">
          //           <img
          //             className="h-10 w-10 rounded-full"
          //             src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
          //             alt=""
          //           />
          //         </div>
          //         <div className="ml-3 flex-1">
          //           <p className="text-sm font-medium text-gray-900">
          //             Emilia Gates
          //           </p>
          //           <p className="mt-1 text-sm text-gray-500">
          //             Sure! 8:30pm works great!
          //           </p>
          //         </div>
          //       </div>
          //     </div>
          //     <div className="flex border-l border-gray-200">
          //       <button
          //         onClick={() => toast.dismiss(t.id)}
          //         className="text-indigo-600 hover:text-indigo-500 focus:ring-indigo-500 flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium focus:outline-none focus:ring-2"
          //       >
          //         Close
          //       </button>
          //     </div>
          //   </div>
          // ));
          router.replace(`/bundle/${subCategoryId}/buy`);
        } else {
          // toast.success(
          //   <>
          //     <Text tag="b">
          //       {id ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'} موفقیت آمیز بود
          //     </Text>
          //     <Text>{'\n'}</Text>
          //     <Text>
          //       بعد از تایید اطلاعات ثبت شده، شرکت شما در سایت بروزرسانی می‌شود
          //     </Text>
          //   </>
          // );
          toast.success(
              <div
                  dir="rtl"
                  className="
        bg-emerald-lightest p-4 rounded-lg shadow
        text-right
      "
              >
                <div className="flex items-center gap-2 mb-1">
                  {/*<AiOutlineCheckCircle className="text-emerald" size={20} />*/}
                  <Text as="strong" className="text-emerald-dark text-lg">
                    {id ? "بروزرسانی اطلاعات" : "ثبت اطلاعات"} موفقیت‌آمیز بود
                  </Text>
                </div>
                <Text className="text-gray-600 text-sm">
                  بعد از تایید اطلاعات ثبت‌شده، شرکت شما در سایت بروزرسانی می‌شود
                </Text>
              </div>,
              {
                position: "top-center",   // for RTL languages :contentReference[oaicite:7]{index=7}
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                hideProgressBar: false,
                // icon: false            // we render our own icon
              }
          );
          router.replace(`/info/food-industry`)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const mapPictures = (pictures) => {
    if (!pictures || !Array.isArray(pictures)) return [];
    return pictures.map(pic => {
      if (pic && typeof pic === 'object' && pic.id) {
        return pic.id;
      }
      return pic;
    });
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
      // const socialMedias = socialMediaConverter({
      //   telegramPhoneNo: data.telegramPhoneNo,
      //   telegramId: data.telegramId,
      //   whatsAppPhoneNo: data.whatsAppPhoneNo,
      //   whatsAppId: data.whatsAppId,
      //   instagramId: data.instagramId,
      //   linkedInId: data.linkedInId,
      //   eitaaPhoneNo: data.eitaaPhoneNo,
      //   rubikaPhoneNo: data.rubikaPhoneNo,
      //   smsNumber: data.smsNumber,
      //   hotlineNumber: data.hotlineNumber,
      //   skypeId: data.skypeId,
      //   website: data.website,
      //   emails: data.emails,
      // });
      //
      // let tels: any[] = [];
      // tels = tels.concat(
      //   data.factoryTels || [],
      //   data.factoryFaxes || [],
      //   data.officeTels || [],
      //   data.officeFaxes || []
      // );
      //
      // const location = {
      //   officeLocation: data.officeLocation,
      //   factoryLocation: data.factoryLocation,
      //   factoryCity: data.factoryCity,
      //   factoryState: data.factoryState,
      //   officeState: data.officeState,
      //   officeCity: data.officeCity,
      //   country: data.country || 'ایران',
      //   industrialCity: data.industrialCity,
      //   factoryPoBox: data.factoryPoBox,
      //   officePoBox: data.officePoBox,
      // };
      //
      // const transformedData = {
      //   companyName: data.companyName,
      //   companyNameEn: data.companyNameEn,
      //   companyStakeHolders: data.companyStakeHolders,
      //   ceo: data.ceo,
      //   ceoPhoneNumber: data.ceoPhoneNumber,
      //   owner: data.owner,
      //   history: data.history,
      //   description: data.description,
      //   advertisingSlogan: data.advertisingSlogan,
      //   companyType: data.companyType?.value,
      //   companyTypeOther: data.companyTypeOther,
      //   subjectOfActivity: data.subjectOfActivity,
      //   subCategoryId: data.subcategory?.value,
      //   establishDate: data.establishDate,
      //   tags: data.companyTags,
      //   keywords: data.companyKeyWords,
      //   brands: data.brands,
      //   socialMedias: socialMedias,
      //   contacts: data.contacts,
      //   tels: tels,
      //   location: location,
      //   employeesCount: data.employeesCount,
      //   buildingArea: data.buildingArea,
      //   answerName: data.answerName,
      //   holding: data.holding,
      //   landArea: data.landArea,
      //   productAvailability: data.productAvailability,
      //   productTitles: data.productTitles,
      //   productsDescription: data.productsDescription,
      //   outSourcedProductTitles: data.outSourcedProductTitles,
      //   outSourcedProductsDescription: data.outSourcedProductsDescription,
      // };
      //
      // if (data.products && data.products.length) {
      //   data.products.map((product: any) => {
      //     product['outsourced'] = false;
      //     return product;
      //   });
      // }
      // if (data.outSourcedProducts && data.outSourcedProducts.length) {
      //   data.outSourcedProducts.map((product: any) => {
      //     product['outsourced'] = true;
      //     return product;
      //   });
      // }
      // data.products = [...data.products, ...data.outSourcedProducts];
      // const productData = data.products
      //   ? data.products.map((product) => ({
      //       name: product.name,
      //       type: product.type || '',
      //       description: product.description,
      //       machineUsage: product.machineUsage,
      //       outsourced: product.outsourced,
      //       pictures: product.pictures,
      //       uploadedFileIds: product.uploadedFileIds,
      //       removedFileIds: product.removedFileIds,
      //     }))
      //   : [];
      //
      // const productsDataObject = productData;
      //
      // // const productFileIds = productData.reduce((acc: string[], p: any) => {
      // //   if (p.pictures && Array.isArray(p.pictures)) {
      // //     acc.push(...p.pictures);
      // //   }
      // //   return acc;
      // // }, []);
      //
      // const formData = new FormData();
      //
      // formData.append('jsonData', JSON.stringify(transformedData));
      // formData.append('productsData', JSON.stringify(productsDataObject));
      // // formData.append('productFileIds', JSON.stringify(productFileIds));
      //
      // if (data.logo) {
      //   formData.append('COMPANY_LOGO', data.logo);
      //   delete data.logo;
      // }
      //
      // if (data.backgroundImages && data.backgroundImages.length > 0) {
      //   data.backgroundImages.forEach((imgFile: File) => {
      //     formData.append('COMPANY_BACKGROUND_IMAGE', imgFile);
      //   });
      //   delete data.backgroundImages;
      // }
      //
      // if (data.companyDocuments && data.companyDocuments.length > 0) {
      //   data.companyDocuments.forEach((docFile: File) => {
      //     formData.append('COMPANY_DOCUMENT', docFile);
      //   });
      // }
      //
      // if (data.companyLicenses && data.companyLicenses.length > 0) {
      //   data.companyLicenses.forEach((licenseFile: File) => {
      //     formData.append('COMPANY_LICENSE', licenseFile);
      //   });
      // }
      //
      // if (data.companyCertificates && data.companyCertificates.length > 0) {
      //   data.companyCertificates.forEach((certFile: File) => {
      //     formData.append('COMPANY_CERTIFICATE', certFile);
      //   });
      // }
      //
      // if (data.gallery)
      //   formData.append('GALLERY', JSON.stringify(data.gallery));
      //
      // console.log('productsData: ', JSON.stringify(productsDataObject));
      // // console.log('dataFileIds: ', JSON.stringify(dataFileIds));
      // console.log('companyJsonData: ', formData.get('jsonData'));
      // console.log('Logo: ', formData.get('COMPANY_LOGO'));
      // console.log(
      //   `Background Images: `,
      //   formData.getAll('COMPANY_BACKGROUND_IMAGE')
      // );
      // console.log(`Company Documents: `, formData.getAll('COMPANY_DOCUMENT'));
      // console.log(`Company Licenses: `, formData.getAll('COMPANY_LICENSE'));
      // console.log(`Gallery: `, formData.get('GALLERY'));
      // console.log(
      //   `Company Certificates: `,
      //   formData.getAll('COMPANY_CERTIFICATE')
      // );
      // console.log('productFileIds: ', formData.get('productFileIds'));

      console.log(`Data: ${JSON.stringify(data)}`)
      const socialMedias: SocialMediaDTO[] = socialMediaConverter({
        telegramPhoneNo: data.telegramPhoneNo,
        telegramId: data.telegramId,
        whatsAppPhoneNo: data.whatsAppPhoneNo,
        whatsAppId: data.whatsAppId,
        instagramId: data.instagramId,
        linkedInId: data.linkedInId,
        eitaaPhoneNo: data.eitaaPhoneNo,
        rubikaPhoneNo: data.rubikaPhoneNo,
        skypeId: data.skypeId,
        website: data.website,
        emails: data.emails,
        smsNumber: data.smsNumber,
        hotlineNumber: data.hotlineNumber || data.specialLineNumber,
        specialLineNumber: data.specialLineNumber,
      })

      // 2. Pack all phone/fax arrays into TelDTO[]
      // const mapTels = (nums: string[] = [], type: TelType): TelDTO[] =>
      //     nums.map((n) => ({ type, number: n }))

      const factoryTels  = data.factoryTels // mapTels(data.factoryTels,  'FACTORY_PHONE')
      const factoryFaxes = data.factoryFaxes // mapTels(data.factoryFaxes, 'FACTORY_FAX')
      const officeTels   = data.officeTels // mapTels(data.officeTels,   'OFFICE_PHONE')
      const officeFaxes  = data.officeFaxes // mapTels(data.officeFaxes,  'OFFICE_FAX')

      // 3. LocationDTO
      const location: LocationDTO = {
        officeLocation: data.officeLocation,
        factoryLocation: data.factoryLocation,
        officeCity:      data.officeCity,
        officeState:     data.officeState,
        factoryCity:     data.factoryCity,
        factoryState:    data.factoryState,
        industrialCity:  data.industrialCity,
        country:         data.country || 'ایران',
        officePoBox:     data.officePoBox,
        factoryPoBox:    data.factoryPoBox,
        latitude:        data.latitude,
        longitude:       data.longitude,
        fullAddress:     data.fullAddress,
        commonName:      data.commonName,
        factoryLongitude: data.factoryLongitude,
        factoryLatitude: data.factoryLatitude,
        officeLongitude: data.officeLongitude,
        officeLatitude: data.officeLatitude,
      }

      // const products:   ProductDTO[] = (data.products || []).map(p => {({ ...p, outsourced: false, pictures: mapPictures(p.pictures) }))
      //
      // const outSourcedProducts: ProductDTO[] = (data.outSourcedProducts || []).map(p => ({ ...p, outsourced: true, pictures: mapPictures(p.pictures) }))
      const products: ProductDTO[] = (data.products || []).map(p => ({
        ...p,
        outsourced: false,
        pictures: mapPictures(p.pictures)
      }));

      const outSourcedProducts: ProductDTO[] = (data.outSourcedProducts || []).map(p => ({
        ...p,
        outsourced: true,
        pictures: mapPictures(p.pictures)
      }));

      console.log(`products: ${JSON.stringify(products)}`)

      console.log(`data.gallery: ${JSON.stringify(data?.gallery?.contacts || {})}`)
      // 5. Build the CompanyCreateDTO
      const companyDto: CompanyCreateDTO = {
        id:                 id ?? undefined,
        companyName:        data.companyName,
        companyNameEn:      data.companyNameEn,
        companyType:        data.companyType?.value,
        companyTypeOther:   data.companyTypeOther,
        ceo:                data.ceo,
        ceoPhoneNumber:     data.ceoPhoneNumber,
        owner:              data.owner,
        // adminComment:       data.adminComment,
        answerName:         data.answerName,
        history:            data.history,
        description:        data.description,
        advertisingSlogan:  data.advertisingSlogan,
        establishDate:      ensureSeconds(data.establishDate),
        subjectOfActivity:  data.subjectOfActivity,
        rawMaterialsOrigin: data.rawMaterialsOrigin,
        landArea:           data.landArea,
        buildingArea:       data.buildingArea,
        companyStakeholders: data.companyStakeHolders,
        employeesCount:     data.employeesCount,
        productTitles:      data.productTitles,
        outSourcedProductTitles: data.outSourcedProductTitles,
        productAvailability: data.productAvailability,
        // hasPrivatePage:     data.hasPrivatePage,
        // miniAppIframeSource:data.miniAppIframeSource,
        // ranking:            data.ranking,
        // rankingAll:         data.rankingAll,
        location,
        companyKeyWords:    data.companyKeyWords,
        companyTags:        data.companyTags,
        brands:             data.brands,
        primaryBrand:       data.primaryBrand,
        mainBrandEn:        data.mainBrandEn,
        factoryTels,
        factoryFaxes,
        officeTels,
        officeFaxes,
        contacts:           data.contacts,
        // stakeholders:       data.stakeholders,
        products,
        outSourcedProducts,
        socialMedias,
        galleryFiles:       prepareGalleryFilesForSubmission(data.gallery || []),
        // activities:         data.activities,
        // userId:             data.userId,
        subCategoryId:      data.subcategory?.value,
        // parentCompanyId:    data.parentCompanyId,
        // subCompanyIds:      data.subCompanyIds,
        telegramId:         data.telegramId,
        telegramPhoneNo:    data.telegramPhoneNo,
        whatsAppId:         data.whatsAppId,
        whatsAppPhoneNo:    data.whatsAppPhoneNo,
        instagramId:        data.instagramId,
        linkedInId:         data.linkedInId,
        skypeId:            data.skypeId,
        eitaaPhoneNo:       data.eitaaPhoneNo,
        rubikaPhoneNo:      data.rubikaPhoneNo,
        website:            data.website,
        emails:             data.emails,
        smsNumber:          data.smsNumber,
        hotlineNumber:      data.hotlineNumber,
        specialLineNumber:  data.specialLineNumber,
        logo:               data.logo,
        backgroundImage:    data.backgroundImageUrl,
        latitude:           data.latitude,
        longitude:          data.longitude,
        commonName:         data.commonName,
        fullAddress:        data.fullAddress,
        acceptInternViaPortal: data.acceptInternViaPortal ?? null,
        timelyInfoUpdate: data.timelyInfoUpdate ?? null,
        sendRelatedNewsToPortal: data.sendRelatedNewsToPortal ?? null,
        acceptStudentGroupVisit: data.acceptStudentGroupVisit ?? null,
        // status:             data.status,
      }
      let response;
      let url = `${API_BASE_URL}/company`;
      if (id) {
        url += '/' + id;
        response = await _axios.put(url, companyDto, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        // url += '/form';
        response = await _axios.post(url, companyDto, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // let response = {
      //   status: 200,
      // };

      if (response.status === 200 || response.status === 201) {
        // toast.success(
        //   <Text tag="b">
        //     {id ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'} موفقیت آمیز بود
        //   </Text>
        // );

        await fetchSubscriptions(data.subcategory?.value);
        // toast.promise(fetchSubscriptions(), {
        //   loading: id ? 'در حال بروزرسانی اطلاعات...' : 'در حال ثبت اطلاعات...',
        //   success: <b>اطلاعات شرکت شما با موفقیت ثبت شد</b>,
        //   error: <b>خطا در ثبت اطلاعات </b>,
        // });

        // methods.reset();
      }
      console.log(data);
      // console.log(transformedData);
    } catch (error) {
      console.error('Error submitting the form:', error);
      toast.error('خطا در ثبت اطلاعات');
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
