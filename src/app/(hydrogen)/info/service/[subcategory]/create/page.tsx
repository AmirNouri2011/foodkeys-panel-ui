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

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'rizzui';
import { ChevronLeft } from 'lucide-react';
import { useServiceSchema } from '@/hooks/use-service-subcategories';
import { useServiceApi, ServiceDTO } from '@/app/api/services';
import DynamicForm, {
  DynamicFormValidateRef,
} from '@/components/ui/dynamic-form';
import { routes } from '@/config/routes';
import Spinner from '@/components/ui/spinner';
import { Card, Title } from '@/components/ui/compatible-components';
import ServiceDisplaySettings, {
  ServiceDisplaySettingsValues,
} from '@/app/shared/info/service/service-display-settings';
import { getServiceDisplaySettingsErrors } from '@/app/shared/info/service/form-utils';
import useAxiosPrivate from '@/hooks/use-axios-private';

// Custom alert component to avoid the rizzui Alert issue
const CustomAlert = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = 'p-4 rounded-md mb-4 text-sm';
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    danger: 'bg-red-50 text-red-800',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default function ServiceCreatePage() {
  const { subcategory } = useParams();
  const router = useRouter();
  const serviceApi = useServiceApi();
  const axiosPrivate = useAxiosPrivate();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const dynamicFormValidateRef = useRef<DynamicFormValidateRef | null>(null);

  // Get schema for the subcategory
  const {
    schema,
    loading: schemaLoading,
    error: schemaError,
  } = useServiceSchema(subCategoryId);

  // Find subcategory ID from name
  useEffect(() => {
    const fetchSubCategoryId = async () => {
      try {
        // Using axiosPrivate instead of fetch
        const response = await axiosPrivate.get(
          `/subcategory/by-name/${subcategory}`
        );

        if (
          response.data &&
          response.data.status === 'SUCCESS' &&
          response.data.data
        ) {
          setSubCategoryId(response.data.data.subCategoryId);
          setServiceData((prev) => ({
            ...prev,
            subCategoryId: response.data.data.subCategoryId,
          }));
        } else {
          console.warn(
            'Using mock subcategory ID. Should implement proper lookup.'
          );
          const mockId =
            subcategory === 'exhibitions'
              ? 1
              : subcategory === 'conferences'
              ? 2
              : subcategory === 'employment'
              ? 3
              : 4;

          setSubCategoryId(mockId);
          setServiceData((prev) => ({
            ...prev,
            subCategoryId: mockId,
          }));
        }
      } catch (err) {
        console.error('Error fetching subcategory ID:', err);
        setError('خطا در یافتن زیرشاخه');

        // Fallback to a mock ID
        const mockId =
          subcategory === 'exhibitions'
            ? 1
            : subcategory === 'conferences'
            ? 2
            : subcategory === 'employment'
            ? 3
            : 4;

        setSubCategoryId(mockId);
        setServiceData((prev) => ({
          ...prev,
          subCategoryId: mockId,
        }));
      }
    };

    if (subcategory) {
      fetchSubCategoryId();
    }
  }, [subcategory, axiosPrivate]);

  const handleDisplaySettingsChange = (
    field: keyof ServiceDisplaySettingsValues,
    value: any
  ) => {
    setServiceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle dynamic form data change - this gets called when DynamicForm values change
  const handleDynamicDataChange = useCallback((data: any) => {
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

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

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

      const isDynamicFormValid =
        (await dynamicFormValidateRef.current?.validate()) ?? true;

      if (Object.keys(displayErrors).length > 0 || !isDynamicFormValid) {
        setError('لطفاً خطاهای فرم را برطرف کنید');
        setIsLoading(false);
        return;
      }

      if (!serviceData.subCategoryId) {
        setError('زیرشاخه تعیین نشده است');
        setIsLoading(false);
        return;
      }

      // Read directly from DynamicForm at submit time. Its onChange callback is
      // debounced, so relying on state here can otherwise omit the latest edit.
      const formattedDynamicFormData =
        dynamicFormValidateRef.current?.getFormattedData() ?? dynamicFormData;

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
        // Navigate to the service list
        router.replace(
          routes.info.serviceIndustrySubCategoryList(subcategory as string)
        );
      } else {
        setError('خطا در ایجاد سرویس');
      }
    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.[0]?.message ||
          'خطا در ایجاد سرویس'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="text" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Title className="text-xl md:text-2xl">
            ایجاد {subcategory} جدید
          </Title>
        </div>
      </div>

      {error && <CustomAlert variant="danger">{error}</CustomAlert>}

      {schemaError && (
        <CustomAlert variant="danger">
          خطا در بارگذاری ساختار فرم: {schemaError}
        </CustomAlert>
      )}

      <Card className="mb-8">
        <div className="p-6">
          <Title className="mb-4 text-lg">تنظیمات نمایش</Title>
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
      </Card>

      {schemaLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="xl" />
          <p className="ms-3">در حال بارگذاری فرم...</p>
        </div>
      ) : schema ? (
        <DynamicForm
          schema={schema}
          initialData={serviceData.data || {}}
          onSubmit={handleDynamicFormSubmit}
          onChange={handleDynamicDataChange}
          loading={isLoading}
          hideSubmit={true}
          clientPanel={true}
          hideFormHeader={true}
          className="max-w-none"
          validateRef={dynamicFormValidateRef}
        />
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          className="ml-3"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          انصراف
        </Button>

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!serviceData.name || !subCategoryId || schemaLoading}
        >
          {isLoading ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
        </Button>
      </div>
    </div>
  );
}
