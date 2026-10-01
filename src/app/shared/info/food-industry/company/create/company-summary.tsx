// import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import FormGroup from '@/app/shared/form-group';
// import cn from '@/utils/class-names';
// import dynamic from 'next/dynamic';
// import SelectLoader from '@/components/loader/select-loader';
// import { PiPlusBold } from 'react-icons/pi';
// import { Button } from '@/components/ui/button';
// import { ActionIcon } from '@/components/ui/action-icon';
// import TrashIcon from '@/components/icons/trash';
// import { useCallback, useEffect, useState } from 'react';
// import { Textarea } from '@/components/ui/textarea';
// import LogoUpload from '@/components/ui/logo-upload';
// import JalaliDatePicker from '@/components/ui/react-shamsi-date-picker';
// import useAxiosPrivate from '@/hooks/use-axios-private';
// import toast from 'react-hot-toast';
//
// const Select = dynamic(() => import('@/components/ui/select'), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });
//
// // Add interface for SimpleTempFileDTO
// interface SimpleTempFileDTO {
//   id: string;
//   fileName: string;
//   filePath: string;
// }
//
// export default function CompanySummary({
//                                          className,
//                                          category,
//                                        }: {
//   className?: string;
//   category: number;
// }) {
//   const _axios = useAxiosPrivate();
//   const [subcategories, setSubcategories] = useState<
//       { value: number; name: string }[]
//   >([]);
//   const [companyTypeOptions, setCompanyTypeOptions] = useState<
//       { value: string; name: string }[]
//   >([]);
//
//   // Updated states to handle logo information
//   const [logoFile, setLogoFile] = useState<File | null>(null);
//   const [logoLoading, setLogoLoading] = useState<boolean>(false);
//   const [logoProgress, setLogoProgress] = useState<number>(0);
//   const [logoError, setLogoError] = useState<string | null>(null);
//   const [logoSuccess, setLogoSuccess] = useState<boolean>(false);
//   const [establishDateValue, setEstablishDateValue] = useState<any>('');
//   const [logoData, setLogoData] = useState<SimpleTempFileDTO | null>(null);
//
//   useEffect(() => {
//     const fetchSubCategories = async () => {
//       try {
//         const response = await _axios.get(`/category/${category}/subcategory`);
//         if (response.data.status === 'SUCCESS') {
//           setSubcategories(response.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching subcategories:', error);
//       }
//     };
//     fetchSubCategories();
//   }, [_axios, category]);
//
//   useEffect(() => {
//     const fetchCompanyTypes = async () => {
//       try {
//         const response = await _axios.get(`/company/fetch/type`);
//         if (response.data.status === 'SUCCESS') {
//           setCompanyTypeOptions(response.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching company types:', error);
//       }
//     };
//     fetchCompanyTypes();
//   }, [_axios]);
//
//   const {
//     register,
//     control,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useFormContext();
//
//   const watchedLogo = watch('currentLogo', '');
//   const watchedCompanyType = watch('companyType', '');
//   const watchedEstablishDate = watch('establishDate', '');
//
//   useEffect(() => {
//     if (watchedEstablishDate)
//       setEstablishDateValue(new Date(watchedEstablishDate));
//   }, [watchedEstablishDate]);
//
//   // Handle successful logo upload
//   const handleLogoUploadSuccess = (fileData: SimpleTempFileDTO) => {
//     // Set logo data to state
//     setLogoData(fileData);
//
//     // Set the logo ID in the form - this is what will be sent to the server
//     setValue('logo', fileData.id);
//
//     // Set these for preview purposes
//     setValue('logoUrl', fileData.filePath);
//     setValue('currentLogo', fileData.filePath);
//
//     setLogoSuccess(true);
//     toast.success('لوگو با موفقیت آپلود شد');
//   };
//
//   // Logo preview URL handling
//   const logoPreview = logoData
//       ? `${STATIC_FILES_URL}${logoData.filePath}`
//       : watchedLogo
//           ? `${STATIC_FILES_URL}${watchedLogo}`
//           : null;
//
//   // Handle logo removal
//   const handleLogoRemove = () => {
//     setLogoData(null);
//     setValue('logo', null);  // This is what will be sent to the server to indicate logo removal
//     setValue('logoUrl', null);
//     setValue('currentLogo', null);
//     setLogoSuccess(false);
//   };
//
//   // Brand field array handling
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'brands',
//   });
//
//   const addCustomField = useCallback(() => {
//     if (fields.length < 50) {
//       append({
//         name: '',
//         nameEn: '',
//       });
//     } else {
//       toast.error('حداکثر ۳ برند میتوانید وارد کنید');
//     }
//   }, [append, fields.length]);
//
//   return (
//       <FormGroup
//           title="معرفی شرکت"
//           description="شامل نام شرکت، برندها و ..."
//           className={cn(className)}
//       >
//         {/* Logo upload in its own row */}
//         <div className="w-full col-span-full mb-6">
//           <LogoUpload
//               accept="image/*"
//               logoPreview={logoPreview}
//               loading={logoLoading}
//               progress={logoProgress}
//               error={logoError}
//               success={logoSuccess}
//               wrapperClassName="w-full"
//               onRemove={logoPreview ? handleLogoRemove : undefined}
//               onUploadSuccess={handleLogoUploadSuccess}
//           />
//           {logoError && (
//               <p className="text-red-500 text-sm mt-2 text-center">{logoError}</p>
//           )}
//         </div>
//
//         {/* Subcategory field */}
//         <div className="w-full col-span-full mb-6">
//           <Controller
//               name="subcategory"
//               control={control}
//               render={({ field: { onChange, value } }) => (
//                   <Select
//                       options={subcategories.map((subcategory) => ({
//                         value: subcategory.value,
//                         name: subcategory.name,
//                       }))}
//                       onChange={onChange}
//                       value={value}
//                       label="دسته بندی"
//                       error={errors?.subcategory?.message as string}
//                       placeholder="انتخاب"
//                       className="w-full"
//                   />
//               )}
//           />
//         </div>
//
//         <Input
//             label="نام شرکت*"
//             placeholder="نام شرکت"
//             {...register('companyName')}
//             error={errors.companyName?.message as string}
//             className="w-full"
//         />
//
//         <Input
//             label="نام شرکت به انگلیسی*"
//             placeholder="نام شرکت به انگلیسی"
//             {...register('companyNameEn')}
//             error={errors.companyNameEn?.message as string}
//             className="w-full"
//         />
//
//         <Input
//             label="نام تجاری (برند) اصلی*"
//             placeholder="نام تجاری (برند) اصلی"
//             {...register('primaryBrand')}
//             error={errors.primaryBrand?.message as string}
//             className="w-full"
//         />
//
//         <Input
//             label="نام تجاری (برند) اصلی به انگلیسی*"
//             placeholder="نام تجاری (برند) اصلی به انگلیسی"
//             {...register('mainBrandEn')}
//             error={errors.mainBrandEn?.message as string}
//             className="w-full"
//         />
//
//         <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
//           <div
//               className={`w-full ${
//                   watchedCompanyType?.value === 'OTHER' ? 'md:w-1/2' : 'md:w-full'
//               }`}
//           >
//             <Controller
//                 name="companyType"
//                 control={control}
//                 render={({ field: { onChange, value } }) => (
//                     <Select
//                         options={companyTypeOptions}
//                         value={value}
//                         onChange={onChange}
//                         label="نوع شرکت"
//                         error={errors?.companyType?.message as string}
//                         placeholder="انتخاب"
//                         isRequired
//                         className="w-full"
//                     />
//                 )}
//             />
//           </div>
//
//           {watchedCompanyType?.value === 'OTHER' && (
//               <div className="w-full md:w-1/2">
//                 <Input
//                     label="نوع شرکت"
//                     placeholder="نوع شرکت خود را بنویسید"
//                     {...register('companyTypeOther')}
//                     error={errors.companyTypeOther?.message as string}
//                     className="w-full"
//                 />
//               </div>
//           )}
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Controller
//               name="establishDate"
//               control={control}
//               render={({ field: { onChange, value, onBlur } }) => (
//                   <JalaliDatePicker
//                       selected={establishDateValue}
//                       onChange={(e: any) => {
//                         setEstablishDateValue(e);
//                         setValue('establishDate', e);
//                       }}
//                       dateFormat="yyyy-MM-dd'T'HH:mm:ss"
//                       maxDate={new Date()}
//                       placeholderText="تاریخ تاسیس"
//                       inputProps={{
//                         variant: 'outline',
//                         label: 'تاریخ تاسیس',
//                         inputClassName: 'p-4 border border-gray-300 rounded-md',
//                       }}
//                       popperPlacement="bottom-end"
//                       className="rmdp-mobile custom-calendar flex-grow"
//                   />
//               )}
//           />
//
//           <Input
//               label="تعداد کارکنان"
//               placeholder="تعداد کارکنان"
//               {...register('employeesCount')}
//               error={errors.employeesCount?.message as string}
//           />
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Input
//               label="متراژ بنای کارخانه"
//               placeholder="متراژ بنای کارخانه"
//               {...register('buildingArea')}
//               error={errors.buildingArea?.message as string}
//           />
//
//           <Input
//               label="متراژ زمین کارخانه"
//               placeholder="متراژ زمین کارخانه"
//               {...register('landArea')}
//               error={errors.landArea?.message as string}
//           />
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Input
//               label="نام و نام خانوادگی مدیر عامل*"
//               placeholder="نام مدیر عامل"
//               {...register('ceo')}
//               error={errors.ceo?.message as string}
//           />
//
//           <Input
//               dir='rtl'
//               type="tel"
//               label="تلفن همراه مدیر عامل"
//               placeholder="تلفن همراه مدیر عامل"
//               {...register('ceoPhoneNumber')}
//               error={errors.ceoPhoneNumber?.message as string}
//               helperText="(مثال: 09123456789)"
//           />
//         </div>
//
//         <Textarea
//             label="نام مالک یا سهامداران"
//             placeholder="نام مالک یا سهامداران"
//             {...register('companyStakeHolders')}
//             error={errors.companyStakeHolders?.message as string}
//             className="col-span-full"
//             rows={2}
//         />
//
//         {fields.map((item, index) => (
//             <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative border border-gray-200 rounded-lg p-6 pt-10">
//               <Input
//                   label="نام تجاری"
//                   placeholder="نام تجاری"
//                   className="flex-grow"
//                   {...register(`brands.${index}.name`)}
//               />
//
//               <Input
//                   label="نام تجاری به انگلیسی"
//                   placeholder="نام تجاری به انگلیسی"
//                   className="flex-grow"
//                   {...register(`brands.${index}.nameEn`)}
//               />
//
//               <ActionIcon
//                   onClick={() => remove(index)}
//                   variant="flat"
//                   className="absolute top-3 left-3"
//                   color="danger"
//               >
//                 <TrashIcon className="h-4 w-4 text-red-500" />
//               </ActionIcon>
//             </div>
//         ))}
//
//         <Button
//             onClick={addCustomField}
//             variant="outline"
//             className="col-span-full ml-auto w-auto"
//             disabled={fields.length >= 50}
//         >
//           <PiPlusBold className="me-2 h-4 w-4" strokeWidth={2} />
//           اضافه کردن نام تجاری جدید
//         </Button>
//
//         <Textarea
//             label="توضیحات شرکت"
//             placeholder="توضیحات شرکت"
//             {...register('description')}
//             error={errors.description?.message as string}
//             className="col-span-full"
//             rows={4}
//         />
//
//         <Input
//             className='w-full col-span-full'
//             label="شعار تبلیغاتی شرکت"
//             placeholder="شعار تبلیغاتی شرکت"
//             {...register('advertisingSlogan')}
//             error={errors.advertisingSlogan?.message as string}
//         />
//       </FormGroup>
//   );
// }

