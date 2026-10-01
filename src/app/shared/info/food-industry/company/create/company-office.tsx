// import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import FormGroup from '@/app/shared/form-group';
// import cn from '@/utils/class-names';
// import dynamic from 'next/dynamic';
// import SelectLoader from '@/components/loader/select-loader';
// import QuillLoader from '@/components/loader/quill-loader';
// import { useQuery } from 'react-query';
// import { PiPlusBold } from 'react-icons/pi';
// import { Button } from '@/components/ui/button';
// import { ActionIcon } from '@/components/ui/action-icon';
// import TrashIcon from '@/components/icons/trash';
// import { useCallback, useEffect, useState } from 'react';
// import { Radio } from 'rizzui';
// import { Textarea } from '@/components/ui/textarea';
//
// const Select = dynamic(() => import('@/components/ui/select'), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });
// const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
//   ssr: false,
//   loading: () => <QuillLoader className="col-span-full h-[143px]" />,
// });
//
// // const fetchSubcategories = async () => {
// //   const { data } = await axios.get('http://localhost:8080/api/v1/category/1/subcategory');
// //   return data;
// // };
// interface OfficeTel {
//   id: number;
//   telType: string;
//   telNumber: string;
//   companyId: number;
// }
//
// export default function CompanyOffice({ className }: { className?: string }) {
//   const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
//     []
//   );
//   const [cities, setCities] = useState([]);
//   const [selectedProvince, setSelectedProvince] = useState(null);
//   const [officeTels, setOfficeTels] = useState<string[]>([]);
//   const [officeFaxes, setOfficeFaxes] = useState<string[]>([]);
//   const [contacts, setContacts] = useState<
//     { name: string; lastName: string; position: string; phoneNumber: string }[]
//   >([]);
//
//   const {
//     register,
//     control,
//     formState: { errors },
//     watch,
//   } = useFormContext();
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'brands',
//   });
//
//   const watchedOfficeTels = watch('officeTels', []);
//   const watchedOfficeFaxes = watch('officeFaxes', []);
//
//   useEffect(() => {
//     if (watchedOfficeTels && watchedOfficeTels.length) {
//       setOfficeTels(watchedOfficeTels.map((tel: OfficeTel) => tel.telNumber));
//     }
//     if (watchedOfficeFaxes && watchedOfficeFaxes.length) {
//       setOfficeFaxes(watchedOfficeFaxes.map((fax: OfficeTel) => fax.telNumber));
//     }
//   }, [watchedOfficeTels, watchedOfficeFaxes]);
//
//   //   const addCustomField = useCallback(
//   //     () => append([...brands]),
//   //     [append, brands]
//   //   );
//   return (
//     <FormGroup
//       title="اطلاعات تماس دفتر مرکزی"
//       description="شامل تلفن های تماس، آدرس و ..."
//       className={cn(className)}
//     >
//       {/*<Controller*/}
//       {/*  name="officeProvince"*/}
//       {/*  control={control}*/}
//       {/*  render={({ field: { onChange, value } }) => (*/}
//       {/*    <Select*/}
//       {/*      label="استان دفتر مرکزی"*/}
//       {/*      options={provinces.map((province) => ({*/}
//       {/*        value: province.id,*/}
//       {/*        name: province.name,*/}
//       {/*      }))}*/}
//       {/*      value={value}*/}
//       {/*      onChange={(e) => {*/}
//       {/*        onChange(e);*/}
//       {/*        //@ts-ignore*/}
//       {/*        setSelectedProvince(e);*/}
//       {/*      }}*/}
//       {/*      placeholder="انتخاب استان"*/}
//       {/*      error={errors?.officeProvince?.message as string}*/}
//       {/*      isRequired*/}
//       {/*    />*/}
//       {/*  )}*/}
//       {/*/>*/}
//       {/*<Controller*/}
//       {/*  name="officeCity"*/}
//       {/*  control={control}*/}
//       {/*  render={({ field: { onChange, value } }) => (*/}
//       {/*    <Select*/}
//       {/*      label="شهر دفتر مرکزی"*/}
//       {/*      // @ts-ignore*/}
//       {/*      options={cities.map((city) => ({*/}
//       {/*        //@ts-ignore*/}
//       {/*        value: city.id,*/}
//       {/*        //@ts-ignore*/}
//       {/*        name: city.nameFa,*/}
//       {/*      }))}*/}
//       {/*      value={value}*/}
//       {/*      onChange={onChange}*/}
//       {/*      placeholder="انتخاب شهر"*/}
//       {/*      error={errors?.officeCity?.message as string}*/}
//       {/*      isRequired*/}
//       {/*    />*/}
//       {/*  )}*/}
//       {/*/>*/}
//
//       {/*<Input*/}
//       {/*  label="استان دفتر مرکزی"*/}
//       {/*  placeholder="استان دفتر مرکزی"*/}
//       {/*  {...register('officeState')}*/}
//       {/*  error={errors.officeState?.message as string}*/}
//       {/*  className="w-full*/}
//       {/*    "*/}
//       {/*/>*/}
//       {/*<Input*/}
//       {/*  label="شهر دفتر مرکزی"*/}
//       {/*  placeholder="شهر دفتر مرکزی"*/}
//       {/*  {...register('officeCity')}*/}
//       {/*  error={errors.officeCity?.message as string}*/}
//       {/*  className="w-full"*/}
//       {/*/>*/}
//       {/*<div className="col-span-2">*/}
//       {/*  <Input*/}
//       {/*    label="کد پستی دفتر مرکزی"*/}
//       {/*    type="number"*/}
//       {/*    placeholder="کد پستی دفتر مرکزی"*/}
//       {/*    {...register('officePoBox')}*/}
//       {/*    error={errors.officePoBox?.message as string}*/}
//       {/*    className="w-full*/}
//       {/*    "*/}
//       {/*  />*/}
//       {/*</div>*/}
//
//       <div className="flex flex-col space-y-2">
//         <label className="font-medium text-gray-700 dark:text-gray-600">
//           تلفن‌های ثابت دفتر مرکزی
//         </label>
//         {officeTels.map((phone, index) => (
//           <div key={index} className="flex items-center gap-2 space-x-2">
//             <Input
//               type="number"
//               value={phone}
//               placeholder={`تلفن دفتر مرکزی ${index + 1}`}
//               onChange={(e) => {
//                 const newPhones = [...officeTels];
//                 newPhones[index] = e.target.value;
//                 setOfficeTels(newPhones);
//               }}
//               className="flex-grow"
//             />
//             <ActionIcon
//               onClick={() =>
//                 setOfficeTels(officeTels.filter((_, i) => i !== index))
//               }
//               variant="flat"
//               color="danger"
//             >
//               <TrashIcon className="h-4 w-4 text-red-light" />
//             </ActionIcon>
//           </div>
//         ))}
//         {officeTels.length < 3 && (
//           <Button
//             onClick={() => setOfficeTels([...officeTels, ''])}
//             variant="outline"
//           >
//             <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن فکس جدید
//           </Button>
//         )}
//       </div>
//       <div className="flex flex-col space-y-2">
//         <label className="font-medium text-gray-700 dark:text-gray-600">
//           فکس های دفتر مرکزی
//         </label>
//         {officeFaxes.map((phone, index) => (
//           <div key={index} className="flex items-center gap-2 space-x-2">
//             <Input
//               type="number"
//               value={phone}
//               placeholder={`تلفن دفتر مرکزی ${index + 1}`}
//               onChange={(e) => {
//                 const newFaxes = [...officeFaxes];
//                 newFaxes[index] = e.target.value;
//                 setOfficeFaxes(newFaxes);
//               }}
//               className="flex-grow"
//             />
//             <ActionIcon
//               onClick={() =>
//                 setOfficeFaxes(officeFaxes.filter((_, i) => i !== index))
//               }
//               variant="flat"
//               color="danger"
//             >
//               <TrashIcon className="h-4 w-4 text-red-light" />
//             </ActionIcon>
//           </div>
//         ))}
//         {officeFaxes.length < 3 && (
//           <Button
//             onClick={() => setOfficeFaxes([...officeFaxes, ''])}
//             variant="outline"
//           >
//             <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن فکس جدید
//           </Button>
//         )}
//       </div>
//
//       <Input
//         label="سامانه پیام کوتاه"
//         type="number"
//         placeholder="سامانه پیام کوتاه"
//         {...register('smsNumber')}
//         error={errors.smsNumber?.message as string}
//       />
//       <Input
//         label="شماره خط ویژه"
//         type="number"
//         placeholder="شماره خط ویژه"
//         {...register('specialLineNumber')}
//         error={errors.specialLineNumber?.message as string}
//       />
//       {/*<Textarea*/}
//       {/*  label="آدرس دفتر مرکزی*"*/}
//       {/*  placeholder="آدرس دفتر مرکزی"*/}
//       {/*  {...register('officeLocation')}*/}
//       {/*  error={errors.officeLocation?.message as string}*/}
//       {/*  rows={5}*/}
//       {/*  className="col-span-full"*/}
//       {/*/>*/}
//     </FormGroup>
//   );
// }


