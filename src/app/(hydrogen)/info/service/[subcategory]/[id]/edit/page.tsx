// 'use client';
//
// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Text, Button, Input, Textarea, Alert } from 'rizzui';
// import { ChevronLeft, Trash2 } from 'lucide-react';
// import { useServiceApi, ServiceDTO } from '@/app/api/services';
// import DynamicForm from '@/components/ui/dynamic-form';
// import { routes } from '@/config/routes';
// import Spinner from '@/components/ui/spinner';
// import ConfirmationModal from '@/components/ui/confirmation-modal';
// import {CustomAlert, Card, Title} from "@/components/ui/compatible-components";
//
// export default function ServiceEditPage() {
//     const { subcategory, id } = useParams();
//     const router = useRouter();
//     const serviceApi = useServiceApi();
//
//     // States
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [serviceData, setServiceData] = useState<Partial<ServiceDTO> | null>(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//
//     // Fetch service data
//     useEffect(() => {
//         const fetchService = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await serviceApi.getServiceById(Number(id));
//
//                 if (response && response.status === 'SUCCESS' && response.data) {
//                     setServiceData(response.data);
//                 } else {
//                     setError('خطا در دریافت اطلاعات سرویس');
//                 }
//             } catch (err) {
//                 console.error('Error fetching service:', err);
//                 setError('خطا در دریافت اطلاعات سرویس');
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//
//         if (id) {
//             fetchService();
//         }
//     }, [id, serviceApi]);
//
//     // Handle basic form fields change
//     const handleBasicFieldChange = (field: keyof ServiceDTO, value: any) => {
//         if (!serviceData) return;
//
//         setServiceData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };
//
//     // Handle dynamic form data change
//     const handleDynamicDataChange = (data: any) => {
//         console.log(`data: ${data}`)
//
//         if (!serviceData) return;
//         setServiceData(prev => ({
//             ...prev,
//             data
//         }));
//     };
//
//     // Handle form submission
//     const handleSubmit = async () => {
//         if (!serviceData) return;
//
//         try {
//             setIsSubmitting(true);
//             setError(null);
//
//             if (!serviceData.name) {
//                 setError('نام سرویس الزامی است');
//                 setIsSubmitting(false);
//                 return;
//             }
//
//             if (!serviceData.subCategoryId) {
//                 setError('زیرشاخه تعیین نشده است');
//                 setIsSubmitting(false);
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
//             // Update service
//             const serviceToUpdate: ServiceDTO = {
//                 id: Number(id),
//                 name: serviceData.name || '',
//                 nameEn: serviceData.nameEn || '',
//                 ranking: serviceData.ranking || 0,
//                 rankingAll: serviceData.rankingAll || 0,
//                 description: serviceData.description || '',
//                 subCategoryId: serviceData.subCategoryId || 0,
//                 elasticFields: elasticFieldsArray,
//                 data: serviceData.data || {},
//                 additionalData: serviceData.additionalData || null
//             };
//
//             const response = await serviceApi.updateService(Number(id), serviceToUpdate);
//
//             if (response && response.status === 'SUCCESS') {
//                 // Navigate to the service list
//                 router.push(routes.info.serviceIndustrySubCategoryList(subcategory as string));
//             } else {
//                 setError('خطا در بروزرسانی سرویس');
//             }
//         } catch (err) {
//             console.error('Error updating service:', err);
//             setError('خطا در بروزرسانی سرویس');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     // Handle service deletion
//     const handleDelete = async () => {
//         try {
//             setIsDeleting(true);
//             setError(null);
//
//             const response = await serviceApi.deleteService(Number(id));
//
//             if (response && response.status === 'SUCCESS') {
//                 // Navigate to the service list
//                 router.push(routes.info.serviceIndustrySubCategoryList(subcategory as string));
//             } else {
//                 setError('خطا در حذف سرویس');
//                 setShowDeleteModal(false);
//             }
//         } catch (err) {
//             console.error('Error deleting service:', err);
//             setError('خطا در حذف سرویس');
//             setShowDeleteModal(false);
//         } finally {
//             setIsDeleting(false);
//         }
//     };
//
//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center py-10">
//                 <Spinner size="xl" />
//                 <Text className="ms-3">در حال بارگذاری...</Text>
//             </div>
//         );
//     }
//
//     if (!serviceData) {
//         return (
//             <div className="p-4 md:p-6 lg:p-8">
//                 <CustomAlert variant="danger">
//                     سرویس پیدا نشد یا خطا در بارگذاری اطلاعات
//                 </CustomAlert>
//                 <Button
//                     variant="outline"
//                     className="mt-4"
//                     onClick={() => router.back()}
//                 >
//                     بازگشت
//                 </Button>
//             </div>
//         );
//     }
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
//                     <Title className="text-xl md:text-2xl">ویرایش {serviceData.name}</Title>
//                 </div>
//
//                 <Button
//                     variant="text"
//                     color="danger"
//                     onClick={() => setShowDeleteModal(true)}
//                     disabled={isSubmitting || isDeleting}
//                 >
//                     <Trash2 className="h-5 w-5 mr-1" />
//                     حذف
//                 </Button>
//             </div>
//
//             {error && (
//                 <CustomAlert variant="danger" className="mb-6">
//                     {error}
//                 </CustomAlert>
//             )}
//
//             <Card className="mb-8">
//                 <div className="p-6">
//                     <Title className="text-lg mb-4">اطلاعات پایه</Title>
//
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <Input
//                             label="نام سرویس"
//                             placeholder="نام سرویس را وارد کنید"
//                             value={serviceData.name}
//                             onChange={(e) => handleBasicFieldChange('name', e.target.value)}
//                             error={!serviceData.name ? 'نام سرویس الزامی است' : ''}
//                             required
//                         />
//
//                         <Input
//                             label="نام انگلیسی سرویس"
//                             placeholder="نام انگلیسی سرویس را وارد کنید"
//                             value={serviceData.nameEn}
//                             onChange={(e) => handleBasicFieldChange('nameEn', e.target.value)}
//                         />
//
//                         <Input
//                             type="number"
//                             label="رتبه"
//                             placeholder="رتبه"
//                             disabled
//                             value={serviceData.ranking}
//                             // onChange={(e) => handleBasicFieldChange('ranking', Number(e.target.value))}
//                         />
//
//                         <Input
//                             type="number"
//                             label="رتبه کلی"
//                             placeholder="رتبه کلی"
//                             disabled
//                             value={serviceData.rankingAll}
//                             // onChange={(e) => handleBasicFieldChange('rankingAll', Number(e.target.value))}
//                         />
//
//                         <Input
//                             type="number"
//                             label="بازدید در سایت"
//                             placeholder="بازدید در سایت"
//                             disabled
//                             value={serviceData.visit}
//                             className="col-span-1 md:col-span-2"
//                             // onChange={(e) => handleBasicFieldChange('visit', Number(e.target.value))}
//                         />
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
//                             placeholder="توضیحات سرویس را وارد کنید"
//                             value={serviceData.description}
//                             onChange={(e) => handleBasicFieldChange('description', e.target.value)}
//                             className="col-span-1 md:col-span-2"
//                             rows={4}
//                         />
//                     </div>
//                 </div>
//             </Card>
//
//             {serviceData.serviceSchemaDTO ? (
//                 <Card>
//                     <div className="p-6">
//                         <Title className="text-lg mb-4">اطلاعات تخصصی</Title>
//
//                         <DynamicForm
//                             schema={serviceData.serviceSchemaDTO}
//                             initialData={serviceData.data}
//                             onSubmit={handleDynamicDataChange}
//                             loading={isSubmitting}
//                             hideSubmit={true}
//                         />
//                     </div>
//                 </Card>
//             ) : (
//                 <CustomAlert variant="warning" className="mb-6">
//                     اطلاعات ساختار فرم موجود نیست
//                 </CustomAlert>
//             )}
//
//             <div className="mt-6 flex justify-end">
//                 <Button
//                     variant="outline"
//                     className="ml-3"
//                     onClick={() => router.back()}
//                     disabled={isSubmitting || isDeleting}
//                 >
//                     انصراف
//                 </Button>
//
//                 <Button
//                     onClick={handleSubmit}
//                     isLoading={isSubmitting}
//                     disabled={!serviceData.name || !serviceData.subCategoryId || isDeleting}
//                 >
//                     {isSubmitting ? 'در حال ذخیره...' : 'بروزرسانی سرویس'}
//                 </Button>
//             </div>
//
//             <ConfirmationModal
//                 isOpen={showDeleteModal}
//                 onClose={() => setShowDeleteModal(false)}
//                 onConfirm={handleDelete}
//                 title="حذف سرویس"
//                 description={`آیا از حذف سرویس "${serviceData.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
//                 confirmText="حذف"
//                 cancelText="انصراف"
//                 isLoading={isDeleting}
//                 variant="danger"
//             />
//         </div>
//     );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Text, Button } from 'rizzui';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useServiceApi, ServiceDTO, ServiceFileDTO } from '@/app/api/services';
import DynamicForm, {
  DynamicFormValidateRef,
} from '@/components/ui/dynamic-form';
import { routes } from '@/config/routes';
import Spinner from '@/components/ui/spinner';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import {
  CustomAlert,
  Card,
  Title,
} from '@/components/ui/compatible-components';
import ServiceDisplaySettings, {
  ServiceDisplaySettingsValues,
} from '@/app/shared/info/service/service-display-settings';
import { getServiceDisplaySettingsErrors } from '@/app/shared/info/service/form-utils';

export default function ServiceEditPage() {
  const { subcategory, id } = useParams();
  const router = useRouter();
  const serviceApi = useServiceApi();

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<Partial<ServiceDTO> | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [displaySettingsErrors, setDisplaySettingsErrors] = useState<
    Partial<Record<keyof ServiceDisplaySettingsValues, string>>
  >({});
  const dynamicFormValidateRef = useRef<DynamicFormValidateRef | null>(null);

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        const response = await serviceApi.getServiceById(Number(id));

        if (response && response.status === 'SUCCESS' && response.data) {
          let serviceFiles: ServiceFileDTO[] = [];
          try {
            serviceFiles = await serviceApi.getServiceFiles(Number(id));
          } catch (fileError) {
            // The core service can still be edited when its optional
            // gallery request fails; newly uploaded files will work.
            console.error('Error fetching service files:', fileError);
          }

          const logoFile = serviceFiles.find(
            (file) => file.fileServiceType === 'SERVICE_LOGO'
          );
          const backgroundFile = serviceFiles.find(
            (file) => file.fileServiceType === 'SERVICE_BACKGROUND_IMAGE'
          );

          setServiceData({
            ...response.data,
            logo: logoFile?.id || '',
            backgroundImage: backgroundFile?.id || '',
            currentLogo: logoFile?.filePath || response.data.logo,
            currentBackgroundImage:
              backgroundFile?.filePath || response.data.backgroundImage,
            keywords: response.data.keywords || response.data.keyWords || [],
            galleryFiles: serviceFiles.map((file) => ({ id: file.id })),
          });
        } else {
          setError('خطا در دریافت اطلاعات سرویس');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('خطا در دریافت اطلاعات سرویس');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, serviceApi]);

  const handleDisplaySettingsChange = (
    field: keyof ServiceDisplaySettingsValues,
    value: any
  ) => {
    if (!serviceData) return;

    setServiceData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  // Handle dynamic form data change - called when DynamicForm values change
  const handleDynamicDataChange = (data: any) => {
    console.log(`Form data changed:`, data);

    if (!serviceData) return;
    setServiceData((prev) => ({
      ...prev,
      data,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!serviceData) return;

    try {
      setIsSubmitting(true);
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
        setIsSubmitting(false);
        return;
      }

      if (!serviceData.subCategoryId) {
        setError('زیرشاخه تعیین نشده است');
        setIsSubmitting(false);
        return;
      }

      const formattedDynamicFormData =
        dynamicFormValidateRef.current?.getFormattedData() ??
        serviceData.data ??
        {};

      const galleryFiles = [
        ...(serviceData.galleryFiles || []).map((file) => file.id),
        serviceData.logo,
        serviceData.backgroundImage,
      ]
        .filter((fileId): fileId is string => Boolean(fileId))
        .filter((fileId, index, allIds) => allIds.indexOf(fileId) === index)
        .map((fileId) => ({ id: fileId }));

      // Prepare elastic fields (comma-separated tags to array)
      let elasticFieldsArray: string[] = [];
      if (typeof serviceData.elasticFields === 'string') {
        elasticFieldsArray = serviceData.elasticFields
          .split(',')
          .map((field) => field.trim())
          .filter((field) => field);
      } else if (Array.isArray(serviceData.elasticFields)) {
        elasticFieldsArray = serviceData.elasticFields;
      }

      // Update service
      const serviceToUpdate: ServiceDTO = {
        id: Number(id),
        name: serviceData.name || '',
        nameEn: serviceData.nameEn || '',
        ranking: serviceData.ranking || 0,
        rankingAll: serviceData.rankingAll || 0,
        description: serviceData.description || '',
        subCategoryId: serviceData.subCategoryId || 0,
        galleryFiles,
        keyWords: serviceData.keywords || serviceData.keyWords || [],
        tags: serviceData.tags || [],
        elasticFields: elasticFieldsArray,
        data: formattedDynamicFormData,
        additionalData: serviceData.additionalData || {},
      };

      const response = await serviceApi.updateService(
        Number(id),
        serviceToUpdate
      );

      if (response && response.status === 'SUCCESS') {
        // Navigate to the service list
        router.push(
          routes.info.serviceIndustrySubCategoryList(subcategory as string)
        );
      } else {
        setError('خطا در بروزرسانی سرویس');
      }
    } catch (err: any) {
      console.error('Error updating service:', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.[0]?.message ||
          'خطا در بروزرسانی سرویس'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle service deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await serviceApi.deleteService(Number(id));

      if (response && response.status === 'SUCCESS') {
        // Navigate to the service list
        router.push(
          routes.info.serviceIndustrySubCategoryList(subcategory as string)
        );
      } else {
        setError('خطا در حذف سرویس');
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('خطا در حذف سرویس');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="xl" />
        <Text className="ms-3">در حال بارگذاری...</Text>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <CustomAlert variant="danger">
          سرویس پیدا نشد یا خطا در بارگذاری اطلاعات
        </CustomAlert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          بازگشت
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="text" className="mr-2" onClick={() => router.back()}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Title className="text-xl md:text-2xl">
            ویرایش {serviceData.name}
          </Title>
        </div>

        <Button
          variant="text"
          color="danger"
          onClick={() => setShowDeleteModal(true)}
          disabled={isSubmitting || isDeleting}
        >
          <Trash2 className="mr-1 h-5 w-5" />
          حذف
        </Button>
      </div>

      {error && (
        <CustomAlert variant="danger" className="mb-6">
          {error}
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
              currentLogo: serviceData.currentLogo,
              currentBackgroundImage: serviceData.currentBackgroundImage,
            }}
            onChange={handleDisplaySettingsChange}
            fieldErrors={displaySettingsErrors}
          />
        </div>
      </Card>

      {serviceData.serviceSchemaDTO ? (
        <DynamicForm
          schema={serviceData.serviceSchemaDTO}
          initialData={serviceData.data}
          onSubmit={handleDynamicDataChange}
          onChange={handleDynamicDataChange}
          loading={isSubmitting}
          hideSubmit={true}
          clientPanel={true}
          hideFormHeader={true}
          className="max-w-none"
          validateRef={dynamicFormValidateRef}
        />
      ) : (
        <CustomAlert variant="warning" className="mb-6">
          اطلاعات ساختار فرم موجود نیست
        </CustomAlert>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          className="ml-3"
          onClick={() => router.back()}
          disabled={isSubmitting || isDeleting}
        >
          انصراف
        </Button>

        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={
            !serviceData.name || !serviceData.subCategoryId || isDeleting
          }
        >
          {isSubmitting ? 'در حال ذخیره...' : 'بروزرسانی سرویس'}
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="حذف سرویس"
        description={`آیا از حذف سرویس "${serviceData.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
