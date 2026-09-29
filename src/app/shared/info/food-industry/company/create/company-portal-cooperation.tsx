'use client';

import FormGroup from '@/app/shared/form-group';
import { Checkbox } from '@/components/ui/checkbox';
import cn from '@/utils/class-names';
import { Controller, useFormContext } from 'react-hook-form';

const portalCooperationFields = [
  {
    name: 'acceptInternViaPortal',
    label: 'قبول کارآموز با معرفی پرتال',
  },
  {
    name: 'timelyInfoUpdate',
    label: 'به روز رسانی به موقع اطلاعات',
  },
  {
    name: 'sendRelatedNewsToPortal',
    label: 'ارسال اخبار و مقالات مرتبط با فعالیت شرکت جهت درج در پرتال',
  },
  {
    name: 'acceptStudentGroupVisit',
    label: 'بازدید گروهی دانشجویان معرفی شده توسط پرتال',
  },
] as const;

export default function CompanyPortalCooperation({
  className,
}: {
  className?: string;
}) {
  const { control } = useFormContext();

  return (
    <FormGroup
      title="همکاری با پرتال"
      description="تعهدات و همکاری‌های شرکت با پرتال"
      className={cn(className)}
    >
      <div className="col-span-full flex flex-col gap-4">
        {portalCooperationFields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
                label={field.label}
                className="col-span-full"
                containerClassName="gap-2.5"
                inputClassName="border-2"
              />
            )}
          />
        ))}
      </div>
    </FormGroup>
  );
}