import { API_BASE_URL, STATIC_FILES_URL } from '@/config/api.config';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import TrashIcon from '@/components/icons/trash';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import LogoUpload from '@/components/ui/logo-upload';
import useAxiosPrivate from '@/hooks/use-axios-private';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useCompanyUploadValidation } from '@/hooks/use-company-upload-validation';
import { validateUploadFile } from '@/utils/file-upload-validation';
import FileUploadGuidelines from '@/components/ui/file-upload-guidelines';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});

// Add interface for SimpleTempFileDTO
interface SimpleTempFileDTO {
  id: string;
  fileName: string;
  originalFileName?: string;
  filePath: string;
}

// Interface for brand upload response
interface BrandImageUploadResponse {
  status: string;
  statusCode: number;
  message: string;
  data: SimpleTempFileDTO[];
}

export default function CompanySummary({
                                         className,
                                         category,
                                       }: {
  className?: string;
  category: number;
}) {
  const _axios = useAxiosPrivate();
  const logoValidation = useCompanyUploadValidation('COMPANY_LOGO');
  const brandValidation = useCompanyUploadValidation('BRAND_IMAGE');
  const [subcategories, setSubcategories] = useState<
      { value: number; name: string }[]
  >([]);
  const [companyTypeOptions, setCompanyTypeOptions] = useState<
      { value: string; name: string }[]
  >([]);

  // Updated states to handle logo information
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLoading, setLogoLoading] = useState<boolean>(false);
  const [logoProgress, setLogoProgress] = useState<number>(0);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoSuccess, setLogoSuccess] = useState<boolean>(false);
  const [logoData, setLogoData] = useState<SimpleTempFileDTO | null>(null);

  // State for brand image uploads
  const [brandImageUploading, setBrandImageUploading] = useState<{ [key: number]: boolean }>({});
  const [brandImageFileNames, setBrandImageFileNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await _axios.get(`/category/${category}/subcategory`);
        if (response.data.status === 'SUCCESS') {
          setSubcategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubCategories();
  }, [_axios, category]);

  useEffect(() => {
    const fetchCompanyTypes = async () => {
      try {
        const response = await _axios.get(`/company/fetch/type`);
        if (response.data.status === 'SUCCESS') {
          setCompanyTypeOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching company types:', error);
      }
    };
    fetchCompanyTypes();
  }, [_axios]);

  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const watchedLogo = watch('currentLogo', '');
  const watchedCompanyType = watch('companyType', '');

  // Handle successful logo upload
  const handleLogoUploadSuccess = (fileData: SimpleTempFileDTO) => {
    // Set logo data to state
    setLogoData(fileData);

    // Set the logo ID in the form - this is what will be sent to the server
    setValue('logo', fileData.id);

    // Set these for preview purposes
    setValue('logoUrl', fileData.filePath);
    setValue('currentLogo', fileData.filePath);

    setLogoSuccess(true);
    toast.success('لوگو با موفقیت آپلود شد');
  };

  // Logo preview URL handling
  const logoPreview = logoData
      ? `${STATIC_FILES_URL}${logoData.filePath}`
      : watchedLogo
          ? `${STATIC_FILES_URL}${watchedLogo}`
          : null;

  // Handle logo removal
  const handleLogoRemove = () => {
    setLogoData(null);
    setValue('logo', null);  // This is what will be sent to the server to indicate logo removal
    setValue('logoUrl', null);
    setValue('currentLogo', null);
    setLogoSuccess(false);
  };

  // Brand field array handling
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'brands',
  });

  // Function to upload brand image
  const uploadBrandImage = async (file: File, brandIndex: number) => {
    setBrandImageUploading(prev => ({ ...prev, [brandIndex]: true }));

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('fileServiceType', 'BRAND_IMAGE');

      const response = await _axios.post(
          `${API_BASE_URL}/file`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
      );

      if (response.data.status === 'SUCCESS' && response.data.data && response.data.data.length > 0) {
        const uploadedFile = response.data.data[0];
        // Set the brand image path in the form
        setValue(`brands.${brandIndex}.brandImage`, uploadedFile.filePath, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setBrandImageFileNames((current) => ({
          ...current,
          [uploadedFile.filePath]: uploadedFile.originalFileName || uploadedFile.fileName,
        }));
        toast.success('تصویر برند با موفقیت آپلود شد');
        return uploadedFile;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading brand image:', error);
      toast.error('خطا در آپلود تصویر برند');
      return null;
    } finally {
      setBrandImageUploading(prev => ({ ...prev, [brandIndex]: false }));
    }
  };

  // Handle brand image file selection
  const handleBrandImageChange = async (event: React.ChangeEvent<HTMLInputElement>, brandIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!brandValidation.ready || !brandValidation.validation) return;
    const validationError = await validateUploadFile(file, brandValidation.validation);
    event.target.value = '';
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await uploadBrandImage(file, brandIndex);
  };

  // Remove brand image
  const removeBrandImage = (brandIndex: number) => {
    setValue(`brands.${brandIndex}.brandImage`, '');
    toast.success('تصویر برند حذف شد');
  };

  const addCustomField = useCallback(() => {
    if (fields.length < 50) {
      append({
        name: '',
        nameEn: '',
        brandImage: '',
      });
    } else {
      toast.error('حداکثر ۵۰ برند میتوانید وارد کنید');
    }
  }, [append, fields.length]);

  return (
      <FormGroup
          title="معرفی شرکت"
          description="شامل نام شرکت، برندها و ..."
          className={cn(className)}
      >
        {/* Logo upload in its own row */}
        <div className="w-full col-span-full mb-6">
          <LogoUpload
              label="لوگوی شرکت"
              uploadValidation={logoValidation}
              accept="image/*"
              logoPreview={logoPreview}
              loading={logoLoading}
              progress={logoProgress}
              error={logoError}
              success={logoSuccess}
              wrapperClassName="w-full"
              onRemove={logoPreview ? handleLogoRemove : undefined}
              onUploadSuccess={handleLogoUploadSuccess}
          />
          {logoError && (
              <p className="text-red-500 text-sm mt-2 text-center">{logoError}</p>
          )}
        </div>

        {/* Subcategory field */}
        <div id="field-subcategory" className="w-full col-span-full mb-6">
          <Controller
              name="subcategory"
              control={control}
              render={({ field: { onChange, value } }) => (
                  <Select
                      options={subcategories.map((subcategory) => ({
                        value: subcategory.value,
                        name: subcategory.name,
                      }))}
                      onChange={onChange}
                      value={value}
                      label="دسته بندی*"
                      error={errors?.subcategory?.message as string}
                      placeholder="انتخاب"
                      className="w-full"
                  />
              )}
          />
        </div>

        <Input
            label="نام شرکت*"
            placeholder="نام شرکت"
            {...register('companyName')}
            error={errors.companyName?.message as string}
            className="w-full"
        />

        <Input
            label="نام شرکت به انگلیسی*"
            placeholder="نام شرکت به انگلیسی"
            {...register('companyNameEn')}
            error={errors.companyNameEn?.message as string}
            className="w-full"
        />

        <Input
            label="نام تجاری (برند) اصلی*"
            placeholder="نام تجاری (برند) اصلی"
            {...register('primaryBrand')}
            error={errors.primaryBrand?.message as string}
            className="w-full"
        />

        <Input
            label="نام تجاری (برند) اصلی به انگلیسی*"
            placeholder="نام تجاری (برند) اصلی به انگلیسی"
            {...register('mainBrandEn')}
            error={errors.mainBrandEn?.message as string}
            className="w-full"
        />

        <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
          <div
              id="field-companyType"
              className={`w-full ${
                  watchedCompanyType?.value === 'OTHER' ? 'md:w-1/2' : 'md:w-full'
              }`}
          >
            <Controller
                name="companyType"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <Select
                        options={companyTypeOptions}
                        value={value}
                        onChange={onChange}
                        label="نوع شرکت"
                        error={errors?.companyType?.message as string}
                        placeholder="انتخاب"
                        isRequired
                        className="w-full"
                    />
                )}
            />
          </div>

          {watchedCompanyType?.value === 'OTHER' && (
              <div className="w-full md:w-1/2">
                <Input
                    label="نوع شرکت"
                    placeholder="نوع شرکت خود را بنویسید"
                    {...register('companyTypeOther')}
                    error={errors.companyTypeOther?.message as string}
                    className="w-full"
                />
              </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
              id="field-establishDate"
              label="سال تأسیس*"
              placeholder="سال تأسیس"
              inputMode="numeric"
              maxLength={4}
              {...register('establishDate')}
              error={errors.establishDate?.message as string}
              helperText="(مثال: 1403)"
          />

          <Input
              label="تعداد کارکنان"
              placeholder="تعداد کارکنان"
              inputMode="numeric"
              {...register('employeesCount')}
              error={errors.employeesCount?.message as string}
              helperText="(مثال: 120)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
              label="متراژ بنای کارخانه"
              placeholder="متراژ بنای کارخانه"
              type="text"
              inputMode="text"
              {...register('buildingArea')}
              error={errors.buildingArea?.message as string}
              helperText="(مثال: ۱۲ متر مربع یا ۲ هکتار)"
          />

          <Input
              label="متراژ زمین کارخانه"
              placeholder="متراژ زمین کارخانه"
              type="text"
              inputMode="text"
              {...register('landArea')}
              error={errors.landArea?.message as string}
              helperText="(مثال: ۱۲ متر مربع یا ۲ هکتار)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
              label="نام و نام خانوادگی مدیر عامل*"
              placeholder="نام مدیر عامل"
              {...register('ceo')}
              error={errors.ceo?.message as string}
          />

          <Input
              dir='rtl'
              type="tel"
              inputMode="numeric"
              maxLength={11}
              label="تلفن همراه مدیر عامل"
              placeholder="تلفن همراه مدیر عامل"
              {...register('ceoPhoneNumber')}
              error={errors.ceoPhoneNumber?.message as string}
              helperText="(مثال: 09123456789)"
          />
        </div>

        <Textarea
            label="نام مالک یا سهامداران"
            placeholder="نام مالک یا سهامداران"
            {...register('companyStakeHolders')}
            error={errors.companyStakeHolders?.message as string}
            className="col-span-full"
            rows={2}
        />

        {/* Updated brands section with image upload */}
        {fields.map((item, index) => {
          const brandImagePath = watch(`brands.${index}.brandImage`);
          const brandImageFileName = brandImagePath
              ? brandImageFileNames[brandImagePath] ||
                decodeURIComponent(brandImagePath.split('/').pop()?.split('?')[0] || '')
              : '';

          return (
              <div key={item.id} className="@container/brand-card relative grid min-w-0 grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 pt-10 dark:border-gray-300 @md:p-6 @md:pt-10">
                {/* Brand Image Upload Section */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-600">
                    تصویر برند
                  </label>
                  <div className="flex min-w-0 flex-col gap-4 @md/brand-card:flex-row @md/brand-card:items-start">
                  {brandImagePath ? (
                      <div className="relative w-20 shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-300">
                          <Image
                              src={`${STATIC_FILES_URL}${brandImagePath}`}
                              alt={`Brand ${index + 1}`}
                              width={80}
                              height={80}
                              className="h-full w-full object-contain"
                              unoptimized
                          />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeBrandImage(index)}
                            aria-label={`حذف تصویر برند ${index + 1}`}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-red-light bg-red-lighter text-xs text-red-dark transition hover:bg-red-light focus-visible:ring-2 focus-visible:ring-red"
                        >
                          ×
                        </button>
                        {brandImageFileName && (
                            <p
                                className="mt-2 w-20 truncate text-center text-xs text-gray-500"
                                title={brandImageFileName}
                            >
                              <bdi>{brandImageFileName}</bdi>
                            </p>
                        )}
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <input
                            type="file"
                            id={`brand-image-${index}`}
                            accept={brandValidation.accept}
                            aria-describedby={`brand-image-rules-${index}`}
                            onChange={(e) => handleBrandImageChange(e, index)}
                            className="hidden"
                            disabled={brandImageUploading[index] || !brandValidation.ready}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById(`brand-image-${index}`)?.click()}
                            disabled={brandImageUploading[index] || !brandValidation.ready}
                            className={`cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-300 dark:text-gray-600 dark:hover:bg-gray-100 ${
                                brandImageUploading[index] || !brandValidation.ready ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {brandImageUploading[index] ? 'در حال آپلود...' : 'آپلود'}
                        </button>
                      </div>
                  )}
                  <FileUploadGuidelines id={`brand-image-rules-${index}`} state={brandValidation} className="mt-0 w-full min-w-0 flex-1" />
                  </div>
                </div>

                {/* Brand Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                      label="نام تجاری*"
                      placeholder="نام تجاری"
                      className="flex-grow"
                      {...register(`brands.${index}.name`)}
                      error={(errors.brands as any)?.[index]?.name?.message as string}
                  />

                  <Input
                      label="نام تجاری به انگلیسی"
                      placeholder="نام تجاری به انگلیسی"
                      className="flex-grow"
                      {...register(`brands.${index}.nameEn`)}
                  />
                </div>

                {/* Hidden field for brand image path */}
                <input
                    type="hidden"
                    {...register(`brands.${index}.brandImage`)}
                />

                <ActionIcon
                    onClick={() => remove(index)}
                    variant="flat"
                    className="absolute top-3 left-3"
                    color="danger"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </ActionIcon>
              </div>
          );
        })}

        <Button
            onClick={addCustomField}
            variant="outline"
            className="col-span-full ml-auto w-auto"
            disabled={fields.length >= 50}
        >
          <PiPlusBold className="me-2 h-4 w-4" strokeWidth={2} />
          اضافه کردن نام تجاری جدید
        </Button>

        <Textarea
            label="توضیحات شرکت"
            placeholder="توضیحات شرکت"
            {...register('description')}
            error={errors.description?.message as string}
            className="col-span-full"
            rows={4}
        />

        <Input
            className='w-full col-span-full'
            label="شعار تبلیغاتی شرکت"
            placeholder="شعار تبلیغاتی شرکت"
            {...register('advertisingSlogan')}
            error={errors.advertisingSlogan?.message as string}
        />
      </FormGroup>
  );
}
