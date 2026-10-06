'use client';

import { API_BASE_URL } from '@/config/api.config';
import { cleanLocationValue } from '@/utils/iran-locations';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  FormProvider,
  SubmitHandler,
  FieldErrors,
  useFormState,
} from 'react-hook-form';
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
import { CompanyUploadValidationProvider } from '@/hooks/use-company-upload-validation';
import { CategorizedProductDTO, CompanyProductSaveProgress, productsToApi, saveCompanyWithProducts } from './product-api';
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
import CompanySuccessDialog from '@/app/shared/info/company-success-dialog';
import CompanyLocation from "@/app/shared/info/food-industry/company/create/company-location";
import {
  prepareCompanyDataWithGallery,
  prepareGalleryFilesForSubmission
} from "@/app/shared/info/food-industry/company/create/galleryTransformUtils";
import {ensureSeconds} from "@/utils/date-util";
import Spinner from "@/components/ui/spinner";
import {AiOutlineCheckCircle} from "react-icons/ai";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';

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

type CompanyValidationItem = {
  id: string;
  label: string;
  message: string;
};

const FIELD_LABELS: Record<string, string> = {
  subcategory: 'دسته‌بندی شرکت',
  companyName: 'نام شرکت',
  companyNameEn: 'نام شرکت به انگلیسی',
  primaryBrand: 'نام تجاری اصلی',
  mainBrandEn: 'نام تجاری اصلی به انگلیسی',
  companyType: 'نوع شرکت',
  establishDate: 'تاریخ تاسیس',
  employeesCount: 'تعداد کارکنان',
  buildingArea: 'متراژ بنای کارخانه',
  landArea: 'متراژ زمین کارخانه',
  ceo: 'نام و نام خانوادگی مدیرعامل',
  ceoPhoneNumber: 'تلفن همراه مدیرعامل',
  factoryState: 'استان کارخانه',
  factoryCity: 'شهر کارخانه',
  industrialCity: 'نام شهرک صنعتی',
  factoryPoBox: 'کد پستی کارخانه',
  factoryLocation: 'آدرس کارخانه',
  officePoBox: 'کد پستی دفتر مرکزی',
  officeLocation: 'آدرس دفتر مرکزی',
  telegramPhoneNo: 'شماره تلگرام',
  whatsAppPhoneNo: 'شماره واتساپ',
  smsNumber: 'سامانه پیام کوتاه',
  hotlineNumber: 'شماره خط ویژه',
  specialLineNumber: 'شماره خط ویژه',
  eitaaPhoneNo: 'شماره ایتا',
  rubikaPhoneNo: 'شماره روبیکا',
  website: 'وب‌سایت',
  emails: 'ایمیل شرکت',
  contacts: 'مخاطبان شرکت',
  factoryTels: 'تلفن کارخانه',
  factoryFaxes: 'فکس کارخانه',
  officeTels: 'تلفن دفتر مرکزی',
  officeFaxes: 'فکس دفتر مرکزی',
  products: 'محصولات و خدمات',
  productTitles: 'عنوان محصولات (خدمات)',
  productsDescription: 'توضیحات محصولات (خدمات)',
  outSourcedProducts: 'محصولات برون‌سپاری‌شده',
  brands: 'نام‌های تجاری اضافه',
  gallery: 'گالری شرکت',
};

const FIELD_SECTIONS: Record<string, string> = {
  subcategory: formParts.intro,
  companyName: formParts.intro,
  companyNameEn: formParts.intro,
  primaryBrand: formParts.intro,
  mainBrandEn: formParts.intro,
  companyType: formParts.intro,
  establishDate: formParts.intro,
  ceo: formParts.intro,
  ceoPhoneNumber: formParts.intro,
  employeesCount: formParts.intro,
  buildingArea: formParts.intro,
  landArea: formParts.intro,
  brands: formParts.intro,
  factoryState: formParts.location,
  factoryCity: formParts.location,
  industrialCity: formParts.location,
  factoryPoBox: formParts.location,
  factoryLocation: formParts.location,
  officePoBox: formParts.location,
  officeLocation: formParts.location,
  factoryTels: formParts.factory,
  factoryFaxes: formParts.factory,
  contacts: formParts.factory,
  officeTels: formParts.office,
  officeFaxes: formParts.office,
  smsNumber: formParts.office,
  hotlineNumber: formParts.office,
  specialLineNumber: formParts.office,
  telegramPhoneNo: formParts.social,
  whatsAppPhoneNo: formParts.social,
  eitaaPhoneNo: formParts.social,
  rubikaPhoneNo: formParts.social,
  website: formParts.social,
  emails: formParts.social,
  products: formParts.products,
  productTitles: formParts.products,
  productsDescription: formParts.products,
  outSourcedProducts: formParts.products,
  gallery: formParts.gallery,
};

