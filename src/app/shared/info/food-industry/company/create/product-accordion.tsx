// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useFormContext, Controller } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { PiTagBold } from 'react-icons/pi';
// import { Text, Button } from 'rizzui';
// import TrashIcon from '@/components/icons/trash';
// import Image from 'next/image';
// import dynamic from 'next/dynamic';
// import Upload from '@/components/ui/upload';
// import useAxiosPrivate from '@/hooks/use-axios-private';
// import toast from 'react-hot-toast';
//
// const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), { ssr: false });
// const SwiperSlide = dynamic(() => import('swiper/react').then((mod) => mod.SwiperSlide), { ssr: false });
//
// // Interface for uploaded file response
// interface UploadedFileDTO {
//     id: string;
//     fileName: string;
//     filePath: string;
// }
//
// // Interface for MultipleFiles component props
// interface MultipleFilesProps {
//     className?: string;
//     label: React.ReactNode;
//     registerName: string;
//     productIndex: number;
//     dataObjectName: string;
// }
//
// // Updated MultipleFiles component with proper image upload handling
// const MultipleFiles: React.FC<MultipleFilesProps> = ({
//                                                          className,
//                                                          label,
//                                                          registerName,
//                                                          productIndex,
//                                                          dataObjectName,
//                                                      }) => {
//     const { setValue, watch } = useFormContext();
//     const multiRef = useRef<HTMLInputElement>(null);
//     const _axios = useAxiosPrivate();
//     const [isUploading, setIsUploading] = useState(false);
//
//     // Watch the pictures array for this specific product (array of file IDs)
//     const pictureIds = watch(registerName) || [];
//
//     // Watch uploaded file details for preview
//     const uploadedFiles = watch(`${dataObjectName}.${productIndex}.uploadedFiles`) || [];
//
//     // Function to upload product images
//     const uploadProductImages = async (files: File[]) => {
//         setIsUploading(true);
//
//         try {
//             const formData = new FormData();
//             files.forEach((file) => formData.append('files', file));
//             formData.append('fileServiceType', 'PRODUCT_PICTURE');
//
//             const response = await _axios.post(
//                 `${API_BASE_URL}/file`,
//                 formData,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 }
//             );
//
//             if (response.data.status === 'SUCCESS' && response.data.data && response.data.data.length > 0) {
//                 const uploadedFileData = response.data.data;
//
//                 // Update the pictures field with file IDs
//                 const newFileIds = uploadedFileData.map((file: UploadedFileDTO) => file.id);
//                 setValue(registerName, [...pictureIds, ...newFileIds]);
//
//                 // Store file details for preview purposes
//                 setValue(`${dataObjectName}.${productIndex}.uploadedFiles`, [...uploadedFiles, ...uploadedFileData]);
//
//                 toast.success('تصاویر محصول با موفقیت آپلود شدند');
//                 return uploadedFileData;
//             } else {
//                 throw new Error('Upload failed');
//             }
//         } catch (error) {
//             console.error('Error uploading product images:', error);
//             toast.error('خطا در آپلود تصاویر محصول');
//             return [];
//         } finally {
//             setIsUploading(false);
//         }
//     };
//
//     const handleMultiImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const uploadedFiles = Array.from(event.target.files || []);
//         const imageFiles = uploadedFiles.filter((file) =>
//             file.type.includes('image')
//         );
//
//         // Validate file size (2MB max)
//         const validFiles = imageFiles.filter(file => {
//             if (file.size > 2 * 1024 * 1024) {
//                 toast.error(`فایل ${file.name} بیشتر از 2 مگابایت است`);
//                 return false;
//             }
//             return true;
//         });
//
//         if (validFiles.length > 0) {
//             await uploadProductImages(validFiles);
//         }
//     };
//
//     const handleMultiImageDelete = (index: number) => {
//         const deletedFileId = pictureIds[index];
//         const deletedFileData = uploadedFiles[index];
//
//         // Remove from pictures array (file IDs)
//         const updatedFileIds = pictureIds.filter((_: string, i: number) => i !== index);
//         setValue(registerName, updatedFileIds);
//
//         // Remove from uploaded files data
//         const updatedFileData = uploadedFiles.filter((_: any, i: number) => i !== index);
//         setValue(`${dataObjectName}.${productIndex}.uploadedFiles`, updatedFileData);
//
//         if (multiRef.current) {
//             multiRef.current.value = '';
//         }
//
//         toast.success('تصویر حذف شد');
//     };
//
//     const getImageSrc = useCallback((file: any): string => {
//         if (file instanceof File || file instanceof Blob) {
//             return URL.createObjectURL(file);
//         } else if (file && file.filePath) {
//             return `${STATIC_FILES_URL}${file.filePath}`;
//         } else if (file && file.url) {
//             return file.url;
//         } else if (typeof file === 'string') {
//             return file;
//         }
//         return '';
//     }, []);
//
//     return (
//         <div className={className}>
//             <Upload
//                 label={label}
//                 ref={multiRef}
//                 accept="image/*"
//                 multiple
//                 onChange={handleMultiImageUpload}
//                 disabled={isUploading}
//             />
//             <p className="pt-3 text-sm text-gray-500">
//                 عکس محصول خود را اینجا آپلود کنید. حجم عکس باید کمتر از{' '}
//                 <strong className="font-medium text-gray-900">2 مگابایت باشد</strong>
//             </p>
//
//             {isUploading && (
//                 <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
//                     در حال آپلود تصاویر... لطفا صبر کنید
//                 </div>
//             )}
//
//             {uploadedFiles.length > 0 && (
//                 <div className="mt-4">
//                     <Swiper
//                         spaceBetween={12}
//                         slidesPerView={3}
//                         breakpoints={{
//                             640: { slidesPerView: 3 },
//                             768: { slidesPerView: 4 },
//                             1024: { slidesPerView: 5 },
//                         }}
//                     >
//                         {uploadedFiles.map((file: any, index: number) => (
//                             <SwiperSlide
//                                 key={file?.id || `img-${productIndex}-${index}`}
//                             >
//                                 <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center group">
//                                     <Image
//                                         src={getImageSrc(file)}
//                                         alt={file?.fileName || 'عکس محصول'}
//                                         width={200}
//                                         height={200}
//                                         className="object-contain w-full h-full transition-all duration-300 group-hover:blur-[2px] group-hover:scale-105"
//                                         unoptimized
//                                     />
//                                     <button
//                                         onClick={() => handleMultiImageDelete(index)}
//                                         type="button"
//                                         className="absolute right-2 top-2 rounded-full bg-gray-0/70 p-1.5 text-gray-700 shadow-sm transition-colors hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 dark:bg-gray-100/70 dark:text-gray-600"
//                                         aria-label="حذف تصویر"
//                                     >
//                                         <TrashIcon className="h-3.5 w-3.5" />
//                                     </button>
//                                 </div>
//                             </SwiperSlide>
//                         ))}
//                     </Swiper>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// interface ProductAccordionProps {
//     products: any[];
//     append: Function;
//     remove: Function;
//     update: Function;
//     handleImageSelection?: Function;
//     dataObjectName: string;
// }
//
// export default function ProductAccordion({
//                                              products,
//                                              append,
//                                              remove,
//                                              update,
//                                              handleImageSelection,
//                                              dataObjectName,
//                                          }: ProductAccordionProps) {
//     const { control, watch, register, setValue } = useFormContext();
//     const [openIndex, setOpenIndex] = useState<number | null>(null);
//
//     const toggleAccordion = (index: number) => {
//         setOpenIndex(openIndex === index ? null : index);
//     };
//
//     return (
//         <div className="w-full">
//             <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm dark:border-gray-300 dark:bg-gray-50">
//                 {products.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center p-8 text-center">
//                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                             <PiTagBold className="h-8 w-8 text-gray-400" />
//                         </div>
//                         <Text className="text-lg font-medium mb-2">هیچ محصولی ثبت نشده است</Text>
//                         <Text className="text-sm text-gray-500 mb-6">برای شروع، دکمه &ldquo;افزودن محصول جدید&rdquo; را کلیک کنید</Text>
//                     </div>
//                 ) : (
//                     products.map((field, index) => (
//                         <div key={field.fieldId || field.id || `product-${index}`} className="border-b border-gray-200 last:border-b-0 dark:border-gray-300">
//                             {/* Hidden fields for form registration */}
//                             <input
//                                 type="hidden"
//                                 {...register(`${dataObjectName}.${index}.id`)}
//                                 defaultValue={field.id}
//                             />
//
//                             <button
//                                 className={`flex w-full items-center justify-between p-5 transition duration-200 ${
//                                     openIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'
//                                 } focus:outline-none`}
//                                 onClick={() => toggleAccordion(index)}
//                                 aria-expanded={openIndex === index}
//                                 type="button"
//                             >
//                                 <div className="flex items-center gap-4">
//                                     <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
//                                         openIndex === index ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
//                                     } transition-colors duration-200`}>
//                                         <PiTagBold className="h-5 w-5" />
//                                     </div>
//                                     <div className="text-right">
//                                         <h3 className={`text-base font-medium transition-colors duration-200 ${
//                                             openIndex === index ? 'text-primary-600' : 'text-gray-800'
//                                         }`}>
//                                             {watch(`${dataObjectName}.${index}.name`) || 'محصول جدید'}
//                                         </h3>
//                                         <p className="text-sm text-gray-500 mt-1">
//                                             {watch(`${dataObjectName}.${index}.categoryType`) || 'بدون دسته‌بندی'}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-3">
//                                     {watch(`${dataObjectName}.${index}.showProduct`) && (
//                                         <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
//                                             نمایش فعال
//                                         </span>
//                                     )}
//                                     <div className={`transition-transform duration-300 ${
//                                         openIndex === index ? 'rotate-180' : ''
//                                     }`}>
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             width="20"
//                                             height="20"
//                                             viewBox="0 0 24 24"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             strokeWidth="2"
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             className="text-gray-400"
//                                         >
//                                             <polyline points="6 9 12 15 18 9"></polyline>
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </button>
//
//                             <div
//                                 className={`transition-all duration-300 ease-in-out overflow-hidden ${
//                                     openIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
//                                 }`}
//                             >
//                                 <div className="border-t border-gray-200 bg-gray-0 p-6 dark:border-gray-300 dark:bg-gray-100">
//                                     <div className="grid grid-cols-12 gap-x-6 gap-y-6">
//                                         <Controller
//                                             name={`${dataObjectName}.${index}.name`}
//                                             control={control}
//                                             defaultValue={field.name || ''}
//                                             rules={{ required: 'نام محصول الزامی است' }}
//                                             render={({ field: { onChange, value }, fieldState: { error } }) => (
//                                                 <Input
//                                                     label="عنوان محصول *"
//                                                     inputClassName="border-2 focus:border-primary-500"
//                                                     size="lg"
//                                                     className="col-span-12 md:col-span-6"
//                                                     value={value}
//                                                     onChange={onChange}
//                                                     placeholder="نام محصول را وارد کنید"
//                                                     error={error?.message}
//                                                 />
//                                             )}
//                                         />
//                                         <Controller
//                                             name={`${dataObjectName}.${index}.categoryType`}
//                                             control={control}
//                                             defaultValue={field.categoryType || ''}
//                                             rules={{ required: 'دسته‌بندی محصول الزامی است' }}
//                                             render={({ field: { onChange, value }, fieldState: { error } }) => (
//                                                 <Input
//                                                     label="دسته بندی محصول *"
//                                                     inputClassName="border-2 focus:border-primary-500"
//                                                     size="lg"
//                                                     className="col-span-12 md:col-span-6"
//                                                     value={value}
//                                                     onChange={onChange}
//                                                     placeholder="مثال: الکترونیکی، غذایی، ..."
//                                                     error={error?.message}
//                                                 />
//                                             )}
//                                         />
//                                         <Controller
//                                             name={`${dataObjectName}.${index}.description`}
//                                             control={control}
//                                             defaultValue={field.description || ''}
//                                             render={({ field: { onChange, value } }) => (
//                                                 <Textarea
//                                                     label="توضیحات محصول"
//                                                     className="col-span-12"
//                                                     rows={4}
//                                                     value={value}
//                                                     onChange={onChange}
//                                                     placeholder="توضیحات کاملی درباره این محصول بنویسید..."
//                                                 />
//                                             )}
//                                         />
//                                         <Controller
//                                             name={`${dataObjectName}.${index}.showProduct`}
//                                             control={control}
//                                             defaultValue={field.showProduct || false}
//                                             render={({ field: { onChange, value } }) => (
//                                                 <div className="col-span-12">
//                                                     <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-300">
//                                                         <div className="flex flex-row items-center gap-3">
//                                                             <Text className="font-medium text-gray-800">نمایش محصول</Text>
//                                                             <Text className="text-sm text-gray-500">
//                                                                 {value ?
//                                                                     'این محصول در صفحه اصلی نمایش داده خواهد شد' :
//                                                                     'این محصول در صفحه اصلی نمایش داده نخواهد شد'}
//                                                             </Text>
//                                                         </div>
//                                                         <label className="relative inline-flex cursor-pointer items-center">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 className="peer sr-only"
//                                                                 checked={value || false}
//                                                                 onChange={(e) => onChange(e.target.checked)}
//                                                             />
//                                                             <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-gray-0 after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-gray-300 dark:after:bg-gray-700"></div>
//                                                         </label>
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         />
//                                         <Controller
//                                             name={`${dataObjectName}.${index}.outsourced`}
//                                             control={control}
//                                             defaultValue={dataObjectName === 'outSourcedProducts'}
//                                             render={({ field }) => (
//                                                 <input type="hidden" {...field} />
//                                             )}
//                                         />
//
//                                         {/* Pictures field - stores array of file IDs */}
//                                         <input
//                                             type="hidden"
//                                             {...register(`${dataObjectName}.${index}.pictures`)}
//                                         />
//
//                                         {/* Uploaded files data field - for preview purposes */}
//                                         <input
//                                             type="hidden"
//                                             {...register(`${dataObjectName}.${index}.uploadedFiles`)}
//                                         />
//
//                                         <MultipleFiles
//                                             className="col-span-12"
//                                             label={
//                                                 <div className="flex items-center gap-2">
//                                                     <span>تصویر محصول</span>
//                                                     <span className="text-xs text-gray-500">(حداقل یک تصویر اضافه کنید)</span>
//                                                 </div>
//                                             }
//                                             registerName={`${dataObjectName}.${index}.pictures`}
//                                             productIndex={index}
//                                             dataObjectName={dataObjectName}
//                                         />
//                                         <div className="col-span-12 mt-4 flex flex-wrap justify-end gap-4 border-t border-gray-200 pt-4 dark:border-gray-300">
//                                             <Button
//                                                 size="lg"
//                                                 variant="outline"
//                                                 className="flex items-center"
//                                                 onClick={() => remove(index)}
//                                                 type="button"
//                                             >
//                                                 <TrashIcon className="me-2 h-4 w-4" />
//                                                 حذف محصول
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//
//             <Button
//                 variant="solid"
//                 color="primary"
//                 onClick={() =>
//                     append({
//                         name: '',
//                         categoryType: '',
//                         description: '',
//                         outsourced: dataObjectName === 'outSourcedProducts',
//                         showProduct: false,
//                         pictures: [], // Array of file IDs
//                         uploadedFiles: [], // Array of file data for preview
//                     })
//                 }
//                 className="mt-6 flex items-center justify-center w-full sm:w-auto"
//                 type="button"
//             >
//                 <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="me-2"
//                 >
//                     <line x1="12" y1="5" x2="12" y2="19"></line>
//                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                 </svg>
//                 افزودن محصول جدید
//             </Button>
//         </div>
//     );
// }

