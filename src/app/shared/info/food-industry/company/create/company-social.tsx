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
// import {useCallback, useEffect, useState} from 'react';
// import { Radio } from 'rizzui';
// const Select = dynamic(() => import('@/components/ui/select'), {
//   ssr: false,
//   loading: () => <SelectLoader />,
// });
// const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
//   ssr: false,
//   loading: () => <QuillLoader className="col-span-full h-[143px]" />,
// });
//
// export default function CompanySocial({ className }: { className?: string }) {
//   const [emails, setEmails] = useState<string[]>([]);
//   const {
//     register,
//     control,
//     formState: { errors },
//     watch
//   } = useFormContext();
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'brands',
//   });
//
//   const watchedEmails = watch('emails', []);
//
//   useEffect(() => {
//     if (watchedEmails && watchedEmails.length) {
//       setEmails(watchedEmails);
//     }
//   }, [watchedEmails]);
//
//   return (
//     <FormGroup
//       title="اطلاعات شبکه های اجتماعی و اینترنت"
//       description="شامل اینستاگرام، ایتا و ..."
//       className={cn(className)}
//     >
//       <Input
//         type="number"
//         label="شماره تلگرام"
//         placeholder="شماره تلگرام"
//         {...register('telegramPhoneNo')}
//         error={errors.telegramPhoneNo?.message as string}
//         helperText="(مثال: 09123456789)"
//       />
//       <Input
//           label="آیدی تلگرام"
//           placeholder="آیدی تلگرام"
//           {...register('telegramId')}
//           error={errors.telegramId?.message as string}
//           helperText="(مثال: foodkeys)"
//       />
//       <Input
//         type="number"
//         label="شماره واتساپ"
//         placeholder="شماره واتساپ"
//         {...register('whatsAppPhoneNo')}
//         error={errors.whatsAppPhoneNo?.message as string}
//         helperText="(مثال: 09123456789)"
//       />
//       <Input
//           label="آیدی واتساپ"
//           placeholder="آیدی واتساپ"
//           {...register('whatsAppId')}
//           error={errors.whatsAppId?.message as string}
//           helperText="(مثال: arminm4)"
//       />
//       <Input
//         label="آی دی اینستاگرام"
//         placeholder="آی دی اینستاگرام"
//         {...register('instagramId')}
//         error={errors.instagramId?.message as string}
//         helperText="(مثال: foodkeys@)"
//       />
//       <Input
//         label="آی دی لینکدین"
//         placeholder="آی دی لینکدین"
//         {...register('linkedInId')}
//         error={errors.linkedInId?.message as string}
//         helperText="(مثال: foodkeys)"
//       />
//       <Input
//           label="آی دی اسکایپ"
//           placeholder="آی دی اسکایپ"
//           {...register('skypeId')}
//           error={errors.skypeId?.message as string}
//           helperText="(مثال: foodkeys)"
//       />
//       <Input
//         type="number"
//         label="شماره ایتا"
//         placeholder="شماره ایتا"
//         {...register('eitaaPhoneNo')}
//         error={errors.eitaaPhoneNo?.message as string}
//         helperText="(مثال: 09123456789)"
//       />
//       <Input
//         type="number"
//         label="شماره روبیکا"
//         placeholder="شماره روبیکا"
//         {...register('rubikaPhoneNo')}
//         error={errors.rubikaPhoneNo?.message as string}
//         helperText="(مثال: 09123456789)"
//       />
//       <div className="flex flex-col space-y-2">
//         <label className="font-medium text-gray-700 dark:text-gray-600">
//           ایمیل ها{' '}
//         </label>
//         {emails.map((email, index) => (
//           <div key={index} className="flex items-center gap-2 space-x-2">
//             <Input
//               type="email"
//               value={email}
//               placeholder={`ایمیل ${index + 1}`}
//               onChange={(e) => {
//                 const newEmails: string[] = [...emails];
//                 newEmails[index] = e.target.value;
//                 setEmails(newEmails);
//               }}
//               className="flex-grow"
//               helperText={index === 0 && '(مثال: foodkeys@gmail.com)'}
//             />
//             <ActionIcon
//               onClick={() => setEmails(emails.filter((_, i) => i !== index))}
//               variant="flat"
//               color="danger"
//               className={index === 0 ? 'mb-6' : ''}
//             >
//               <TrashIcon className="h-4 w-4 text-red-light" />
//             </ActionIcon>
//           </div>
//         ))}
//         {emails.length < 3 && (
//           <Button onClick={() => setEmails([...emails, ''])} variant="outline">
//             <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن ایمیل جدید
//           </Button>
//         )}
//       </div>
//       <Input
//         type="url"
//         label="وب سایت"
//         placeholder="وب سایت"
//         {...register('website')}
//         error={errors.website?.message as string}
//         helperText="(مثال: https://www.foodkeys.com)"
//         className="col-span-full"
//       />
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

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

