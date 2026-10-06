// import { useFormContext } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import FormGroup from '@/app/shared/form-group';
// import cn from '@/utils/class-names';
// import dynamic from 'next/dynamic';
// import SelectLoader from '@/components/loader/select-loader';
// import TrashIcon from '@/components/icons/trash';
// import { useEffect, useRef, useState, useCallback } from 'react';
// import Upload from '@/components/ui/upload';
// import Image from 'next/image';
// import toast from 'react-hot-toast';
// import useAxiosPrivate from '@/hooks/use-axios-private';
//
// const Select = dynamic(() => import('@/components/ui/select'), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });
//
// // Interface for uploaded file data
// interface UploadedFileDTO {
//   id: string;
//   fileName: string;
//   filePath: string;
// }
//
// // Interface for gallery item data
// interface GalleryItemData {
//   id?: string;
//   uploadedFileId?: string | string[];
//   filePath?: string;
//   fileName?: string;
//   priority?: number;
//   [key: string]: any;
// }
//
// export default function CompanyGallery({
//                                          className,
//                                          category,
//                                        }: {
//   className?: string;
//   category?: number;
// }) {
//   const {
//     register,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useFormContext();
//
//   const galleryData = watch("gallery");
//   const [error, setError] = useState('');
//   const _axios = useAxiosPrivate();
//
//   // Function to upload files to the API
//   const uploadGalleryFile = async (
//       files: File[],
//       fileServiceType: string
//   ): Promise<UploadedFileDTO[]> => {
//     try {
//       const formData = new FormData();
//       files.forEach((file) => formData.append('files', file));
//       formData.append('fileServiceType', fileServiceType);
//
//       const response = await _axios.post(
//           `${API_BASE_URL}/file`,
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//       );
//
//       if (response.data.status === 'SUCCESS' && response.data.data) {
//         return response.data.data;
//       }
//
//       throw new Error('Failed to upload files');
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       toast.error('خطا در آپلود فایل‌ها. لطفا دوباره تلاش کنید.');
//       return [];
//     }
//   };
//
//   return (
//       <FormGroup
//           title="گالری شرکت"
//           description="عکس‌های شرکت خود را اینجا آپلود کنید"
//           className={cn(className)}
//       >
//         <GallerySection
//             className="col-span-2"
//             label="عکس‌های نمونه محصولات تولیدی"
//             uploadAreaContent={
//               <>
//                 عکس‌های محصولات شرکت خود را اینجا آپلود کنید حجم عکس باید کمتر از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.products"
//             fields={[
//               { name: 'title', label: 'عنوان محصول', type: 'text' },
//               { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_PRODUCT"
//             initialFiles={galleryData?.products || []}
//         />
//
//         <GallerySection
//             className="col-span-2"
//             label="عکس‌های افتخارات و گواهینامه‌ها"
//             uploadAreaContent={
//               <>
//                 عکس‌های افتخارات و گواهینامه‌های شرکت خود را اینجا آپلود کنید حجم
//                 عکس باید کمتر از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.certificates"
//             fields={[
//               { name: 'title', label: 'نام گواهینامه', type: 'text' },
//               { name: 'description', label: 'توضیحات گواهینامه', type: 'text' }
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_CERTIFICATE"
//             initialFiles={galleryData?.certificates || []}
//         />
//
//         <GallerySection
//             className="col-span-2"
//             label="عکس‌های مدیران و مسئولین"
//             uploadAreaContent={
//               <>
//                 عکس‌های مدیران و مسئولین شرکت خود را اینجا آپلود کنید حجم عکس باید
//                 کمتر از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.contacts"
//             fields={[
//               { name: 'firstName', label: 'نام', type: 'text' },
//               { name: 'lastName', label: 'نام خانوادگی', type: 'text' },
//               { name: 'phoneNumbers', label: 'شماره تلفن', type: 'text' },
//               { name: 'emails', label: 'ایمیل', type: 'email' },
//               { name: 'position', label: 'سمت', type: 'text' },
//               { name: 'description', label: 'توضیحات', type: 'text' },
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_CONTACT"
//             initialFiles={galleryData?.contacts || []}
//         />
//
//         <GallerySection
//             className="col-span-2"
//             label="اسلایدر شرکت"
//             uploadAreaContent={
//               <>
//                 عکس‌های اسلایدر اصلی شرکت خود را اینجا آپلود کنید حجم عکس باید کمتر
//                 از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.sliders"
//             fields={[
//               { name: 'title', label: 'متن زیرنویس', type: 'text' },
//               { name: 'description', label: 'توضیحات بیشتر', type: 'text' }
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_SLIDER"
//             initialFiles={galleryData?.sliders || []}
//         />
//
//         <GallerySection
//             className="col-span-2"
//             label="کاتالوگ‌ شرکت"
//             uploadAreaContent={
//               <>
//                 کاتالوگ‌های شرکت خود را اینجا آپلود کنید حجم فایل باید کمتر از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.catalogs"
//             fields={[
//               { name: 'title', label: 'عنوان کاتالوگ', type: 'text' },
//               { name: 'altText', label: 'متن جایگزین', type: 'text' },
//               { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_CATALOG"
//             initialFiles={galleryData?.catalogs || []}
//         />
//
//         <GallerySection
//             className="col-span-2"
//             label="اسناد دیگر شرکت"
//             uploadAreaContent={
//               <>
//                 اسناد دیگر شرکت خود را اینجا آپلود کنید حجم فایل باید کمتر از{' '}
//                 <strong className="font-medium text-gray-900">
//                   20 مگابایت باشد
//                 </strong>
//               </>
//             }
//             registerName="gallery.documents"
//             fields={[
//               { name: 'title', label: 'نام سند', type: 'text' },
//               { name: 'description', label: 'توضیحات سند', type: 'text' }
//             ]}
//             uploadFile={uploadGalleryFile}
//             fileServiceType="COMPANY_GALLERY_DOCUMENT"
//             initialFiles={galleryData?.documents || []}
//         />
//       </FormGroup>
//   );
// }
//
// // Component for handling a single gallery section
// function GallerySection({
//                           className,
//                           label,
//                           uploadAreaContent,
//                           registerName,
//                           fields,
//                           uploadFile,
//                           fileServiceType,
//                           initialFiles = [],
//                         }: {
//   className?: string;
//   label?: React.ReactNode;
//   uploadAreaContent?: React.ReactNode;
//   registerName: string;
//   fields: { name: string; label: string; type: string }[];
//   uploadFile: (files: File[], fileServiceType: string) => Promise<UploadedFileDTO[]>;
//   fileServiceType: string;
//   initialFiles?: any[];
// }) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const {
//     register,
//     setValue,
//     unregister,
//   } = useFormContext();
//
//   // State to track all files
//   const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//
//   // Setup form values for a specific item
//   const setupFormValues = useCallback((item: GalleryItemData, index: number) => {
//     // Register all fields for this item
//     fields.forEach(field => {
//       setValue(`${registerName}[${index}].${field.name}`, item[field.name] || '');
//     });
//
//     // Register the file ID
//     setValue(`${registerName}[${index}].id`, item.id || '');
//     setValue(`${registerName}[${index}].uploadedFileId`, item.id || item.uploadedFileId);
//     setValue(`${registerName}[${index}].priority`, index + 1);
//   }, [fields, registerName, setValue]);
//
//   // Register all items with the form
//   const registerItems = useCallback(() => {
//     galleryItems.forEach((item, index) => {
//       setupFormValues(item, index);
//     });
//   }, [galleryItems, setupFormValues]);
//
//   // Initial load of files
//   useEffect(() => {
//     if (!isInitialized && initialFiles && initialFiles.length > 0) {
//       // Process initial files
//       const formattedItems = initialFiles.map((file, index) => {
//         return {
//           ...file,
//           id: file.id || file.uploadedFileId,
//           filePath: file.filePath,
//           fileName: file.fileName,
//           priority: index + 1,
//         };
//       });
//
//       setGalleryItems(formattedItems);
//       setIsInitialized(true);
//     }
//   }, [initialFiles, isInitialized]);
//
//   // Register items with form when they change
//   useEffect(() => {
//     if (galleryItems.length > 0) {
//       registerItems();
//     }
//   }, [galleryItems, registerItems]);
//
//   // Handle file upload
//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files || []);
//     if (!files.length) return;
//
//     setIsUploading(true);
//
//     try {
//       // Filter files to valid types and sizes
//       const validFiles = files.filter(file => {
//         const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
//         const maxSize = 20 * 1024 * 1024; // 20MB
//         return validTypes.includes(file.type) && file.size <= maxSize;
//       });
//
//       if (validFiles.length === 0) {
//         toast.error('فرمت یا حجم فایل‌ها اشتباه است. تنها فایل‌های JPG، PNG یا PDF با حجم کمتر از 20 مگابایت مجاز هستند.');
//         setIsUploading(false);
//         return;
//       }
//
//       // Upload the files
//       const uploadedFiles = await uploadFile(validFiles, fileServiceType);
//
//       if (uploadedFiles.length > 0) {
//         // Create new gallery items
//         const newItems = uploadedFiles.map((file, index) => {
//           return {
//             id: file.id,
//             uploadedFileId: file.id,
//             filePath: file.filePath,
//             fileName: file.fileName,
//             priority: galleryItems.length + index + 1,
//             ...Object.fromEntries(fields.map(f => [f.name, ''])),
//           };
//         });
//
//         // Update state with new items
//         setGalleryItems(prevItems => [...prevItems, ...newItems]);
//
//         toast.success('فایل‌ها با موفقیت آپلود شدند');
//       }
//     } catch (error) {
//       console.error('Error during file upload:', error);
//       toast.error('خطا در آپلود فایل‌ها');
//     } finally {
//       setIsUploading(false);
//       // Clear the input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };
//
//   // Handle field change
//   const handleFieldChange = (index: number, fieldName: string, value: string) => {
//     setGalleryItems(prevItems => {
//       const updatedItems = [...prevItems];
//       if (updatedItems[index]) {
//         updatedItems[index] = {
//           ...updatedItems[index],
//           [fieldName]: value
//         };
//         // Update the form value directly
//         setValue(`${registerName}[${index}].${fieldName}`, value);
//       }
//       return updatedItems;
//     });
//   };
//
//   // Handle item removal
//   const handleItemRemove = (index: number) => {
//     // Remove from state
//     setGalleryItems(prevItems => {
//       const updatedItems = prevItems.filter((_, i) => i !== index);
//       return updatedItems;
//     });
//
//     // Unregister this item from the form
//     unregister(`${registerName}[${index}]`);
//
//     // Re-register remaining items with updated indices
//     setTimeout(() => {
//       galleryItems.forEach((item, idx) => {
//         if (idx >= index) {
//           // Only update items that come after the removed one
//           unregister(`${registerName}[${idx + 1}]`);
//           fields.forEach(field => {
//             setValue(`${registerName}[${idx}].${field.name}`, item[field.name] || '');
//           });
//           setValue(`${registerName}[${idx}].id`, item.id || '');
//           setValue(`${registerName}[${idx}].uploadedFileId`, item.id || item.uploadedFileId);
//           setValue(`${registerName}[${idx}].priority`, idx + 1);
//         }
//       });
//     }, 0);
//
//     toast.success('آیتم با موفقیت حذف شد');
//   };
//
//   return (
//       <div className={className}>
//         <Upload
//             label={label}
//             ref={fileInputRef}
//             accept="image/jpeg,image/png,application/pdf"
//             multiple
//             onChange={handleFileUpload}
//             disabled={isUploading}
//         />
//         <p className="pt-3 text-sm text-gray-500">{uploadAreaContent}</p>
//
//         {isUploading && (
//             <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
//               در حال آپلود فایل‌ها... لطفا صبر کنید
//             </div>
//         )}
//
//         {galleryItems.length > 0 && (
//             <div className="mt-6 space-y-6">
//               {galleryItems.map((item, index) => (
//                   <div
//                       key={`${item.id || item.uploadedFileId || index}`}
//                       className="flex flex-col md:flex-row items-start border border-gray-200 rounded-lg p-4 gap-4"
//                   >
//                     {/* File preview/info */}
//                     <div className="w-full md:w-1/5 flex justify-center">
//                       {item.filePath && (item.fileName?.toLowerCase().endsWith('.jpg') ||
//                           item.fileName?.toLowerCase().endsWith('.jpeg') ||
//                           item.fileName?.toLowerCase().endsWith('.png')) ? (
//                           <div className="relative w-24 h-24 overflow-hidden rounded-lg border border-gray-200">
//                             <Image
//                                 src={`${STATIC_FILES_URL}${item.filePath}`}
//                                 alt={item.fileName || `فایل ${index + 1}`}
//                                 width={96}
//                                 height={96}
//                                 objectFit="cover"
//                             />
//                           </div>
//                       ) : (
//                           <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border border-gray-200">
//                     <span className="text-xs text-center text-gray-500 p-2 break-all">
//                       {item.fileName || `فایل ${index + 1}`}
//                     </span>
//                           </div>
//                       )}
//                     </div>
//
//                     {/* Form fields */}
//                     <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       {fields.map(field => (
//                           <Input
//                               key={`${item.id || item.uploadedFileId}-${field.name}`}
//                               label={field.label}
//                               type={field.type}
//                               value={item[field.name] || ''}
//                               onChange={(e) => handleFieldChange(index, field.name, e.target.value)}
//                           />
//                       ))}
//                       <div className="flex items-center">
//                         <span className="text-sm text-gray-500">اولویت: {index + 1}</span>
//                         <input
//                             type="hidden"
//                             {...register(`${registerName}[${index}].priority`)}
//                             value={index + 1}
//                         />
//                       </div>
//                     </div>
//
//                     {/* Delete button */}
//                     <div className="w-full md:w-1/12 flex justify-center md:justify-end">
//                       <button
//                           type="button"
//                           onClick={() => handleItemRemove(index)}
//                           className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition-colors"
//                       >
//                         <TrashIcon className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </div>
//               ))}
//             </div>
//         )}
//       </div>
//   );
// }
import { API_BASE_URL, STATIC_FILES_URL } from '@/config/api.config';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';
import TrashIcon from '@/components/icons/trash';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Upload from '@/components/ui/upload';
import Image from 'next/image';
import toast from 'react-hot-toast';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { useCompanyUploadValidation } from '@/hooks/use-company-upload-validation';
import {
  uploadNumber,
  validateUploadFile,
} from '@/utils/file-upload-validation';
import FileUploadGuidelines from '@/components/ui/file-upload-guidelines';
import { isAxiosError } from 'axios';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});