import { API_BASE_URL } from '@/config/api.config';
import { STATIC_FILES_URL } from '@/config/api.config';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PiTagBold } from 'react-icons/pi';
import { Text, Button } from 'rizzui';
import TrashIcon from '@/components/icons/trash';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Upload from '@/components/ui/upload';
import useAxiosPrivate from '@/hooks/use-axios-private';
import toast from 'react-hot-toast';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import('swiper/react').then((mod) => mod.SwiperSlide), { ssr: false });

// Interface for uploaded file response (matches your backend FileDTO)
interface UploadedFileDTO {
    id: string;
    fileName: string;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    fileCategory: string;
    permanent: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Interface for MultipleFiles component props
interface MultipleFilesProps {
    className?: string;
    label: React.ReactNode;
    registerName: string;
    productIndex: number;
    dataObjectName: string;
}

// Updated MultipleFiles component with proper image upload handling
const MultipleFiles: React.FC<MultipleFilesProps> = ({
                                                         className,
                                                         label,
                                                         registerName,
                                                         productIndex,
                                                         dataObjectName,
                                                     }) => {
    const { setValue, watch } = useFormContext();
    const multiRef = useRef<HTMLInputElement>(null);
    const _axios = useAxiosPrivate();
    const [isUploading, setIsUploading] = useState(false);

    // Watch the pictures array for this specific product (array of file objects)
    const pictures = watch(registerName) || [];

    // Function to upload product images
    const uploadProductImages = async (files: File[]) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));
            formData.append('fileServiceType', 'PRODUCT_PICTURE');

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
                const uploadedFileData = response.data.data;

                // Create FileDTO-like objects from the response
                const fileDTOs = uploadedFileData.map((file: any) => ({
                    id: file.id,
                    fileName: file.fileName,
                    originalFileName: file.originalFileName || file.fileName,
                    filePath: file.filePath,
                    fileSize: file.fileSize || 0,
                    contentType: file.contentType || 'image/*',
                    fileCategory: 'PRODUCT_IMAGE',
                    permanent: file.permanent || false,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt
                }));

                // Update the pictures field with complete file objects
                setValue(registerName, [...pictures, ...fileDTOs]);

                toast.success('تصاویر محصول با موفقیت آپلود شدند');
                return fileDTOs;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading product images:', error);
            toast.error('خطا در آپلود تصاویر محصول');
            return [];
        } finally {
            setIsUploading(false);
        }
    };

    const handleMultiImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(event.target.files || []);
        const imageFiles = uploadedFiles.filter((file) =>
            file.type.includes('image')
        );

        // Validate file size (2MB max)
        const validFiles = imageFiles.filter(file => {
            if (file.size > 2 * 1024 * 1024) {
                toast.error(`فایل ${file.name} بیشتر از 2 مگابایت است`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            await uploadProductImages(validFiles);
        }
    };

    const handleMultiImageDelete = (index: number) => {
        const deletedFile = pictures[index];

        // Remove from pictures array (file objects)
        const updatedFiles = pictures.filter((_: any, i: number) => i !== index);
        setValue(registerName, updatedFiles);

        if (multiRef.current) {
            multiRef.current.value = '';
        }

        toast.success('تصویر حذف شد');
    };

    const getImageSrc = useCallback((file: any): string => {
        if (file instanceof File || file instanceof Blob) {
            return URL.createObjectURL(file);
        } else if (file && file.filePath) {
            return `${STATIC_FILES_URL}${file.filePath}`;
        } else if (file && file.url) {
            return file.url;
        } else if (typeof file === 'string') {
            return file;
        }
        return '';
    }, []);

    return (
        <div className={className}>
            <Upload
                label={label}
                ref={multiRef}
                accept="image/*"
                multiple
                onChange={handleMultiImageUpload}
                disabled={isUploading}
            />
            <p className="pt-3 text-sm text-gray-500">
                عکس محصول خود را اینجا آپلود کنید. حجم عکس باید کمتر از{' '}
                <strong className="font-medium text-gray-900">2 مگابایت باشد</strong>
            </p>

            {isUploading && (
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                    در حال آپلود تصاویر... لطفا صبر کنید
                </div>
            )}

            {pictures.length > 0 && (
                <div className="mt-4">
                    <Swiper
                        spaceBetween={12}
                        slidesPerView={3}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                    >
                        {pictures.map((file: any, index: number) => (
                            <SwiperSlide
                                key={file?.id || `img-${productIndex}-${index}`}
                            >
                                <div>
                                    <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                        <Image
                                            src={getImageSrc(file)}
                                            alt={file?.originalFileName || file?.fileName || 'عکس محصول'}
                                            width={200}
                                            height={200}
                                            className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:blur-[2px]"
                                            unoptimized
                                        />
                                        <button
                                            onClick={() => handleMultiImageDelete(index)}
                                            type="button"
                                            className="absolute right-2 top-2 rounded-full bg-gray-0/70 p-1.5 text-gray-700 opacity-0 shadow-sm transition-colors hover:bg-red-500 hover:text-white group-hover:opacity-100 dark:bg-gray-100/70 dark:text-gray-600"
                                            aria-label="حذف تصویر"
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    {(file?.originalFileName || file?.fileName) && (
                                        <p
                                            className="mt-1 truncate text-center text-xs text-gray-500"
                                            title={file?.originalFileName || file?.fileName}
                                        >
                                            {file?.originalFileName || file?.fileName}
                                        </p>
                                    )}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    );
};

interface ProductAccordionProps {
    products: any[];
    append: Function;
    remove: Function;
    update: Function;
    handleImageSelection?: Function;
    dataObjectName: string;
}

export default function ProductAccordion({
                                             products,
                                             append,
                                             remove,
                                             update,
                                             handleImageSelection,
                                             dataObjectName,
                                         }: ProductAccordionProps) {
    const { control, watch, register, setValue } = useFormContext();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full">
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm dark:border-gray-300 dark:bg-gray-50">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <PiTagBold className="h-8 w-8 text-gray-400" />
                        </div>
                        <Text className="text-lg font-medium mb-2">هیچ محصولی ثبت نشده است</Text>
                        <Text className="text-sm text-gray-500 mb-6">برای شروع، دکمه &ldquo;افزودن محصول جدید&rdquo; را کلیک کنید</Text>
                    </div>
                ) : (
                    products.map((field, index) => (
                        <div key={field.fieldId || field.id || `product-${index}`} className="border-b border-gray-200 last:border-b-0 dark:border-gray-300">
                            {/* Hidden fields for form registration */}
                            <input
                                type="hidden"
                                {...register(`${dataObjectName}.${index}.id`)}
                                defaultValue={field.id}
                            />

                            <button
                                className={`flex w-full items-center justify-between p-5 transition duration-200 ${
                                    openIndex === index ? 'bg-gray-50 dark:bg-gray-100' : 'hover:bg-gray-50 dark:hover:bg-gray-100'
                                } focus:outline-none`}
                                onClick={() => toggleAccordion(index)}
                                aria-expanded={openIndex === index}
                                type="button"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                        openIndex === index ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
                                    } transition-colors duration-200`}>
                                        <PiTagBold className="h-5 w-5" />
                                    </div>
                                    <div className="text-right">
                                        <h3 className={`text-base font-medium transition-colors duration-200 ${
                                            openIndex === index ? 'text-primary-600' : 'text-gray-800'
                                        }`}>
                                            {watch(`${dataObjectName}.${index}.name`) || 'محصول جدید'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {watch(`${dataObjectName}.${index}.categoryType`) || 'بدون دسته‌بندی'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {watch(`${dataObjectName}.${index}.showProduct`) && (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            نمایش فعال
                                        </span>
                                    )}
                                    <div className={`transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-gray-400"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    openIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="border-t border-gray-200 bg-gray-0 p-6 dark:border-gray-300 dark:bg-gray-100">
                                    <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                        <Controller
                                            name={`${dataObjectName}.${index}.name`}
                                            control={control}
                                            defaultValue={field.name || ''}
                                            rules={{ required: 'نام محصول الزامی است' }}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <Input
                                                    label="عنوان محصول *"
                                                    inputClassName="border-2 focus:border-primary-500"
                                                    size="lg"
                                                    className="col-span-12 md:col-span-6"
                                                    value={value}
                                                    onChange={onChange}
                                                    placeholder="نام محصول را وارد کنید"
                                                    error={error?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name={`${dataObjectName}.${index}.categoryType`}
                                            control={control}
                                            defaultValue={field.categoryType || ''}
                                            rules={{ required: 'دسته‌بندی محصول الزامی است' }}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <Input
                                                    label="دسته بندی محصول *"
                                                    inputClassName="border-2 focus:border-primary-500"
                                                    size="lg"
                                                    className="col-span-12 md:col-span-6"
                                                    value={value}
                                                    onChange={onChange}
                                                    placeholder="مثال: الکترونیکی، غذایی، ..."
                                                    error={error?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name={`${dataObjectName}.${index}.description`}
                                            control={control}
                                            defaultValue={field.description || ''}
                                            render={({ field: { onChange, value } }) => (
                                                <Textarea
                                                    label="توضیحات محصول"
                                                    className="col-span-12"
                                                    rows={4}
                                                    value={value}
                                                    onChange={onChange}
                                                    placeholder="توضیحات کاملی درباره این محصول بنویسید..."
                                                />
                                            )}
                                        />
                                        <Controller
                                            name={`${dataObjectName}.${index}.showProduct`}
                                            control={control}
                                            defaultValue={field.showProduct || false}
                                            render={({ field: { onChange, value } }) => (
                                                <div className="col-span-12">
                                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-300">
                                                        <div className="flex flex-row items-center gap-3">
                                                            <Text className="font-medium text-gray-800">نمایش محصول</Text>
                                                            <Text className="text-sm text-gray-500">
                                                                {value ?
                                                                    'این محصول در صفحه اصلی نمایش داده خواهد شد' :
                                                                    'این محصول در صفحه اصلی نمایش داده نخواهد شد'}
                                                            </Text>
                                                        </div>
                                                        <label className="relative inline-flex cursor-pointer items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={value || false}
                                                                onChange={(e) => onChange(e.target.checked)}
                                                            />
                                                            <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-gray-0 after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-gray-300 dark:after:bg-gray-700"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name={`${dataObjectName}.${index}.outsourced`}
                                            control={control}
                                            defaultValue={dataObjectName === 'outSourcedProducts'}
                                            render={({ field }) => (
                                                <input type="hidden" {...field} />
                                            )}
                                        />

                                        {/* Pictures field - stores array of complete file objects */}
                                        <input
                                            type="hidden"
                                            {...register(`${dataObjectName}.${index}.pictures`)}
                                        />

                                        <MultipleFiles
                                            className="col-span-12"
                                            label={
                                                <div className="flex items-center gap-2">
                                                    <span>تصویر محصول</span>
                                                    <span className="text-xs text-gray-500">(حداقل یک تصویر اضافه کنید)</span>
                                                </div>
                                            }
                                            registerName={`${dataObjectName}.${index}.pictures`}
                                            productIndex={index}
                                            dataObjectName={dataObjectName}
                                        />
                                        <div className="col-span-12 mt-4 flex flex-wrap justify-end gap-4 border-t border-gray-200 pt-4 dark:border-gray-300">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="flex items-center"
                                                onClick={() => remove(index)}
                                                type="button"
                                            >
                                                <TrashIcon className="me-2 h-4 w-4" />
                                                حذف محصول
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Button
                variant="solid"
                color="primary"
                onClick={() =>
                    append({
                        id: null,
                        name: '',
                        categoryType: '',
                        description: '',
                        outsourced: dataObjectName === 'outSourcedProducts',
                        showProduct: false,
                        pictures: [], // Array of complete file objects (FileDTO-like)
                    })
                }
                className="mt-6 flex items-center justify-center w-full sm:w-auto"
                type="button"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-2"
                >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                افزودن محصول جدید
            </Button>
        </div>
    );
}
