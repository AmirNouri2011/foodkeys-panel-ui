// 'use client';
//
// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Button, Input, Textarea, Badge } from 'rizzui';
// import { ChevronLeft } from 'lucide-react';
// import { useServiceSchema } from '@/hooks/use-service-subcategories';
// import { useServiceApi, ServiceDTO } from '@/app/api/services';
// import DynamicForm from '@/components/ui/dynamic-form';
// import { routes } from '@/config/routes';
// import Spinner from '@/components/ui/spinner';
// import { Card, Title } from '@/components/ui/compatible-components';
// import useAxiosPrivate from '@/hooks/use-axios-private';
//
// // Custom alert component to avoid the rizzui Alert issue
// const CustomAlert = ({ children, variant = "default", className = "" }) => {
//     const baseStyles = "p-4 rounded-md mb-4 text-sm";
//     const variantStyles = {
//         default: "bg-gray-100 text-gray-800",
//         info: "bg-blue-50 text-blue-800",
//         success: "bg-green-50 text-green-800",
//         warning: "bg-yellow-50 text-yellow-800",
//         danger: "bg-red-50 text-red-800"
//     };
//
//     return (
//         <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
//             {children}
//         </div>
//     );
// };
//
// export default function ServiceCreatePage() {
//     const { subcategory } = useParams();
//     const router = useRouter();
//     const serviceApi = useServiceApi();
//     const axiosPrivate = useAxiosPrivate();
//
//     // States
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [serviceData, setServiceData] = useState<Partial<ServiceDTO>>({
//         name: '',
//         nameEn: '',
//         ranking: 0,
//         rankingAll: 0,
//         description: '',
//         elasticFields: [],
//         data: {}
//     });
//     const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
//
//     // Get schema for the subcategory
//     const { schema, loading: schemaLoading, error: schemaError } = useServiceSchema(subCategoryId);
//
//     // Find subcategory ID from name
//     useEffect(() => {
//         const fetchSubCategoryId = async () => {
//             try {
//                 // Using axiosPrivate instead of fetch
//                 const response = await axiosPrivate.get(`/subcategory/by-name/${subcategory}`);
//
//                 if (response.data && response.data.status === "SUCCESS" && response.data.data) {
//                     setSubCategoryId(response.data.data.subCategoryId);
//                     setServiceData(prev => ({
//                         ...prev,
//                         subCategoryId: response.data.data.subCategoryId
//                     }));
//                 } else {
//                     console.warn('Using mock subcategory ID. Should implement proper lookup.');
//                     const mockId = subcategory === 'exhibitions' ? 1 :
//                         subcategory === 'conferences' ? 2 :
//                             subcategory === 'employment' ? 3 : 4;
//
//                     setSubCategoryId(mockId);
//                     setServiceData(prev => ({
//                         ...prev,
//                         subCategoryId: mockId
//                     }));
//                 }
//             } catch (err) {
//                 console.error('Error fetching subcategory ID:', err);
//                 setError('خطا در یافتن زیرشاخه');
//
//                 // Fallback to a mock ID
//                 const mockId = subcategory === 'exhibitions' ? 1 :
//                     subcategory === 'conferences' ? 2 :
//                         subcategory === 'employment' ? 3 : 4;
//
//                 setSubCategoryId(mockId);
//                 setServiceData(prev => ({
//                     ...prev,
//                     subCategoryId: mockId
//                 }));
//             }
//         };
//
//         if (subcategory) {
//             fetchSubCategoryId();
//         }
//     }, [subcategory, axiosPrivate]);
//
//     // Handle basic form fields change
//     const handleBasicFieldChange = (field: keyof ServiceDTO, value: any) => {
//         setServiceData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };
//
//     // Handle dynamic form data change
//     const handleDynamicDataChange = (data: any) => {
//         setServiceData(prev => ({
//             ...prev,
//             data
//         }));
//     };
//
//     // Handle form submission
//     const handleSubmit = async () => {
//         try {
//             setIsLoading(true);
//             setError(null);
//
//             if (!serviceData.name) {
//                 setError('نام خدمت الزامی است');
//                 setIsLoading(false);
//                 return;
//             }
//
//             if (!serviceData.subCategoryId) {
//                 setError('زیرشاخه تعیین نشده است');
//                 setIsLoading(false);
//                 return;
//             }
//
//             // Prepare elastic fields (comma-separated tags to array)
//             let elasticFieldsArray: string[] = [];
//             if (typeof serviceData.elasticFields === 'string') {
//                 elasticFieldsArray = serviceData.elasticFields
//                     .split(',')
//                     .map(field => field.trim())
//                     .filter(field => field);
//             } else if (Array.isArray(serviceData.elasticFields)) {
//                 elasticFieldsArray = serviceData.elasticFields;
//             }
//
//             // Create service
//             const serviceToCreate: ServiceDTO = {
//                 name: serviceData.name || '',
//                 nameEn: serviceData.nameEn || '',
//                 ranking: serviceData.ranking || 0,
//                 rankingAll: serviceData.rankingAll || 0,
//                 description: serviceData.description || '',
//                 subCategoryId: serviceData.subCategoryId || 0,
//                 elasticFields: elasticFieldsArray,
//                 data: serviceData.data || {},
//                 additionalData: null
//             };
//
//             const response = await serviceApi.createService(serviceToCreate);
//
//             if (response && response.status === 'SUCCESS') {
//                 // Navigate to the service list
//                 router.push(routes.info.serviceIndustrySubCategoryList(subcategory as string));
//             } else {
//                 setError('خطا در ایجاد سرویس');
//             }
//         } catch (err) {
//             console.error('Error creating service:', err);
//             setError('خطا در ایجاد سرویس');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <div className="p-4 md:p-6 lg:p-8">
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center">
//                     <Button
//                         variant="text"
//                         className="mr-2"
//                         onClick={() => router.back()}
//                     >
//                         <ChevronLeft className="h-5 w-5" />
//                     </Button>
//                     <Title className="text-xl md:text-2xl">ایجاد {subcategory} جدید</Title>
//                 </div>
//             </div>
//
//             {error && (
//                 <CustomAlert variant="danger">
//                     {error}
//                 </CustomAlert>
//             )}
//
//             {schemaError && (
//                 <CustomAlert variant="danger">
//                     خطا در بارگذاری ساختار فرم: {schemaError}
//                 </CustomAlert>
//             )}
//
//             <Card className="mb-8">
//                 <div className="p-6">
//                     <Title className="text-lg mb-4">اطلاعات پایه</Title>
//
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <Input
//                             label="نام خدمت"
//                             placeholder="نام خدمت را وارد کنید"
//                             value={serviceData.name}
//                             onChange={(e) => handleBasicFieldChange('name', e.target.value)}
//                             error={!serviceData.name ? 'نام خدمت الزامی است' : ''}
//                             required
//                         />
//
//                         <Input
//                             label="نام انگلیسی خدمت"
//                             placeholder="نام انگلیسی خدمت را وارد کنید"
//                             value={serviceData.nameEn}
//                             onChange={(e) => handleBasicFieldChange('nameEn', e.target.value)}
//                         />
//
//                         {/*<Input*/}
//                         {/*    type="number"*/}
//                         {/*    label="رتبه"*/}
//                         {/*    placeholder="رتبه"*/}
//                         {/*    value={serviceData.ranking}*/}
//                         {/*    onChange={(e) => handleBasicFieldChange('ranking', Number(e.target.value))}*/}
//                         {/*/>*/}
//
//                         {/*<Input*/}
//                         {/*    type="number"*/}
//                         {/*    label="رتبه کلی"*/}
//                         {/*    placeholder="رتبه کلی"*/}
//                         {/*    value={serviceData.rankingAll}*/}
//                         {/*    onChange={(e) => handleBasicFieldChange('rankingAll', Number(e.target.value))}*/}
//                         {/*/>*/}
//
//                         {/*<Input*/}
//                         {/*    label="فیلدهای جستجو (با کاما جدا کنید)"*/}
//                         {/*    placeholder="فیلدهای قابل جستجو را وارد کنید"*/}
//                         {/*    value={typeof serviceData.elasticFields === 'string' ? serviceData.elasticFields : serviceData.elasticFields?.join(', ')}*/}
//                         {/*    onChange={(e) => handleBasicFieldChange('elasticFields', e.target.value)}*/}
//                         {/*    className="col-span-1 md:col-span-2"*/}
//                         {/*    helperText="فیلدهایی که در جستجو استفاده می‌شوند را با کاما جدا کنید"*/}
//                         {/*/>*/}
//
//                         <Textarea
//                             label="توضیحات"
//                             placeholder="توضیحات خدمت را وارد کنید"
//                             value={serviceData.description}
//                             onChange={(e) => handleBasicFieldChange('description', e.target.value)}
//                             className="col-span-1 md:col-span-2"
//                             rows={4}
//                         />
//                     </div>
//                 </div>
//             </Card>
//
//             {schemaLoading ? (
//                 <div className="flex justify-center items-center py-10">
//                     <Spinner size="xl" />
//                     <p className="ms-3">در حال بارگذاری فرم...</p>
//                 </div>
//             ) : schema ? (
//                 <Card>
//                     <div className="p-6">
//                         <Title className="text-lg mb-4">اطلاعات تخصصی</Title>
//
//                         <DynamicForm
//                             schema={schema}
//                             onSubmit={handleDynamicDataChange}
//                             loading={isLoading}
//                             hideSubmit={true}
//                         />
//                     </div>
//                 </Card>
//             ) : null}
//
//             <div className="mt-6 flex justify-end">
//                 <Button
//                     variant="outline"
//                     className="ml-3"
//                     onClick={() => router.back()}
//                     disabled={isLoading}
//                 >
//                     انصراف
//                 </Button>
//
//                 <Button
//                     onClick={handleSubmit}
//                     isLoading={isLoading}
//                     disabled={!serviceData.name || !subCategoryId || schemaLoading}
//                 >
//                     {isLoading ? 'در حال ذخیره...' : 'ذخیره سرویس'}
//                 </Button>
//             </div>
//         </div>
//     );
// }
'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'rizzui';
import { Dialog } from '@headlessui/react';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Save,
  ServerCrash,
  Sparkles,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import {
  useServiceSchema,
  useServiceSubcategories,
} from '@/hooks/use-service-subcategories';
import { useServiceApi, ServiceDTO } from '@/app/api/services';
import DynamicForm, {
  DynamicFormValidateRef,
  DynamicFormValidationItem,
} from '@/components/ui/dynamic-form';
import { routes } from '@/config/routes';
import Spinner from '@/components/ui/spinner';
import { Title } from '@/components/ui/compatible-components';
import ServiceDisplaySettings, {
  ServiceDisplaySettingsValues,
} from '@/app/shared/info/service/service-display-settings';
import { getServiceDisplaySettingsErrors } from '@/app/shared/info/service/form-utils';
import CompanySuccessDialog from '@/app/shared/info/company-success-dialog';
import useAxiosPrivate from '@/hooks/use-axios-private';

// Custom alert component to avoid the rizzui Alert issue
const CustomAlert = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = 'p-4 rounded-md mb-4 text-sm';
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    info: 'bg-blue-lighter text-blue-dark',
    success: 'bg-green-lighter text-green-dark',
    warning: 'bg-orange-lighter text-orange-dark',
    danger: 'bg-red-lighter text-red-dark',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

type ValidationPopupItem = DynamicFormValidationItem & {
  isFading?: boolean;
};

type BackendErrorItem = {
  id: string;
  field?: string;
  label?: string;
  message: string;
};

function extractBackendErrors(source: any): BackendErrorItem[] {
  const payload = source?.response?.data ?? source ?? {};
  const collected: Array<{ field?: string; message: string }> = [];

  const collect = (item: any, fallbackField?: string) => {
    if (!item) return;
    if (typeof item === 'string') {
      collected.push({ field: fallbackField, message: item });
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((entry) => collect(entry, fallbackField));
      return;
    }
    if (typeof item !== 'object') return;

    const message =
      item.message || item.defaultMessage || item.errorMessage || item.reason;
    const field =
      item.field ||
      item.fieldName ||
      item.property ||
      item.propertyPath ||
      item.path ||
      fallbackField;

    if (typeof message === 'string') {
      collected.push({ field, message });
      return;
    }

    Object.entries(item).forEach(([key, value]) => collect(value, key));
  };

  const detailSources = [
    payload.errors,
    payload.validationErrors,
    payload.fieldErrors,
    payload.violations,
    payload.error,
    payload.data?.errors,
    payload.data?.validationErrors,
    payload.data?.fieldErrors,
    payload.data?.violations,
  ];
  detailSources.forEach((details) => collect(details));

  // Some endpoints put the validation array/map directly in `data`.
  if (
    Array.isArray(payload.data) ||
    (collected.length === 0 && payload.data && typeof payload.data === 'object')
  ) {
    collect(payload.data);
  }

  // Keep the backend's general explanation alongside field-level errors.
  collect(payload.message);
  if (collected.length === 0) {
    collected.push({ message: 'خطایی در ذخیره اطلاعات رخ داده است.' });
  }

  return collected
    .filter(
      (item, index, items) =>
        items.findIndex(
          (candidate) =>
            candidate.field === item.field && candidate.message === item.message
        ) === index
    )
    .map((item, index) => ({ ...item, id: `backend-error-${index}` }));
}

export default function ServiceCreatePage() {
  const { subcategory } = useParams();
  const router = useRouter();
  const serviceApi = useServiceApi();
  const axiosPrivate = useAxiosPrivate();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendErrors, setBackendErrors] = useState<BackendErrorItem[]>([]);
  const [registrationResult, setRegistrationResult] = useState<{
    subCategoryId: number;
    subscription: 'active' | 'missing' | 'unknown';
  } | null>(null);
  const [serviceData, setServiceData] = useState<Partial<ServiceDTO>>({
    name: '',
    nameEn: '',
    description: '',
    subCategoryId: 0,
    logo: '',
    backgroundImage: '',
    keywords: [],
    tags: [],
    data: {},
  });
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [displaySettingsErrors, setDisplaySettingsErrors] = useState<
    Partial<Record<keyof ServiceDisplaySettingsValues, string>>
  >({});
  const [isValidationPopupOpen, setIsValidationPopupOpen] = useState(false);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [isValidationPopupClosing, setIsValidationPopupClosing] =
    useState(false);
  const [isValidationPopupCollapsed, setIsValidationPopupCollapsed] =
    useState(false);
  const [validationItems, setValidationItems] = useState<ValidationPopupItem[]>(
    []
  );
  const dynamicFormValidateRef = useRef<DynamicFormValidateRef | null>(null);

  // Get schema for the subcategory
  const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    retry: retrySchema,
  } = useServiceSchema(subCategoryId);
  const {
    subcategories,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } = useServiceSubcategories();
  const selectedSubcategory = useMemo(() => {
    const routeName = decodeURIComponent(
      String(subcategory || '')
    ).toLowerCase();
    return subcategories.find(
      (item) => item.subCategoryName.toLowerCase() === routeName
    );
  }, [subcategory, subcategories]);
  const pageTitle =
    selectedSubcategory?.subCategoryDisplayName ||
    schema?.formTitle ||
    'خدمت جدید';
  const pageDescription =
    selectedSubcategory?.subCategoryDescription ||
    schema?.formDescription ||
    'اطلاعات خدمت را کامل و دقیق وارد کنید.';

  const scrollToSection = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      event.preventDefault();

      const section = document.getElementById(sectionId);
      if (!section) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      section.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.replaceState(null, '', `#${sectionId}`);
    },
    []
  );

  const getBackendFieldLabel = useCallback(
    (field?: string) => {
      if (!field) return undefined;
      const normalizedField = field
        .replace(/\[(\w+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)
        .reverse()
        .find((part) => !/^\d+$/.test(part));
      if (!normalizedField) return field;

      const fixedLabels: Record<string, string> = {
        name: 'نام خدمت',
        nameEn: 'نام انگلیسی خدمت',
        description: 'توضیحات',
        subCategoryId: 'زیرشاخه بانک خدمات',
        galleryFiles: 'تصاویر خدمت',
        website: 'سایت اینترنتی',
        site: 'سایت اینترنتی',
        companyLogo: 'لوگوی شرکت',
      };

      return (
        fixedLabels[normalizedField] ||
        schema?.schemaDefinition?.properties?.[normalizedField]?.title ||
        normalizedField
      );
    },
    [schema]
  );

  const normalizeBackendErrors = useCallback(
    (source: any) =>
      extractBackendErrors(source).map((item) => ({
        ...item,
        label: getBackendFieldLabel(item.field),
      })),
    [getBackendFieldLabel]
  );

  // Resolve the route name from the real service-bank subcategory list. The old
  // lookup fell back to mock IDs 1..4, while current IDs (Employment = 36) are
  // assigned by the backend. That left the save button silently disabled or
  // loaded the wrong schema.
  useEffect(() => {
    if (!subcategory || subcategoriesLoading) return;

    if (subcategoriesError) {
      setError('خطا در دریافت زیرشاخه‌های بانک خدمات');
      return;
    }

    const routeName = decodeURIComponent(String(subcategory)).toLowerCase();
    const selectedSubcategory = subcategories.find(
      (item) => item.subCategoryName.toLowerCase() === routeName
    );

    if (!selectedSubcategory) {
      setSubCategoryId(null);
      setError('زیرشاخه موردنظر در بانک خدمات پیدا نشد');
      return;
    }

    setSubCategoryId(selectedSubcategory.subCategoryId);
    setServiceData((prev) => ({
      ...prev,
      subCategoryId: selectedSubcategory.subCategoryId,
    }));
    setError(null);
  }, [subcategory, subcategories, subcategoriesError, subcategoriesLoading]);

  const handleDisplaySettingsChange = (
    field: keyof ServiceDisplaySettingsValues,
    value: any
  ) => {
    setBackendErrors([]);
    setServiceData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setDisplaySettingsErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Handle dynamic form data change - this gets called when DynamicForm values change
  const handleDynamicDataChange = useCallback((data: any) => {
    setBackendErrors([]);
    setDynamicFormData(data);
    // Also update serviceData.data to reflect the current form data
    setServiceData((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  // This will be called when the DynamicForm is submitted (but we hide submit button)
  const handleDynamicFormSubmit = async (data: any) => {
    // We use this just to get the final formatted data
    setDynamicFormData(data);
    setServiceData((prev) => ({
      ...prev,
      data,
    }));
  };

  const getMainValidationItems = useCallback(
    (
      errors: Partial<
        Record<keyof ServiceDisplaySettingsValues, string>
      > = getServiceDisplaySettingsErrors({
        name: serviceData.name || '',
        nameEn: serviceData.nameEn || '',
        description: serviceData.description || '',
        logo: serviceData.logo,
        backgroundImage: serviceData.backgroundImage,
        keywords: serviceData.keywords || [],
        tags: serviceData.tags || [],
      })
    ): DynamicFormValidationItem[] => [
      {
        id: 'display.name',
        label: 'نام خدمت',
        isValid: !errors.name && Boolean(serviceData.name?.trim()),
        message: errors.name || 'تکمیل شده',
      },
      {
        id: 'display.subCategoryId',
        label: 'زیرشاخه بانک خدمات',
        isValid: Boolean(subCategoryId),
        message: subCategoryId ? 'تکمیل شده' : 'زیرشاخه تعیین نشده است',
      },
    ],
    [serviceData, subCategoryId]
  );

  useEffect(() => {
    if (!isValidationPopupOpen) return;

    let cancelled = false;
    const refreshValidationStatus = async () => {
      const dynamicResult =
        await dynamicFormValidateRef.current?.validateWithStatus();
      if (cancelled) return;

      const nextItems = [
        ...getMainValidationItems(),
        ...(dynamicResult?.items || []),
      ];
      const allValid = nextItems.every((item) => item.isValid);

      setValidationItems((previousItems) => {
        const previousById = new Map(
          previousItems.map((item) => [item.id, item])
        );

        return nextItems.flatMap<ValidationPopupItem>((item) => {
          if (!item.isValid) return [{ ...item, isFading: false }];

          const previousItem = previousById.get(item.id);
          if (previousItem && !previousItem.isValid) {
            return [{ ...item, isFading: false }];
          }

          if (previousItem?.isValid) {
            return [{ ...item, isFading: previousItem.isFading }];
          }

          // Items which were already correct when the popup opened are hidden.
          return [];
        });
      });

      setIsValidationComplete(allValid);
      if (allValid) {
        setError(null);
      } else {
        setIsValidationPopupClosing(false);
      }
    };

    const timer = window.setTimeout(refreshValidationStatus, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [dynamicFormData, getMainValidationItems, isValidationPopupOpen]);

  useEffect(() => {
    if (!isValidationPopupOpen) return;
    const hasResolvedItems = validationItems.some(
      (item) => item.isValid && !item.isFading
    );
    if (!hasResolvedItems) return;

    const timer = window.setTimeout(() => {
      setValidationItems((items) =>
        items.map((item) => (item.isValid ? { ...item, isFading: true } : item))
      );
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isValidationPopupOpen, validationItems]);

  useEffect(() => {
    if (!isValidationPopupOpen) return;
    const hasFadingItems = validationItems.some((item) => item.isFading);
    if (!hasFadingItems) return;

    const timer = window.setTimeout(() => {
      setValidationItems((items) => items.filter((item) => !item.isFading));
    }, 600);

    return () => window.clearTimeout(timer);
  }, [isValidationPopupOpen, validationItems]);

  useEffect(() => {
    if (!isValidationPopupOpen || !isValidationComplete) return;

    const fadeTimer = window.setTimeout(() => {
      setIsValidationPopupClosing(true);
    }, 2800);
    const closeTimer = window.setTimeout(() => {
      setIsValidationPopupOpen(false);
      setIsValidationPopupClosing(false);
      setIsValidationComplete(false);
      setValidationItems([]);
    }, 3300);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(closeTimer);
    };
  }, [isValidationComplete, isValidationPopupOpen]);

  const focusValidationItem = useCallback((itemId: string) => {
    if (itemId.startsWith('dynamic.')) {
      dynamicFormValidateRef.current?.focusField(
        itemId.slice('dynamic.'.length)
      );
      return;
    }

    const elementId = itemId === 'display.name' ? 'service-display-name' : null;
    if (!elementId) return;

    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => element?.focus({ preventScroll: true }), 350);
  }, []);

  const fetchSubscriptionStatus = useCallback(
    async (currentSubCategoryId: number) => {
      let subscription: 'active' | 'missing' | 'unknown' = 'unknown';

      try {
        const response = await axiosPrivate.get(
          `/subscription/subcategory/${currentSubCategoryId}?status=ACTIVE`
        );
        if (response.data?.status === 'SUCCESS') {
          subscription = response.data?.data?.length ? 'active' : 'missing';
        }
      } catch (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
      }

      setRegistrationResult({
        subCategoryId: currentSubCategoryId,
        subscription,
      });
    },
    [axiosPrivate]
  );

  // Handle form submission
  const handleSubmit = async () => {
    if (registrationResult || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      setBackendErrors([]);

      const displayErrors = getServiceDisplaySettingsErrors({
        name: serviceData.name || '',
        nameEn: serviceData.nameEn || '',
        description: serviceData.description || '',
        logo: serviceData.logo,
        backgroundImage: serviceData.backgroundImage,
        keywords: serviceData.keywords || [],
        tags: serviceData.tags || [],
      });
      setDisplaySettingsErrors(displayErrors);

      const dynamicValidation =
        await dynamicFormValidateRef.current?.validateWithStatus();
      const isDynamicFormValid = dynamicValidation?.isValid ?? true;
      const nextValidationItems = [
        ...getMainValidationItems(displayErrors),
        ...(dynamicValidation?.items || []),
      ];
      setValidationItems(
        nextValidationItems
          .filter((item) => !item.isValid)
          .map((item) => ({ ...item, isFading: false }))
      );
      setIsValidationComplete(false);
      setIsValidationPopupClosing(false);

      if (Object.keys(displayErrors).length > 0 || !isDynamicFormValid) {
        const firstInvalidItem = nextValidationItems.find(
          (item) => !item.isValid
        );
        setError('لطفاً خطاهای فرم را برطرف کنید');
        setIsValidationPopupCollapsed(false);
        setIsValidationPopupOpen(true);
        setIsLoading(false);
        // Let the popup's initial validation pass finish before moving focus.
        // This keeps a concurrent schema validation from stealing focus back.
        window.setTimeout(() => {
          if (firstInvalidItem) focusValidationItem(firstInvalidItem.id);
        }, 500);
        return;
      }

      if (!serviceData.subCategoryId) {
        setError('زیرشاخه تعیین نشده است');
        setIsValidationPopupCollapsed(false);
        setIsValidationPopupOpen(true);
        setIsLoading(false);
        return;
      }

      // Read directly from DynamicForm at submit time. Its onChange callback is
      // debounced, so relying on state here can otherwise omit the latest edit.
      const formattedDynamicFormData =
        dynamicFormValidateRef.current?.getFormattedData() ?? dynamicFormData;
      setIsValidationPopupOpen(false);
      setValidationItems([]);

      const galleryFiles = [serviceData.logo, serviceData.backgroundImage]
        .filter((id): id is string => Boolean(id))
        .map((id) => ({ id }));

      // Uploaded images are temporary file IDs. The service endpoint attaches
      // them through galleryFiles; logo/backgroundImage are not file fields in
      // the create contract.
      const serviceToCreate: ServiceDTO = {
        name: serviceData.name || '',
        nameEn: serviceData.nameEn || '',
        description: serviceData.description || '',
        subCategoryId: serviceData.subCategoryId || 0,
        galleryFiles,
        keyWords: serviceData.keywords || [],
        tags: serviceData.tags || [],
        data: formattedDynamicFormData,
        ranking: 0,
        rankingAll: 0,
        elasticFields: [],
        additionalData: {},
      };

      console.log('Submitting service:', serviceToCreate);

      const response = await serviceApi.createService(serviceToCreate);

      if (response && response.status === 'SUCCESS') {
        await fetchSubscriptionStatus(serviceToCreate.subCategoryId);
      } else {
        const responseErrors = normalizeBackendErrors(response);
        setBackendErrors(responseErrors);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error creating service:', err);
      setBackendErrors(normalizeBackendErrors(err));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 md:px-6 md:pt-6 lg:px-8">
      <CompanySuccessDialog
        open={Boolean(registrationResult)}
        title="اطلاعات شما با موفقیت ثبت شد"
        description={
          registrationResult?.subscription === 'active'
            ? 'اشتراک فعال این زیرخدمت تأیید شد. اطلاعات ثبت‌شده برای بررسی در اختیار کارشناسان ما قرار می‌گیرد.'
            : registrationResult?.subscription === 'unknown'
            ? 'اطلاعات شما ذخیره شد، اما بررسی وضعیت اشتراک انجام نشد. وضعیت را از صفحه کسب‌وکارهای من پیگیری کنید.'
            : 'برای انتشار این مورد، اشتراک زیرخدمت مربوط را انتخاب و تهیه کنید.'
        }
        notice={
          registrationResult?.subscription === 'active'
            ? 'اطلاعات ثبت‌شده پس از بررسی کارشناسان ما، حداکثر تا ۷۲ ساعت منتشر می‌شود.'
            : 'ثبت اطلاعات تکمیل شده است. انتشار آن پس از تهیه اشتراک و بررسی کارشناسان انجام می‌شود.'
        }
        purchased={registrationResult?.subscription === 'active'}
        statusLabel={
          registrationResult?.subscription === 'active'
            ? 'اشتراک فعال تأیید شد'
            : 'اطلاعات خدمت ذخیره شد'
        }
        steps={['ثبت اطلاعات', 'تهیه اشتراک', 'بررسی و انتشار']}
        stepsAriaLabel="مراحل انتشار خدمت"
        actionLabel={
          registrationResult?.subscription === 'missing'
            ? 'انتخاب و خرید اشتراک'
            : 'رفتن به کسب‌وکارهای من'
        }
        onContinue={() =>
          router.replace(
            registrationResult?.subscription === 'missing'
              ? `/bundle/${registrationResult.subCategoryId}/buy`
              : routes.info.dashboard
          )
        }
        onLater={
          registrationResult?.subscription === 'missing'
            ? () => router.replace(routes.info.dashboard)
            : undefined
        }
      />
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-primary-lighter bg-gradient-to-l from-primary-lighter/40 via-white to-white p-5 shadow-sm dark:via-gray-0 dark:to-gray-0 md:p-7">
        <div className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-primary-lighter/40 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-primary hover:text-primary"
              aria-label="بازگشت"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-lighter px-3 py-1 text-xs font-semibold text-primary-dark">
                  بانک خدمات
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  ثبت مورد جدید
                </span>
              </div>
              <Title className="text-2xl font-bold text-gray-1000 md:text-3xl">
                {pageTitle}
              </Title>
              <p className="mt-2 max-h-[5.25rem] max-w-2xl overflow-hidden text-sm leading-7 text-gray-600 md:max-h-none md:text-base">
                {pageDescription}
              </p>
            </div>
          </div>

          <div className="grid min-w-fit grid-cols-2 gap-2 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm backdrop-blur">
            <a
              href="#display-information"
              onClick={(event) => scrollToSection(event, 'display-information')}
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              <Eye className="h-4 w-4" />
              معرفی خدمت
            </a>
            <a
              href="#specialized-information"
              onClick={(event) =>
                scrollToSection(event, 'specialized-information')
              }
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              اطلاعات تخصصی
            </a>
          </div>
        </div>
      </header>

      {error && <CustomAlert variant="danger">{error}</CustomAlert>}

      <SchemaErrorDialog
        open={Boolean(schemaError)}
        retrying={schemaLoading}
        onRetry={retrySchema}
        onCancel={() => router.replace(routes.dashboard)}
      />

      <section
        id="display-information"
        className="mb-6 scroll-mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:bg-gray-0"
      >
        <SectionHeading
          number="۱"
          icon={<Eye className="h-5 w-5" />}
          title="معرفی و نمایش خدمت"
          description="اطلاعاتی که کاربران در کارت و صفحه اختصاصی این خدمت مشاهده می‌کنند."
        />
        <div className="p-4 md:p-6">
          <ServiceDisplaySettings
            values={{
              name: serviceData.name || '',
              nameEn: serviceData.nameEn || '',
              description: serviceData.description || '',
              logo: serviceData.logo,
              backgroundImage: serviceData.backgroundImage,
              keywords: serviceData.keywords || [],
              tags: serviceData.tags || [],
              currentLogo: (serviceData as any).currentLogo,
              currentBackgroundImage: (serviceData as any)
                .currentBackgroundImage,
            }}
            onChange={handleDisplaySettingsChange}
            fieldErrors={displaySettingsErrors}
          />
        </div>
      </section>

      {schemaLoading ? (
        <div className="min-h-56 flex items-center justify-center rounded-3xl border border-gray-200 bg-white py-10 shadow-sm">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-sm text-gray-500">
              در حال آماده‌سازی فرم تخصصی...
            </p>
          </div>
        </div>
      ) : schema ? (
        <section
          id="specialized-information"
          className="scroll-mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:bg-gray-0"
        >
          <SectionHeading
            number="۲"
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="جزئیات تخصصی"
            description={`مشخصات موردنیاز برای «${pageTitle}» را کامل کنید. فیلدهای ستاره‌دار الزامی هستند.`}
          />
          <div className="p-4 md:p-6">
            <DynamicForm
              schema={schema}
              initialData={serviceData.data || {}}
              onSubmit={handleDynamicFormSubmit}
              onChange={handleDynamicDataChange}
              loading={isLoading}
              hideSubmit={true}
              clientPanel={true}
              hideFormHeader={true}
              surface="plain"
              className="max-w-none"
              validateRef={dynamicFormValidateRef}
            />
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-4 z-30 mt-6 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:bg-gray-0/95 md:p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-lighter text-primary-dark">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                آماده ثبت اطلاعات هستید؟
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                پیش از ذخیره، موارد الزامی به‌صورت خودکار بررسی می‌شوند.
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              انصراف
            </Button>

            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading || schemaLoading || subcategoriesLoading}
              className="flex-1 gap-2 px-5 sm:flex-none"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'در حال ذخیره...' : 'ثبت اطلاعات'}
            </Button>
          </div>
        </div>
      </div>
      {isValidationPopupOpen && (
        <ValidationStatusPopup
          items={validationItems}
          isComplete={isValidationComplete}
          isClosing={isValidationPopupClosing}
          isCollapsed={isValidationPopupCollapsed}
          onItemClick={focusValidationItem}
          onCollapse={() => setIsValidationPopupCollapsed(true)}
          onExpand={() => setIsValidationPopupCollapsed(false)}
        />
      )}
      {backendErrors.length > 0 && (
        <BackendErrorsPopup
          errors={backendErrors}
          onClose={() => setBackendErrors([])}
        />
      )}
    </div>
  );
}

function SchemaErrorDialog({
  open,
  retrying,
  onRetry,
  onCancel,
}: {
  open: boolean;
  retrying: boolean;
  onRetry: () => void | Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      className="relative z-[9999]"
      dir="rtl"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="relative w-full max-w-md rounded-3xl bg-white p-6 text-right shadow-2xl dark:bg-gray-100 sm:p-8">
            <button
              type="button"
              onClick={onCancel}
              className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="انصراف و بازگشت به داشبورد"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-lighter text-red-dark">
              <ServerCrash className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="mb-2 text-sm font-medium text-red-dark">
              خطا در ارتباط با سرور
            </p>
            <Dialog.Title className="text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl">
              دریافت فرم تخصصی امکان‌پذیر نیست
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
              در حال حاضر دریافت ساختار این فرم از سرور با خطا مواجه شده است.
              لطفاً کمی دیگر دوباره تلاش کنید.
            </Dialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw
                  className={`h-5 w-5 ${retrying ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                {retrying ? 'در حال تلاش مجدد...' : 'تلاش مجدد'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

function SectionHeading({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4 md:px-6 md:py-5">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-lighter text-primary-dark">
        {icon}
        <span className="min-w-5 absolute -left-1 -top-1 flex h-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {number}
        </span>
      </div>
      <div>
        <h2 className="font-semibold text-gray-1000 md:text-lg">{title}</h2>
        <p className="mt-1 text-xs leading-6 text-gray-500 md:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function ValidationStatusPopup({
  items,
  isComplete,
  isClosing,
  isCollapsed,
  onItemClick,
  onCollapse,
  onExpand,
}: {
  items: ValidationPopupItem[];
  isComplete: boolean;
  isClosing: boolean;
  isCollapsed: boolean;
  onItemClick: (itemId: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  const hasErrors = !isComplete;
  const popupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isCollapsed || isClosing) return;

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
  }, [isCollapsed, isClosing, onCollapse]);

  return (
    <section
      className="max-w-80 fixed bottom-24 left-4 z-[100] w-[calc(100%-2rem)] transition-transform duration-300 ease-out sm:left-6 sm:w-80"
      style={{
        transform: isClosing
          ? 'translateX(calc(-100% - 1.5rem))'
          : isCollapsed
          ? 'translateX(calc(-100% + 3.5rem))'
          : 'translateX(0)',
      }}
      aria-label="پنل وضعیت تکمیل فرم"
    >
      <aside
        ref={popupRef}
        role={isCollapsed ? undefined : 'dialog'}
        aria-live="polite"
        aria-hidden={isCollapsed}
        aria-label="وضعیت تکمیل فرم"
        className={`flex max-h-[26rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-opacity duration-200 dark:border-gray-700 dark:bg-gray-900 ${
          isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        dir="rtl"
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3 ${
            hasErrors
              ? 'border-red-light bg-red-lighter dark:border-red-dark dark:bg-red-dark/20'
              : 'border-green-light bg-green-lighter dark:border-green-dark dark:bg-green-dark/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {hasErrors ? (
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green" />
            )}
            <div>
              <p
                className={`font-semibold ${
                  hasErrors ? 'text-red-dark' : 'text-green-dark'
                }`}
              >
                {hasErrors
                  ? `${items.length} مورد نیاز به اصلاح دارد`
                  : 'تمامی موارد درست است'}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                {hasErrors
                  ? 'برای رفتن به هر فیلد، روی همان مورد کلیک کنید.'
                  : 'اطلاعات آماده ذخیره است.'}
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
              className={`flex w-full items-start gap-2.5 overflow-hidden rounded-xl border px-3 py-2 text-right transition-all duration-500 focus:outline-none focus:ring-2 ${
                item.isValid
                  ? item.isFading
                    ? 'max-h-0 translate-x-4 border-transparent py-0 opacity-0'
                    : 'max-h-24 border-green bg-green-lighter text-green-dark opacity-100 ring-green dark:border-green-light dark:bg-green-dark/20 dark:text-green-lighter'
                  : 'border-red-light bg-red-lighter text-red-dark ring-red hover:border-red hover:bg-red-light/20 dark:border-red-dark dark:bg-red-dark/20 dark:text-red-lighter'
              }`}
            >
              {item.isValid ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-dark" />
              )}
              <div>
                <p className="text-sm font-medium text-black dark:text-white">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs opacity-80">{item.message}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <button
        type="button"
        onClick={onExpand}
        aria-label={`باز کردن پنل خطاها؛ ${items.length} مورد`}
        className={`absolute right-0 top-1/2 flex h-20 w-14 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-r-2xl border border-l-0 shadow-xl transition-opacity duration-200 ${
          hasErrors
            ? 'border-red-light bg-red-lighter text-red-dark'
            : 'border-green-light bg-green-lighter text-green-dark'
        } ${
          isCollapsed && !isClosing
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <span className="text-sm font-bold">{items.length}</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}

function BackendErrorsPopup({
  errors,
  onClose,
}: {
  errors: BackendErrorItem[];
  onClose: () => void;
}) {
  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed bottom-28 left-5 z-[110] w-[calc(100%-2.5rem)] max-w-md overflow-hidden rounded-2xl border border-red-light bg-white shadow-2xl dark:bg-gray-900"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-red-light bg-red-lighter px-5 py-4">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-dark" />
          <div>
            <p className="font-semibold text-red-dark">
              اطلاعات توسط سرور پذیرفته نشد
            </p>
            <p className="mt-1 text-xs text-gray-600">
              موارد زیر را اصلاح کرده و دوباره تلاش کنید.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-gray-500 transition hover:bg-white/80 hover:text-gray-900"
          aria-label="بستن خطاهای سرور"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto p-4">
        {errors.map((backendError) => (
          <div
            key={backendError.id}
            className="rounded-xl border border-red-light bg-red-lighter/40 px-3 py-2.5"
          >
            {backendError.label && (
              <p className="text-sm font-semibold text-gray-900">
                {backendError.label}
              </p>
            )}
            <p className="mt-0.5 text-xs leading-5 text-red-dark">
              {backendError.message}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