import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';
import QuillLoader from '@/components/loader/quill-loader';
import { useQuery } from 'react-query';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import TrashIcon from '@/components/icons/trash';
import { useEffect, useState } from 'react';
import { Radio } from 'rizzui';
import { Textarea } from '@/components/ui/textarea';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

interface OfficeTel {
  id: number;
  telType: string;
  telNumber: string;
  companyId: number;
}

export default function CompanyOffice({ className, data }: { className?: string; data?: any }) {
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [officeTels, setOfficeTels] = useState<string[]>(['']);
  const [officeFaxes, setOfficeFaxes] = useState<string[]>([]);

  const {
    register,
    control,
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = useFormContext();

  const watchedOfficeTels = watch('officeTels', []);
  const watchedOfficeFaxes = watch('officeFaxes', []);

  // Initialize local state from form values if they exist
  useEffect(() => {
    if (watchedOfficeTels && watchedOfficeTels.length) {
      const nextTels = watchedOfficeTels.map((tel: OfficeTel) => tel.telNumber);
      setOfficeTels((current) =>
          JSON.stringify(current) === JSON.stringify(nextTels) ? current : nextTels
      );
    }
    if (watchedOfficeFaxes && watchedOfficeFaxes.length) {
      const nextFaxes = watchedOfficeFaxes.map((fax: OfficeTel) => fax.telNumber);
      setOfficeFaxes((current) =>
          JSON.stringify(current) === JSON.stringify(nextFaxes) ? current : nextFaxes
      );
    }
  }, [watchedOfficeFaxes, watchedOfficeTels]);

  // Update form values when local state changes
  useEffect(() => {
    // Convert string array to required format for the form
    const formattedTels = officeTels.map((tel, index) => ({
      id: index,
      telType: 'OFFICE',
      telNumber: tel,
      companyId: data?.id || 0,
    }));
    setValue('officeTels', formattedTels, { shouldValidate: isSubmitted });
  }, [officeTels, setValue, data?.id, isSubmitted]);

  useEffect(() => {
    // Convert string array to required format for the form
    const formattedFaxes = officeFaxes.map((fax, index) => ({
      id: index,
      telType: 'OFFICE_FAX',
      telNumber: fax,
      companyId: data?.id || 0,
    }));
    setValue('officeFaxes', formattedFaxes, { shouldValidate: isSubmitted });
  }, [officeFaxes, setValue, data?.id, isSubmitted]);

  return (
      <FormGroup
          title="اطلاعات تماس دفتر مرکزی"
          description="شامل تلفن های تماس، آدرس و ..."
          className={cn(className)}
      >
        <div id="field-officeTels" className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700 dark:text-gray-600">
            تلفن‌های ثابت دفتر مرکزی*
          </label>
          {officeTels.map((phone, index) => (
              <div
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
              >
                <Input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    placeholder={`تلفن دفتر مرکزی ${index + 1}`}
                    onChange={(e) => {
                      const newPhones = [...officeTels];
                      newPhones[index] = e.target.value;
                      setOfficeTels(newPhones);
                    }}
                    className="min-w-0"
                    inputClassName="text-left"
                    error={(errors.officeTels as any)?.[index]?.telNumber?.message}
                    helperText="(مثال: 02112345678)"
                />
                <ActionIcon
                    type="button"
                    aria-label={`حذف تلفن دفتر مرکزی ${index + 1}`}
                    className="h-10 w-10 shrink-0 self-start"
                    onClick={() =>
                        setOfficeTels(officeTels.filter((_, i) => i !== index))
                    }
                    variant="flat"
                    color="danger"
                >
                  <TrashIcon className="h-4 w-4 text-red-light" />
                </ActionIcon>
              </div>
          ))}
          {officeTels.length < 3 && (
              <Button
                  onClick={() => setOfficeTels([...officeTels, ''])}
                  variant="outline"
              >
                <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن تلفن جدید
              </Button>
          )}
        </div>

        <div id="field-officeFaxes" className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700 dark:text-gray-600">
            فکس های دفتر مرکزی
          </label>
          {officeFaxes.map((fax, index) => (
              <div
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
              >
                <Input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={fax}
                    placeholder={`فکس دفتر مرکزی ${index + 1}`}
                    onChange={(e) => {
                      const newFaxes = [...officeFaxes];
                      newFaxes[index] = e.target.value;
                      setOfficeFaxes(newFaxes);
                    }}
                    className="min-w-0"
                    inputClassName="text-left"
                    error={(errors.officeFaxes as any)?.[index]?.telNumber?.message}
                    helperText="(مثال: 02112345678)"
                />
                <ActionIcon
                    type="button"
                    aria-label={`حذف فکس دفتر مرکزی ${index + 1}`}
                    className="h-10 w-10 shrink-0 self-start"
                    onClick={() =>
                        setOfficeFaxes(officeFaxes.filter((_, i) => i !== index))
                    }
                    variant="flat"
                    color="danger"
                >
                  <TrashIcon className="h-4 w-4 text-red-light" />
                </ActionIcon>
              </div>
          ))}
          {officeFaxes.length < 3 && (
              <Button
                  onClick={() => setOfficeFaxes([...officeFaxes, ''])}
                  variant="outline"
              >
                <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن فکس جدید
              </Button>
          )}
        </div>

        <Input
            label="سامانه پیام کوتاه"
            type="text"
            inputMode="numeric"
            placeholder="سامانه پیام کوتاه"
            {...register('smsNumber')}
            error={errors.smsNumber?.message as string}
            helperText="(مثال: 30001234)"
        />
        <Input
            label="شماره خط ویژه"
            type="text"
            inputMode="numeric"
            placeholder="شماره خط ویژه"
            {...register('specialLineNumber')}
            error={errors.specialLineNumber?.message as string}
            helperText="(مثال: 02112345678)"
        />
      </FormGroup>
  );
}