const VALIDATION_FIELD_ORDER = [
  'subcategory',
  'companyName',
  'companyNameEn',
  'primaryBrand',
  'mainBrandEn',
  'companyType',
  'establishDate',
  'ceo',
  'ceoPhoneNumber',
  'employeesCount',
  'buildingArea',
  'landArea',
  'brands',
  'factoryState',
  'factoryCity',
  'industrialCity',
  'factoryPoBox',
  'factoryLocation',
  'officePoBox',
  'officeLocation',
  'factoryTels',
  'factoryFaxes',
  'contacts',
  'officeTels',
  'officeFaxes',
  'smsNumber',
  'specialLineNumber',
  'telegramPhoneNo',
  'whatsAppPhoneNo',
  'eitaaPhoneNo',
  'rubikaPhoneNo',
  'emails',
  'website',
  'productTitles',
  'productsDescription',
  'products',
  'outSourcedProducts',
  'gallery',
];

function getValidationLabel(path: string) {
  const parts = path.split('.');
  const root = parts[0];
  const rowIndex = parts.find((part) => /^\d+$/.test(part));
  const field = parts.at(-1);
  const row = rowIndex ? ` ${Number(rowIndex) + 1}` : '';

  const nestedLabels: Record<string, string> = {
    name: root === 'contacts' ? 'نام مخاطب' : 'نام محصول',
    lastName: 'نام خانوادگی مخاطب',
    position: 'سمت مخاطب',
    phone: 'شماره موبایل مخاطب',
    email: 'ایمیل مخاطب',
    categoryType: 'دسته‌بندی محصول',
    telNumber: FIELD_LABELS[root] || 'شماره تماس',
    nameEn: 'نام انگلیسی برند',
    title: root === 'gallery' ? 'عنوان تصویر گالری' : 'عنوان',
  };

  return (
    (field && nestedLabels[field] ? `${nestedLabels[field]}${row}` : undefined) ||
    FIELD_LABELS[root] ||
    path
  );
}

function flattenValidationErrors(
  errors: FieldErrors<CreateCompanyInput>
): CompanyValidationItem[] {
  const items: CompanyValidationItem[] = [];

  const visit = (value: unknown, path: string[] = []) => {
    if (!value || typeof value !== 'object') return;

    const error = value as Record<string, unknown>;
    if (typeof error.message === 'string' && path.length) {
      const id = path.join('.');
      items.push({ id, label: getValidationLabel(id), message: error.message });
      return;
    }

    Object.entries(error).forEach(([key, child]) => {
      if (key !== 'ref' && key !== 'type' && key !== 'types' && key !== 'message') {
        visit(child, [...path, key]);
      }
    });
  };

  visit(errors);
  return items.sort((first, second) => {
    const firstIndex = VALIDATION_FIELD_ORDER.indexOf(first.id.split('.')[0]);
    const secondIndex = VALIDATION_FIELD_ORDER.indexOf(second.id.split('.')[0]);
    const normalizedFirst = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex;
    const normalizedSecond = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex;

    return normalizedFirst - normalizedSecond || first.id.localeCompare(second.id);
  });
}

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
  nameEn?: string
  brandImage?: string
  logoUrl?: string
  galleryFiles?: string[]
}