interface UploadedFileDTO {
  id: string;
  fileName: string;
  originalFileName?: string;
  filePath: string;
}

interface GalleryItemData {
  id?: string;
  uploadedFileId?: string | string[];
  filePath?: string;
  fileName?: string;
  originalFileName?: string;
  priority?: number;

  [key: string]: any;
}

export default function CompanyGallery({
  className,
  category,
}: {
  className?: string;
  category?: number;
}) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const galleryData = watch('gallery');
  const _axios = useAxiosPrivate();

  // Wrap upload function in useCallback for stable identity
  const uploadGalleryFile = useCallback(
    async (
      files: File[],
      fileServiceType: string
    ): Promise<UploadedFileDTO[]> => {
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        formData.append('fileServiceType', fileServiceType);

        const response = await _axios.post(`${API_BASE_URL}/file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.status === 'SUCCESS' && response.data.data) {
          return response.data.data;
        }
        throw new Error('Failed to upload files');
      } catch (err) {
        console.error('Error uploading files:', err);
        toast.error(
          (isAxiosError(err) && err.response?.data?.message) ||
            'خطا در آپلود فایل‌ها. لطفا دوباره تلاش کنید.'
        );
        return [];
      }
    },
    [_axios]
  );

  // Memoize field definitions to avoid re-creation on each render
  const productFields = useMemo(
    () => [
      { name: 'title', label: 'عنوان محصول*', type: 'text' },
      { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
    ],
    []
  );

  const certificateFields = useMemo(
    () => [
      { name: 'title', label: 'نام گواهینامه*', type: 'text' },
      { name: 'description', label: 'توضیحات گواهینامه', type: 'text' },
    ],
    []
  );

  const contactFields = useMemo(
    () => [
      { name: 'title', label: 'عنوان تصویر*', type: 'text' },
      { name: 'firstName', label: 'نام', type: 'text' },
      { name: 'lastName', label: 'نام خانوادگی', type: 'text' },
      { name: 'phoneNumbers', label: 'شماره تلفن', type: 'text' },
      { name: 'emails', label: 'ایمیل', type: 'email' },
      { name: 'position', label: 'سمت', type: 'text' },
      { name: 'description', label: 'توضیحات', type: 'text' },
      { name: 'showMobile', label: 'نمایش موبایل', type: 'checkbox' },
      { name: 'showEmail', label: 'نمایش ایمیل', type: 'checkbox' },
    ],
    []
  );

  const sliderFields = useMemo(
    () => [
      { name: 'title', label: 'متن زیرنویس*', type: 'text' },
      { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
    ],
    []
  );

  const catalogFields = useMemo(
    () => [
      { name: 'title', label: 'عنوان کاتالوگ*', type: 'text' },
      // { name: 'altText', label: 'متن جایگزین', type: 'text' },
      { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
    ],
    []
  );

  const videoFields = useMemo(
    () => [
      { name: 'title', label: 'عنوان ویدیو*', type: 'text' },
      { name: 'description', label: 'توضیحات ویدیو', type: 'text' },
    ],
    []
  );

  const documentFields = useMemo(
    () => [
      { name: 'title', label: 'نام سند*', type: 'text' },
      { name: 'description', label: 'توضیحات سند', type: 'text' },
    ],
    []
  );

  const officeEnvironmentFields = useMemo(
    () => [
      { name: 'title', label: 'عنوان*', type: 'text' },
      { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
    ],
    []
  );

  return (
    <FormGroup
      title="گالری شرکت"
      description="عکس‌های شرکت خود را اینجا آپلود کنید"
      className={cn(className)}
    >
      <GallerySection
        className="col-span-2"
        label="عکس‌های نمونه محصولات تولیدی"
        registerName="gallery.products"
        fields={productFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_PRODUCT"
        initialFiles={galleryData?.products || []}
      />

      <GallerySection
        className="col-span-2"
        label="عکس‌های افتخارات و گواهینامه‌ها"
        registerName="gallery.certificates"
        fields={certificateFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_CERTIFICATE"
        initialFiles={galleryData?.certificates || []}
      />

      <GallerySection
        className="col-span-2"
        label="عکس‌های مدیران و مسئولین"
        registerName="gallery.contacts"
        fields={contactFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_CONTACT"
        initialFiles={galleryData?.contacts || []}
      />

      <GallerySection
        className="col-span-2"
        label="اسلایدر شرکت"
        registerName="gallery.sliders"
        fields={sliderFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_SLIDER"
        initialFiles={galleryData?.sliders || []}
      />

      <GallerySection
        className="col-span-2"
        label="عکس‌های محیط اداری"
        registerName="gallery.officeEnvironments"
        fields={officeEnvironmentFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_OFFICE_ENVIRONMENT"
        initialFiles={galleryData?.officeEnvironments || []}
      />

      <GallerySection
        className="col-span-2"
        label="کاتالوگ‌ شرکت"
        registerName="gallery.catalogs"
        fields={catalogFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_CATALOG"
        initialFiles={galleryData?.catalogs || []}
      />
      <GallerySection
        className="col-span-2"
        label="ویدیو‌های شرکت"
        registerName="gallery.videos"
        fields={videoFields}
        uploadFile={uploadGalleryFile}
        fileServiceType="COMPANY_GALLERY_VIDEO"
        initialFiles={galleryData?.videos || []}
      />

      {/* <GallerySection
                className="col-span-2"
                label="اسناد دیگر شرکت"
                registerName="gallery.documents"
                fields={documentFields}
                uploadFile={uploadGalleryFile}
                fileServiceType="COMPANY_GALLERY_DOCUMENT"
                initialFiles={galleryData?.documents || []}
            /> */}
    </FormGroup>
  );
}

function GallerySection({
  className,
  label,
  registerName,
  fields,
  uploadFile,
  fileServiceType,
  initialFiles = [],
}: {
  className?: string;
  label?: React.ReactNode;
  registerName: string;
  fields: { name: string; label: string; type: string }[];
  uploadFile: (
    files: File[],
    fileServiceType: string
  ) => Promise<UploadedFileDTO[]>;
  fileServiceType: string;
  initialFiles?: any[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadValidation = useCompanyUploadValidation(fileServiceType);
  const {
    register,
    setValue,
    unregister,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const setupFormValues = useCallback(
    (item: GalleryItemData, index: number) => {
      // Register all fields for this item
      fields.forEach((field) => {
        if (field.type === 'checkbox') {
          // Default checkbox fields to true when missing
          const value = item[field.name] === false ? false : true;
          setValue(`${registerName}[${index}].${field.name}`, value);
        } else {
          setValue(
            `${registerName}[${index}].${field.name}`,
            item[field.name] || ''
          );
        }
      });

      // Register the file ID and priority
      setValue(`${registerName}[${index}].id`, item.id || '');
      setValue(
        `${registerName}[${index}].uploadedFileId`,
        item.id || item.uploadedFileId
      );
      setValue(`${registerName}[${index}].priority`, index + 1);

      // For contacts, ensure all fields are explicitly registered
      if (registerName === 'gallery.contacts') {
        setValue(`${registerName}[${index}].firstName`, item.firstName || '');
        setValue(`${registerName}[${index}].lastName`, item.lastName || '');
        setValue(
          `${registerName}[${index}].phoneNumbers`,
          item.phoneNumbers || ''
        );
        setValue(`${registerName}[${index}].emails`, item.emails || '');
        setValue(`${registerName}[${index}].position`, item.position || '');
        setValue(
          `${registerName}[${index}].description`,
          item.description || ''
        );
        setValue(
          `${registerName}[${index}].showMobile`,
          item.showMobile === false ? false : true
        );
        setValue(
          `${registerName}[${index}].showEmail`,
          item.showEmail === false ? false : true
        );
      }
    },
    [fields, registerName, setValue]
  );
  // const setupFormValues = useCallback(
  //     (item: GalleryItemData, index: number) => {
  //       fields.forEach((field) => {
  //         setValue(`${registerName}[${index}].${field.name}`, item[field.name] || '');
  //       });
  //       setValue(`${registerName}[${index}].id`, item.id || '');
  //       setValue(`${registerName}[${index}].uploadedFileId`, item.id || item.uploadedFileId);
  //       setValue(`${registerName}[${index}].priority`, index + 1);
  //     }, [fields, registerName, setValue]
  // );

  // Initial load
  useEffect(() => {
    if (!isInitialized && initialFiles.length) {
      const formatted = initialFiles.map((file, idx) => {
        const item: GalleryItemData = {
          ...file,
          id: file.id || file.uploadedFileId,
          filePath: file.filePath,
          fileName: file.fileName,
          originalFileName: file.originalFileName,
          priority: idx + 1,
        };
        fields.forEach((f) => {
          if (f.type === 'checkbox') {
            item[f.name] = file[f.name] === false ? false : true;
          }
        });
        return item;
      });
      setGalleryItems(formatted);
      setIsInitialized(true);
    }
  }, [initialFiles, isInitialized, fields]);

  // Register items whenever galleryItems changes
  useEffect(() => {
    if (galleryItems.length) {
      galleryItems.forEach((item, idx) => setupFormValues(item, idx));
    }
  }, [galleryItems, setupFormValues]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!uploadValidation.ready || !uploadValidation.validation) return;

    setIsUploading(true);
    try {
      const validation = uploadValidation.validation;
      if (validation.maxFiles && files.length > validation.maxFiles) {
        toast.error(
          `در هر بار آپلود حداکثر ${uploadNumber(
            validation.maxFiles
          )} فایل انتخاب کنید.`
        );
        return;
      }
      for (const file of files) {
        const validationError = await validateUploadFile(file, validation);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          return;
        }
      }
      const uploaded = await uploadFile(files, fileServiceType);
      if (uploaded.length) {
        const newItems = uploaded.map((file, i) => ({
          id: file.id,
          uploadedFileId: file.id,
          filePath: file.filePath,
          fileName: file.fileName,
          originalFileName: file.originalFileName,
          priority: galleryItems.length + i + 1,
          ...Object.fromEntries(
            fields.map((f) => [f.name, f.type === 'checkbox' ? true : ''])
          ),
        }));
        setGalleryItems((prev) => [...prev, ...newItems]);
        toast.success('فایل‌ها با موفقیت آپلود شدند');
      }
    } catch {
      toast.error('خطا در آپلود فایل‌ها');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFieldChange = (
    index: number,
    name: string,
    val: string | boolean
  ) => {
    setGalleryItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [name]: val };
      setValue(`${registerName}[${index}].${name}`, val, {
        shouldValidate: isSubmitted,
      });
      return copy;
    });
  };

  const handleItemRemove = (index: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
    unregister(`${registerName}[${index}]`);
    toast.success('آیتم با موفقیت حذف شد');
  };

  return (
    <div className={className}>
      <Upload
        label={label}
        ref={fileInputRef}
        accept={uploadValidation.accept || ''}
        aria-describedby={`${fileServiceType}-upload-rules`}
        multiple
        onChange={handleFileUpload}
        disabled={isUploading || !uploadValidation.ready}
        className="min-h-[180px] px-5 py-6 md:ps-5"
        iconClassName="h-28 w-28 shrink-0"
        contentClassName="w-full max-w-2xl gap-6 sm:flex-row"
        placeholderText={
          <div className="w-full min-w-0 flex-1 text-start">
            <p className="text-sm font-semibold text-gray-800">
              برای انتخاب فایل کلیک کنید
            </p>
            <FileUploadGuidelines
              id={`${fileServiceType}-upload-rules`}
              state={uploadValidation}
              className="border-0 bg-transparent px-0 py-0"
            />
          </div>
        }
      />

      {isUploading && (
        <div className="bg-blue-50 text-blue-700 mt-4 rounded-md p-4">
          در حال آپلود فایل‌ها...
        </div>
      )}

      {!!galleryItems.length && (
        <div className="mt-6 space-y-6">
          {galleryItems.map((item, idx) => (
            <div
              key={String(item.id || item.uploadedFileId || idx)}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 rounded-xl border border-gray-200 bg-gray-0 p-5 md:grid-cols-[7rem_minmax(0,1fr)_auto]"
            >
              <div className="flex min-w-0 flex-col items-start md:items-center">
                {item.filePath &&
                /\.(jpe?g|png|webp)$/i.test(
                  item.originalFileName || item.fileName || item.filePath || ''
                ) ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={`${STATIC_FILES_URL}${item.filePath}`}
                      alt={
                        item.originalFileName ||
                        item.fileName ||
                        `فایل ${idx + 1}`
                      }
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-gray-100">
                    <span className="p-2 text-xs text-gray-500">
                      فایل آپلودشده
                    </span>
                  </div>
                )}
                {(item.originalFileName || item.fileName) && (
                  <p
                    className="mt-2 w-28 truncate text-center text-xs text-gray-500"
                    title={item.originalFileName || item.fileName}
                  >
                    <bdi>{item.originalFileName || item.fileName}</bdi>
                  </p>
                )}
              </div>

              <div className="col-span-2 grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2 md:col-span-1 md:col-start-2 md:row-start-1">
                {fields.map((f) =>
                  f.type === 'checkbox' ? (
                    <Checkbox
                      key={`${idx}-${f.name}`}
                      label={f.label}
                      checked={item[f.name] !== false}
                      onChange={(e) =>
                        handleFieldChange(idx, f.name, e.target.checked)
                      }
                      className="col-span-full sm:col-span-1"
                      containerClassName="gap-2.5"
                      inputClassName="border-2"
                    />
                  ) : (
                    <Input
                      key={`${idx}-${f.name}`}
                      label={f.label}
                      type={f.type === 'email' ? 'email' : 'text'}
                      inputMode={
                        f.name === 'phoneNumbers' ? 'numeric' : undefined
                      }
                      maxLength={f.name === 'phoneNumbers' ? 11 : undefined}
                      // register this field with RHF
                      {...register(`${registerName}[${idx}].${f.name}`)}
                      // keep it controlled if you like
                      value={item[f.name] || ''}
                      onChange={(e) =>
                        handleFieldChange(idx, f.name, e.target.value)
                      }
                      error={
                        (errors.gallery as any)?.[registerName.split('.')[1]]?.[
                          idx
                        ]?.[f.name]?.message as string
                      }
                      helperText={
                        f.name === 'phoneNumbers'
                          ? '(مثال: 09123456789)'
                          : f.name === 'emails'
                          ? '(مثال: info@foodkeys.com)'
                          : undefined
                      }
                    />
                  )
                )}
                <div className="col-span-full flex items-center border-t border-gray-100 pt-3">
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                    اولویت: {new Intl.NumberFormat('fa-IR').format(idx + 1)}
                  </span>
                  <input
                    type="hidden"
                    {...register(`${registerName}[${idx}].priority`)}
                    value={idx + 1}
                  />
                </div>
              </div>

              <div className="col-start-2 row-start-1 flex justify-end md:col-start-3">
                <button
                  type="button"
                  onClick={() => handleItemRemove(idx)}
                  aria-label={`حذف فایل ${
                    item.originalFileName || item.fileName || idx + 1
                  }`}
                  title="حذف فایل"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-light bg-red-lighter text-red-dark transition-colors hover:bg-red-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
