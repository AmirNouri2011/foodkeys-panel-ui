import { API_BASE_URL } from '@/config/api.config';
import { STATIC_FILES_URL } from '@/config/api.config';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';
import QuillLoader from '@/components/loader/quill-loader';
import TrashIcon from '@/components/icons/trash';
import { useRef, useState } from 'react';
import Upload from '@/components/ui/upload';
import Image from 'next/image';
import { Radio } from '@/components/ui/radio';
import GalleryForm from './upload-gallery-file';
import _axios from '@/utils/axios-instance';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

export default function CompanyGallery({
  className,
  category,
  data,
}: {
  className?: string;
  category?: number;
  data?: any;
}) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  const [error, setError] = useState('');

  const checkFileSizeAndType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 8 * 1024 * 1024; // 8MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    // setError: React.Dispatch<React.SetStateAction<string | null>>,
    fileType: string
  ) => {
    setError('');
    const uploadedFile = (event.target as HTMLInputElement).files?.[0];
    if (!uploadedFile) return;

    if (!checkFileSizeAndType(uploadedFile)) {
      setError(
        'فرمت فایل اشتباه است. تنها فایل‌های با پسوند .JPG، .PNG مجاز هستند و حداکثر حجم مجاز ۸ مگابایت است'
      );
      return;
    }
    setValue(fileType, uploadedFile);
  };
  async function uploadGalleryFile(
    files: File[],
    fileServiceType: string
  ): Promise<string[]> {
    const tempUploadFormData = new FormData();
    files.forEach((file) => tempUploadFormData.append('files', file));
    tempUploadFormData.append(
      'fileServiceType',
      fileServiceType || 'GALLERY_FILE'
    );

    const response = await _axios.post(
      `${API_BASE_URL}/file/temp`,
      tempUploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200 && response.data?.data) {
      const uuids = response.data.data;
      console.log('uuids: ' + JSON.stringify(uuids));
      return uuids;
    }

    return [];
  }

  const handleGalleryFileSelection = async (
    files: File[],
    fileServiceType: string
  ) => {
    const uuids = await uploadGalleryFile(files, fileServiceType);
    // updateProduct(productIndex, {
    //   ...products[productIndex],
    //   uploadedFileIds: [
    //     ...(products[productIndex]?.uploadedFileIds || []),
    //     ...uuids,
    //   ]?.map((p) => p.id),
    //   outsourced: false,
    //   removedFileIds: [],
    //   pictures: [...(products[productIndex].pictures || []), ...uuids],
    // });
    console.log('Gallery after update: ' + JSON.stringify(uuids));
    return uuids;
  };

  return (
    <FormGroup
      title="گالری شرکت"
      description="عکس‌های شرکت خود را اینجا آپلود کنید"
      className={cn(className)}
    >
      {/* <GalleryForm /> */}
      <MultipleFiles
        className="col-span-2"
        label="عکس‌های نمونه محصولات تولیدی"
        uploadAreaContent={
          <>
            عکس‌های محصولات شرکت خود را اینجا آپلود کنید حجم عکس باید کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.products"
        fields={[
          { name: 'title', label: 'عنوان محصول', type: 'text' },
          { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
        ]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_PRODUCT'}
      />
      <MultipleFiles
        className="col-span-2"
        label="عکس‌های افتخارات و گواهینامه‌ها"
        uploadAreaContent={
          <>
            عکس‌های افتخارات و گواهینامه‌های شرکت خود را اینجا آپلود کنید حجم
            عکس باید کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.certificates"
        fields={[
          { name: 'certificateName', label: 'نام گواهینامه', type: 'text' },
        ]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_CERTIFICATE'}
      />
      <MultipleFiles
        className="col-span-2"
        label="عکس‌های مدیران و مسئولین"
        uploadAreaContent={
          <>
            عکس‌های مدیران و مسئولین شرکت خود را اینجا آپلود کنید حجم عکس باید
            کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.contacts"
        fields={[
          { name: 'name', label: 'نام', type: 'text' },
          { name: 'lastName', label: 'نام خانوادگی', type: 'text' },
          { name: 'phone', label: 'شماره تلفن', type: 'text' },
          { name: 'email', label: 'ایمیل', type: 'email' },
          { name: 'position', label: 'سمت', type: 'text' },
          { name: 'showMobile', label: 'نمایش موبایل', type: 'checkbox' },
          { name: 'showEmail', label: 'نمایش ایمیل', type: 'checkbox' },
        ]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_CONTACT'}
      />
      <MultipleFiles
        className="col-span-2"
        label="اسلایدر شرکت"
        uploadAreaContent={
          <>
            عکس‌های اسلایدر اصلی شرکت خود را اینجا آپلود کنید حجم عکس باید کمتر
            از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.slider"
        fields={[{ name: 'caption', label: 'متن زیرنویس ', type: 'text' }]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_BACKGROUND_IMAGE'}
      />
      <MultipleFiles
        className="col-span-2"
        label="عکس‌های محیط اداری"
        uploadAreaContent={
          <>
            عکس‌های محیط اداری شرکت خود را اینجا آپلود کنید حجم عکس باید کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.officeEnvironments"
        fields={[
          { name: 'title', label: 'عنوان', type: 'text' },
          { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
        ]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_OFFICE_ENVIRONMENT'}
      />
      <MultipleFiles
        className="col-span-2"
        label="کاتالوگ‌ شرکت"
        uploadAreaContent={
          <>
            کاتالوگ‌های شرکت خود را اینجا آپلود کنید حجم فایل باید کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.catalogs"
        fields={[
          { name: 'title', label: 'عنوان کاتالوگ', type: 'text' },
          { name: 'description', label: 'توضیحات بیشتر', type: 'text' },
        ]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_CATALOG'}
      />
      <MultipleFiles
        className="col-span-2"
        label="اسناد دیگر شرکت"
        uploadAreaContent={
          <>
            اسناد دیگر شرکت خود را اینجا آپلود کنید حجم فایل باید کمتر از{' '}
            <strong className="font-medium text-gray-900">
              20 مگابایت باشد
            </strong>
          </>
        }
        registerName="gallery.documents"
        fields={[{ name: 'documentName', label: 'نام سند', type: 'text' }]}
        onUpload={handleGalleryFileSelection}
        fileServiceType={'COMPANY_GALLERY_DOCUMENT'}
      />
    </FormGroup>
  );
}

export const MultipleFiles = ({
  className,
  label,
  uploadAreaContent,
  registerName,
  fields,
  onUpload,
  fileServiceType,
}: {
  className?: string;
  label?: React.ReactNode;
  uploadAreaContent?: React.ReactNode;
  registerName: string;
  fields: { name: string; label: string; type: string }[];
  onUpload: Function;
  fileServiceType: string;
}) => {
  const multiRef = useRef<HTMLInputElement>(null);
  const {
    register,
    setValue,
    getValues,
    unregister,
    reset,
    setError,
    formState: { errors },
    clearErrors,
    trigger,
  } = useFormContext();
  const [multiImages, setMultiImages] = useState<File[]>([]);
  const [fieldValues, setFieldValues] = useState<any[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checkFileSizeAndType = (file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 8 * 1024 * 1024; // 8MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    };
    const uploadedFiles = Array.from(event.target.files || []);
    const allowedFiles = uploadedFiles.filter((file) =>
      checkFileSizeAndType(file)
    );

    const newValues = allowedFiles.map((file) => ({
      file,
      ...Object.fromEntries(
        fields.map((f) => [f.name, f.type === 'checkbox' ? true : ''])
      ),
      priority: fieldValues.length + 1,
    }));
    setMultiImages((prevFiles) => [...prevFiles, ...allowedFiles]);
    setFieldValues((prevValues) => [...prevValues, ...newValues]);

    let fileId;
    for (let i = 0; i < newValues?.length; i++) {
      if (onUpload) fileId = await onUpload(allowedFiles, fileServiceType);
      fields.forEach((f) =>
        setValue(
          `${registerName}[${fieldValues.length + i}].${f.name}`,
          f.type === 'checkbox' ? true : ''
        )
      );
      setValue(
        `${registerName}[${fieldValues.length + i}].uploadedFileId`,
        fileId.map((f: { id: any }) => f.id) || ''
      );
      setValue(
        `${registerName}[${fieldValues.length + i}].priority`,
        fieldValues.length + 1
      );
    }
    // newValues.forEach((_, index) => {
    //   if (onUpload) fileId = await onUpload(newValues);
    //   fields.forEach((f) =>
    //     setValue(`${registerName}[${fieldValues.length + index}].${f.name}`, '')
    //   );
    //   setValue(
    //     `${registerName}[${fieldValues.length + index}].uploadedFileId`,
    //     fileId || ''
    //   );
    //   setValue(
    //     `${registerName}[${fieldValues.length + index}].priority`,
    //     fieldValues.length + 1
    //   );
    // });
  };

  const handleFieldChange = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    const updatedValues = [...fieldValues];
    updatedValues[index][field] = value;

    if (field === 'priority') {
      const priority = parseInt(value as string, 10);
      updatedValues[index][field] = priority;
      setValue(`${registerName}[${index}].priority`, priority);
      if (
        priority > 1 &&
        !updatedValues.some((v, i) => v.priority === priority && i !== index)
      ) {
        // updatedValues[index][field] = priority;
        // setValue(`${registerName}[${index}].priority`, priority);
        // clearErrors(`${registerName}[${index}].priority`);
      } else {
        // updatedValues[index][field] = '';
        // setError(`${registerName}[${index}].priority`, {
        //   type: 'custom',
        //   message: 'custom message',
        // });
        // trigger(`${registerName}[${index}].priority`);
      }
    }

    setFieldValues(updatedValues);
    setValue(`${registerName}[${index}].${field}`, value);
  };

  const handleMultiImageDelete = (index: number) => {
    const updatedFiles = multiImages.filter((_, i) => i !== index);
    const updatedValues = fieldValues.filter((_, i) => i !== index);
    setMultiImages(updatedFiles);
    setFieldValues(updatedValues);
    const currentArray = getValues(registerName) || [];
    const updatedArray = currentArray.filter(
      (_: any, i: number) => i !== index
    );
    setValue(registerName, updatedArray);
    unregister(`${registerName}[${index}]`);
  };

  return (
    <div className={className}>
      <Upload
        label={label}
        ref={multiRef}
        accept="image/*,application/pdf,application/zip"
        multiple
        onChange={handleFileUpload}
      />
      <p className="pt-3 text-sm text-gray-500">{uploadAreaContent}</p>

      {multiImages.length > 0 && (
        <div className="overflow-x-scroll">
          <div className="mt-7 flex flex-wrap gap-5">
            {multiImages.map((file, index) => (
              <div
                className="flex w-full items-center"
                key={file.name + ':' + index}
              >
                <div className="w-[20%] px-4">
                  {file.type.includes('image') ? (
                    <figure className="relative mx-auto aspect-square w-20 overflow-hidden rounded-xl border border-gray-300">
                      <Image
                        src={
                          file instanceof File || file instanceof Blob
                            ? URL.createObjectURL(file)
                            : file &&
                              file.filePath &&
                              STATIC_FILES_URL + file.filePath
                        }
                        alt={file.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw"
                      />
                    </figure>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {file.name} ({file.type})
                    </p>
                  )}
                </div>
                <div className="grid w-[60%] grid-cols-2 gap-2 px-4">
                  {fields.map((f) =>
                    f.type === 'checkbox' ? (
                      <Checkbox
                        key={f.name}
                        label={f.label}
                        checked={fieldValues[index]?.[f.name] !== false}
                        onChange={(e) =>
                          handleFieldChange(index, f.name, e.target.checked)
                        }
                        containerClassName="gap-2.5"
                        inputClassName="border-2"
                      />
                    ) : (
                      <Input
                        key={f.name}
                        label={f.label}
                        type={f.type}
                        value={fieldValues[index]?.[f.name] || ''}
                        onChange={(e) =>
                          handleFieldChange(index, f.name, e.target.value)
                        }
                        // {...register(`${registerName}[${index}].${f.name}`)}
                      />
                    )
                  )}
                  <Input
                    label="اولویت"
                    type="number"
                    value={fieldValues[index]?.priority || ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'priority', e.target.value)
                    }
                    error={
                      errors?.gallery?.contacts &&
                      errors?.gallery?.contacts.length > 0 &&
                      errors?.gallery?.contacts[0]?.priority?.message
                    }
                    // {...register(`${registerName}[${index}].priority`)}
                  />
                </div>
                <div className="flex w-20 shrink-0 items-center justify-center px-4">
                  <TrashIcon
                    onClick={() => handleMultiImageDelete(index)}
                    className="h-5 w-5 cursor-pointer transition duration-75"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// export const MultipleFiles = ({
//   className,
//   label,
//   uploadAreaContent,
//   registerName,
//   fields,
// }: {
//   className?: string;
//   label?: React.ReactNode;
//   uploadAreaContent?: React.ReactNode;
//   registerName: string;
//   fields: { name: string; label: string; type: string }[];
// }) => {
//   const multiRef = useRef<HTMLInputElement>(null);
//   const { register, setValue, getValues, unregister } = useFormContext();
//   const [multiImages, setMultiImages] = useState<File[]>([]);
//   const [fieldValues, setFieldValues] = useState<any[]>([]);

//   const handleMultiImageUpload = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const uploadedFiles = Array.from(event.target.files || []).filter((file) =>
//       file.type.includes('image')
//     );
//     const newValues = uploadedFiles.map((file) => ({
//       file,
//       ...Object.fromEntries(fields.map((f) => [f.name, ''])),
//       priority: fieldValues.length + 1,
//     }));
//     setMultiImages((prevFiles) => [...prevFiles, ...uploadedFiles]);
//     setFieldValues((prevValues) => [...prevValues, ...newValues]);

//     newValues.forEach((_, index) => {
//       fields.forEach((f) =>
//         setValue(`${registerName}[${fieldValues.length + index}].${f.name}`, '')
//       );
//       setValue(
//         `${registerName}[${fieldValues.length + index}].priority`,
//         fieldValues.length + 1
//       );
//     });
//   };

//   const handleFieldChange = (
//     index: number,
//     field: string,
//     value: string | number
//   ) => {
//     const updatedValues = [...fieldValues];
//     updatedValues[index][field] = value;

//     if (field === 'priority') {
//       const priority = parseInt(value as string, 10);
//       if (
//         priority > 1 &&
//         !updatedValues.some((v, i) => v.priority === priority && i !== index)
//       ) {
//         updatedValues[index][field] = priority;
//         setValue(`${registerName}[${index}].priority`, priority);
//       } else {
//         updatedValues[index][field] = '';
//       }
//     }

//     setFieldValues(updatedValues);
//     setValue(`${registerName}[${index}].${field}`, value);
//   };

//   const handleMultiImageDelete = (index: number) => {
//     const updatedFiles = multiImages.filter((_, i) => i !== index);
//     const updatedValues = fieldValues.filter((_, i) => i !== index);
//     setMultiImages(updatedFiles);
//     setFieldValues(updatedValues);

//     unregister(`${registerName}[${index}]`);
//   };

//   return (
//     <div className={className}>
//       <Upload
//         label={label}
//         ref={multiRef}
//         accept="image/*"
//         multiple
//         onChange={handleMultiImageUpload}
//       />
//       <p className="pt-3 text-sm text-gray-500">{uploadAreaContent}</p>

//       {multiImages.length > 0 && (
//         <div className="overflow-x-scroll">
//           <div className="mt-7 flex flex-wrap gap-5">
//             {multiImages.map((file, index) => (
//               <div className="flex w-full items-center" key={file.name}>
//                 <div className="w-[20%] px-4">
//                   <figure className="relative mx-auto aspect-square w-20 overflow-hidden rounded-xl border border-gray-300">
//                     <Image
//                       src={URL.createObjectURL(file)}
//                       alt={file.name}
//                       fill
//                       priority
//                       sizes="(max-width: 768px) 100vw"
//                     />
//                   </figure>
//                 </div>
//                 <div className="grid w-[60%] grid-cols-2 gap-2 px-4">
//                   {fields.map((f) => (
//                     <Input
//                       key={f.name}
//                       label={f.label}
//                       type={f.type}
//                       value={fieldValues[index]?.[f.name] || ''}
//                       onChange={(e) =>
//                         handleFieldChange(index, f.name, e.target.value)
//                       }
//                       {...register(`${registerName}[${index}].${f.name}`)}
//                     />
//                   ))}
//                   <Input
//                     label="اولویت"
//                     type="number"
//                     value={fieldValues[index]?.priority || ''}
//                     onChange={(e) =>
//                       handleFieldChange(index, 'priority', e.target.value)
//                     }
//                     {...register(`${registerName}[${index}].priority`)}
//                   />
//                 </div>
//                 <div className="flex w-20 shrink-0 items-center justify-center px-4">
//                   <TrashIcon
//                     onClick={() => handleMultiImageDelete(index)}
//                     className="h-5 w-5 cursor-pointer transition duration-75"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export const MultipleFiles = ({
//   className,
//   label,
//   uploadAreaContent,
//   registerName,
// }: {
//   className?: string;
//   label?: React.ReactNode;
// }) => {
//   const multiRef = useRef<HTMLInputElement>(null);
//   const [multiImages, setMultiImages] = useState<Array<File>>([]);

//   const handleMultiImageUpload = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const uploadedFiles = (event.target as HTMLInputElement).files;
//     const newFiles = Object.entries(uploadedFiles as object)
//       .map((file) => {
//         if (file[1].type.includes('image')) return file[1];
//       })
//       .filter((file) => file !== undefined);
//     setMultiImages((prevFiles) => [...prevFiles, ...newFiles]);
//   };

//   const handleMultiImageDelete = (index: number) => {
//     const updatedFiles = multiImages.filter((_, i) => i !== index);
//     setMultiImages(updatedFiles);
//     (multiRef.current as HTMLInputElement).value = '';
//   };

//   return (
//     <div className={className}>
//       <Upload
//         label={label}
//         ref={multiRef}
//         accept="img"
//         multiple
//         onChange={handleMultiImageUpload}
//       />
//       <p className="pt-3 text-sm text-gray-500">{uploadAreaContent}</p>

//       {multiImages.length > 0 && (
//         <div className="-mb-3 overflow-x-scroll @xl:mb-0 @xl:overflow-x-hidden">
//           <div className="min-w-[600px] pb-5 @xl:pb-0">
//             <div className="mt-7 flex items-center rounded-md border border-gray-300 @2xl:mt-10">
//               <div className="w-[20%] px-4 py-3.5 text-center text-sm font-semibold text-gray-700 @2xl:py-5">
//                 تصویر
//               </div>
//               <div className="w-[55%] px-4 py-3.5 text-sm font-semibold text-gray-700 @2xl:py-5">
//                 توضیحات
//               </div>
//               <div className="w-28 px-4 py-3.5 text-center text-sm font-semibold text-gray-700 @2xl:py-5">
//                 اولویت
//               </div>
//               <div className="w-20 shrink-0 px-4 py-3.5 text-center text-sm font-semibold text-gray-700 @2xl:py-5">
//                 حذف
//               </div>
//             </div>
//             <div className="mt-7 flex flex-row flex-wrap gap-5">
//               {multiImages?.map((file: File, index: number) => (
//                 <div className="flex w-full items-center" key={file.name}>
//                   <div className="w-[20%] px-4">
//                     <figure className="relative mx-auto aspect-square w-20 overflow-hidden rounded-xl border border-gray-300 @2xl:w-28">
//                       <Image
//                         src={URL.createObjectURL(file)}
//                         alt={file.name}
//                         fill
//                         priority
//                         sizes="(max-width: 768px) 100vw"
//                       />
//                     </figure>
//                   </div>
//                   <div className="w-[55%] px-4">
//                     <Input
//                       label="توضیحات بیشتر"
//                       placeholder="توضیحات نمایش داده شده بر روی عکس ..."
//                       // {...register('title')}
//                       // error={errors.title?.message}
//                     />
//                   </div>
//                   <div className="flex w-28 items-center justify-center px-4">
//                     {/* <Radio
//                       value="NotTrackInventoryProduct"
//                       inputClassName="dark:checked:!bg-gray-200 dark:checked:!border-gray-200 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-0"
//                     /> */}
//                     <Input
//                       width={50}
//                       type="number"
//                       label="اولویت"
//                       placeholder="1, 2, ..."
//                       // {...register('title')}
//                       // error={errors.title?.message}
//                     />
//                   </div>
//                   <div className="flex w-20 shrink-0 items-center justify-center px-4">
//                     <TrashIcon
//                       onClick={() => handleMultiImageDelete(index)}
//                       className="h-5 w-5 cursor-pointer transition duration-75"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