/** A single product entry */
export interface ProductDTO extends CategorizedProductDTO {}

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
  productsDescription?: string
  outSourcedProductsDescription?: string
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
  productsDescription?: string
  outSourcedProductsDescription?: string
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
  const [registrationResult, setRegistrationResult] = useState<{
    subCategoryId: number;
    subscription: 'active' | 'missing' | 'unknown';
  } | null>(null);
  const [subcategories, setSubcategories] = useState();
  const _axios = useAxiosPrivate();
  const productSaveProgress = useRef<CompanyProductSaveProgress>({});
  const [companyData, setCompanyData] = useState<Company | null>(null); // Company data
  const [isFetching, setFetching] = useState(false);
  const [isValidationPopupOpen, setIsValidationPopupOpen] = useState(false);
  const [isValidationPopupCollapsed, setIsValidationPopupCollapsed] =
    useState(false);
  const methods = useForm<CreateCompanyInput>({
    defaultValues: defaultValues(companyData),
    resolver: zodResolver(companyFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { errors: liveValidationErrors } = useFormState({
    control: methods.control,
  });
  const validationItems = flattenValidationErrors(liveValidationErrors);
  const isValidationComplete =
    isValidationPopupOpen && validationItems.length === 0;
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

  useEffect(() => {
    if (!isValidationPopupOpen || !isValidationComplete) return;

    const timer = window.setTimeout(() => {
      setIsValidationPopupOpen(false);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [isValidationComplete, isValidationPopupOpen]);

  if (id && isFetching) {
    return (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Spinner size="xl" />
        </div>
    );
  }
  const fetchSubscriptions = async (subCategoryId: number) => {
    let subscription: 'active' | 'missing' | 'unknown' = 'unknown';
    try {
      const response = await _axios.get(
        `/subscription/subcategory/${subCategoryId}?status=ACTIVE`
      );
      if (response.data.status === 'SUCCESS') {
        subscription = response.data?.data?.length ? 'active' : 'missing';
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
    setRegistrationResult({ subCategoryId, subscription });
  };

  const onSubmit: SubmitHandler<CreateCompanyInput> = async (data) => {
    if (registrationResult || isLoading) return;
    setIsValidationPopupOpen(false);
    setIsValidationPopupCollapsed(false);
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
      //   productsDescription: data.productAvailability === '1' ? data.productsDescription : undefined,
      //   outSourcedProductsDescription: data.productAvailability === '1' ? data.outSourcedProductsDescription : undefined,
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
        officeCity:      cleanLocationValue(data.officeCity),
        officeState:     cleanLocationValue(data.officeState),
        factoryCity:     cleanLocationValue(data.factoryCity),
        factoryState:    cleanLocationValue(data.factoryState),
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

      const products = data.productAvailability === '2'
        ? productsToApi(data.products || []) : [];
      const outSourcedProducts = data.productAvailability === '2'
        ? productsToApi(data.outSourcedProducts || [], true) : [];

      const brands: BrandDTO[] = (data.brands || [])
        .filter((brand) => brand.name?.trim() || brand.nameEn?.trim() || brand.brandImage?.trim())
        .map((brand) => ({
        name: brand.name,
        nameEn: brand.nameEn,
        brandImage: brand.brandImage || undefined,
        galleryFiles: (brand.galleryFiles || [])
          .map((file) => typeof file === 'string' ? file : file.id)
          .filter(Boolean),
      }));

      console.log(`products: ${JSON.stringify(products)}`)

      console.log(`data.gallery: ${JSON.stringify(data?.gallery?.contacts || {})}`)
      // 5. Build the CompanyCreateDTO
      const companyDto: CompanyCreateDTO = {
        id:                 id ? Number(id) : undefined,
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
        productTitles:      data.productAvailability === '1' ? data.productTitles : undefined,
        productsDescription: data.productAvailability === '1' ? data.productsDescription : undefined,
        outSourcedProductsDescription: data.productAvailability === '1' ? data.outSourcedProductsDescription : undefined,
        productAvailability: data.productAvailability,
        // hasPrivatePage:     data.hasPrivatePage,
        // miniAppIframeSource:data.miniAppIframeSource,
        // ranking:            data.ranking,
        // rankingAll:         data.rankingAll,
        location,
        companyKeyWords:    data.companyKeyWords,
        companyTags:        data.companyTags,
        brands,
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
      const response = await saveCompanyWithProducts(
        _axios, companyDto, id, productSaveProgress.current,
      );

      // let response = {
      //   status: 200,
      // };

      if (response.status >= 200 && response.status < 300) {
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
      toast.error(productSaveProgress.current.companyCreated && !id
        ? productSaveProgress.current.companyId
          ? 'شرکت ثبت شده است، اما ذخیره اطلاعات کامل نشد. دوباره ذخیره کنید؛ شرکت تکراری ایجاد نمی‌شود.'
          : 'شرکت ثبت شده است، اما سرور شناسه آن را برنگرداند. شرکت را از فهرست شرکت‌ها باز کنید.'
        : 'خطا در ثبت اطلاعات');
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

  const preventEnterSubmission = (
    event: React.KeyboardEvent<HTMLFormElement>
  ) => {
    if (event.key !== 'Enter' || event.defaultPrevented) return;

    const target = event.target as HTMLElement;

    // Enter must keep its normal behavior in multiline editors. Inputs that
    // intentionally use Enter (such as adding a tag) prevent it themselves.
    if (target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    event.preventDefault();
  };

  const focusValidationField = (path: string) => {
    const rootField = path.split('.')[0];
    const namedControl = document.querySelector<HTMLElement>(
      `[name="${CSS.escape(path)}"]`
    );
    const fieldContainer = document.getElementById(`field-${rootField}`);
    const section = document.getElementById(
      FIELD_SECTIONS[rootField] || formParts.intro
    );
    const target = namedControl || fieldContainer || section;

    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      const focusable = target.matches(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
      )
        ? target
        : target.querySelector<HTMLElement>(
            'input:not([type="hidden"]), textarea, select, button, [role="combobox"], [tabindex]:not([tabindex="-1"])'
          );
      focusable?.focus({ preventScroll: true });
    }, 400);
  };

  const handleInvalidSubmit = (errors: FieldErrors<CreateCompanyInput>) => {
    const items = flattenValidationErrors(errors);
    setIsValidationPopupOpen(true);
    setIsValidationPopupCollapsed(false);

    if (items[0]) {
      window.setTimeout(() => focusValidationField(items[0].id), 250);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLElement | null;

    if (!submitter?.matches('[data-form-submit="true"]')) {
      event.preventDefault();
      return;
    }

    return methods.handleSubmit(onSubmit, handleInvalidSubmit)(event);
  };

  return (
    <div className="@container min-w-0 max-w-full">
      <CompanySuccessDialog
        open={Boolean(registrationResult)}
        title={id ? 'اطلاعات شرکت شما با موفقیت به‌روزرسانی گردید' : 'شرکت شما با موفقیت ثبت گردید'}
        description={registrationResult?.subscription === 'active'
          ? 'اشتراک فعال شما ثبت شده است. اطلاعات شرکت شما برای بررسی در اختیار کارشناسان ما قرار می‌گیرد.'
          : registrationResult?.subscription === 'unknown'
            ? 'اطلاعات شرکت شما ذخیره شد، اما بررسی وضعیت اشتراک انجام نشد. وضعیت اشتراک را در صفحه کسب‌وکارهای من بررسی کنید.'
            : 'برای انتشار شرکت شما خواهشمند است اشتراک موردنظر را تهیه بفرمایید.'}
        notice={registrationResult?.subscription === 'active'
          ? 'اطلاعات شرکت شما پس از بررسی کارشناسان ما، حداکثر تا ۷۲ ساعت منتشر می‌شود.'
          : 'ثبت اطلاعات شرکت تکمیل شده است. انتشار شرکت پس از تهیه اشتراک و بررسی کارشناسان انجام می‌شود.'}
        purchased={registrationResult?.subscription === 'active'}
        actionLabel={registrationResult?.subscription === 'missing' ? 'انتخاب و خرید اشتراک' : 'رفتن به کسب‌وکارهای من'}
        onContinue={() => router.replace(registrationResult?.subscription === 'missing'
          ? `/bundle/${registrationResult.subCategoryId}/buy`
          : routes.info.dashboard)}
        onLater={registrationResult?.subscription === 'missing' ? () => router.replace(routes.info.dashboard) : undefined}
      />
      <FormNav />
      <FormProvider {...methods}>
        <CompanyUploadValidationProvider>
        <form
          onSubmit={handleFormSubmit}
          onKeyDown={preventEnterSubmission}
          className={cn('[&_label.block>span]:font-medium', className)}
        >
          <div className="mb-10 grid min-w-0 grid-cols-1 gap-7 divide-y divide-dashed divide-gray-200 [&>*]:min-w-0 dark:divide-gray-300 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => (
              <Element
                key={key}
                id={formParts[key as keyof typeof formParts]}
                name={formParts[key as keyof typeof formParts]}
                className="scroll-mt-[150px]"
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
            draftBtnText="انصراف"
            onDraftClick={() => router.push(routes.info.dashboard)}
            draftButtonClassName="w-1/3 @xl:min-w-24"
            submitButtonClassName="w-2/3 @xl:min-w-48"
            submitBtnText={id ? 'بروز رسانی شرکت' : 'ثبت شرکت'}
          />
        </form>
        </CompanyUploadValidationProvider>
      </FormProvider>
      {isValidationPopupOpen && (
        <CompanyValidationPopup
          items={validationItems}
          isComplete={isValidationComplete}
          isCollapsed={isValidationPopupCollapsed}
          onItemClick={focusValidationField}
          onCollapse={() => setIsValidationPopupCollapsed(true)}
          onExpand={() => setIsValidationPopupCollapsed(false)}
        />
      )}
    </div>
  );
}

function CompanyValidationPopup({
  items,
  isComplete,
  isCollapsed,
  onItemClick,
  onCollapse,
  onExpand,
}: {
  items: CompanyValidationItem[];
  isComplete: boolean;
  isCollapsed: boolean;
  onItemClick: (itemId: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  const popupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isCollapsed) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!popupRef.current?.contains(event.target as Node)) {
        onCollapse();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCollapse();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCollapsed, onCollapse]);

  return (
    <section
      className={cn(
        'fixed bottom-24 left-4 z-[100] w-[calc(100%-2rem)] max-w-80 transition-transform duration-300 ease-out sm:left-6 sm:w-80'
      )}
      style={{
        transform: isCollapsed
          ? 'translateX(calc(-100% + 3.5rem))'
          : 'translateX(0)',
      }}
      aria-label="پنل اعتبارسنجی فرم شرکت"
    >
      <aside
        ref={popupRef}
        role={isCollapsed ? undefined : 'dialog'}
        aria-live="polite"
        aria-hidden={isCollapsed}
        aria-label="وضعیت اعتبارسنجی فرم شرکت"
        className={cn(
          'flex max-h-[26rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-opacity duration-200 dark:border-gray-700 dark:bg-gray-900',
          isCollapsed && 'pointer-events-none opacity-0'
        )}
        dir="rtl"
      >
        <div
          className={cn(
            'flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3',
            isComplete
              ? 'border-green-light bg-green-lighter dark:border-green-dark dark:bg-green-dark/20'
              : 'border-red-light bg-red-lighter dark:border-red-dark dark:bg-red-dark/20'
          )}
        >
          <div className="flex items-start gap-3">
            {isComplete ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green" />
            ) : (
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red" />
            )}
            <div>
              <p
                className={cn(
                  'font-semibold',
                  isComplete ? 'text-green-dark' : 'text-red-dark'
                )}
              >
                {isComplete
                  ? 'همه اطلاعات لازم تکمیل شده است'
                  : `${items.length} مورد نیاز به اصلاح دارد`}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                {isComplete
                  ? 'برای ثبت نهایی، دوباره روی دکمه ثبت شرکت کلیک کنید.'
                  : 'برای رفتن به هر فیلد، روی همان مورد کلیک کنید.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCollapse}
            disabled={isCollapsed}
            className="rounded-full p-1 text-gray-500 transition hover:bg-white/80 hover:text-gray-900"
            aria-label="جمع کردن پنل خطاها"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {!isComplete && (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                disabled={isCollapsed}
                onClick={() => {
                  onItemClick(item.id);
                  onCollapse();
                }}
                className="flex w-full items-start gap-2.5 rounded-xl border border-red-light bg-red-lighter px-3 py-2 text-right text-red-dark transition hover:border-red hover:bg-red-light/20 focus:outline-none focus:ring-2 focus:ring-red dark:border-red-dark dark:bg-red-dark/20 dark:text-red-lighter"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">{item.message}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <button
        type="button"
        onClick={onExpand}
        aria-label={`باز کردن پنل خطاها؛ ${items.length} مورد`}
        className={cn(
          'absolute right-0 top-1/2 flex h-20 w-14 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-r-2xl border border-l-0 border-red-light bg-red-lighter text-red-dark shadow-xl transition-opacity duration-200',
          isCollapsed
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        <span className="text-sm font-bold">{items.length}</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