export default function CompanySocial({ className }: { className?: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const {
    register,
    control,
    formState: { errors, isSubmitted },
    watch,
    setValue
  } = useFormContext();

  const watchedEmails = watch('emails', []);

  // Initialize local state from form values if they exist
  useEffect(() => {
    if (watchedEmails && watchedEmails.length) {
      setEmails((current) =>
          JSON.stringify(current) === JSON.stringify(watchedEmails)
              ? current
              : watchedEmails
      );
    }
  }, [watchedEmails]);

  // Update form values when local state changes
  useEffect(() => {
    setValue('emails', emails, { shouldValidate: isSubmitted });
  }, [emails, setValue, isSubmitted]);

  return (
      <FormGroup
          title="اطلاعات شبکه های اجتماعی و اینترنت"
          description="شامل اینستاگرام، ایتا و ..."
          className={cn(className)}
      >
        <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            label="شماره تلگرام"
            placeholder="شماره تلگرام"
            {...register('telegramPhoneNo')}
            error={errors.telegramPhoneNo?.message as string}
            helperText="(مثال: 09123456789)"
        />
        <Input
            label="آیدی تلگرام"
            placeholder="آیدی تلگرام"
            {...register('telegramId')}
            error={errors.telegramId?.message as string}
            helperText="(مثال: foodkeys)"
        />
        <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            label="شماره واتساپ"
            placeholder="شماره واتساپ"
            {...register('whatsAppPhoneNo')}
            error={errors.whatsAppPhoneNo?.message as string}
            helperText="(مثال: 09123456789)"
        />
        <Input
            label="آیدی واتساپ"
            placeholder="آیدی واتساپ"
            {...register('whatsAppId')}
            error={errors.whatsAppId?.message as string}
            helperText="(مثال: arminm4)"
        />
        <Input
            label="آی دی اینستاگرام"
            placeholder="آی دی اینستاگرام"
            {...register('instagramId')}
            error={errors.instagramId?.message as string}
            helperText="(مثال: foodkeys@)"
        />
        <Input
            label="آی دی لینکدین"
            placeholder="آی دی لینکدین"
            {...register('linkedInId')}
            error={errors.linkedInId?.message as string}
            helperText="(مثال: foodkeys)"
        />
        <Input
            label="آی دی اسکایپ"
            placeholder="آی دی اسکایپ"
            {...register('skypeId')}
            error={errors.skypeId?.message as string}
            helperText="(مثال: foodkeys)"
        />
        <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            label="شماره ایتا"
            placeholder="شماره ایتا"
            {...register('eitaaPhoneNo')}
            error={errors.eitaaPhoneNo?.message as string}
            helperText="(مثال: 09123456789)"
        />
        <Input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            label="شماره روبیکا"
            placeholder="شماره روبیکا"
            {...register('rubikaPhoneNo')}
            error={errors.rubikaPhoneNo?.message as string}
            helperText="(مثال: 09123456789)"
        />
        <div id="field-emails" className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700 dark:text-gray-600">
            ایمیل ها{' '}
          </label>
          {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2 space-x-2">
                <Input
                    type="email"
                    value={email}
                    placeholder={`ایمیل ${index + 1}`}
                    onChange={(e) => {
                      const newEmails = [...emails];
                      newEmails[index] = e.target.value;
                      setEmails(newEmails);
                    }}
                    className="flex-grow"
                    error={(errors.emails as any)?.[index]?.message as string}
                    helperText={index === 0 && '(مثال: foodkeys@gmail.com)'}
                />
                <ActionIcon
                    onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                    variant="flat"
                    color="danger"
                    className={index === 0 ? 'mb-6' : ''}
                >
                  <TrashIcon className="h-4 w-4 text-red-light" />
                </ActionIcon>
              </div>
          ))}
          {emails.length < 3 && (
              <Button onClick={() => setEmails([...emails, ''])} variant="outline">
                <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن ایمیل جدید
              </Button>
          )}
        </div>
        <Input
            type="url"
            label="وب سایت"
            placeholder="وب سایت"
            {...register('website')}
            error={errors.website?.message as string}
            helperText="(مثال: https://www.foodkeys.com)"
            className="col-span-full"
        />
      </FormGroup>
  );
}
