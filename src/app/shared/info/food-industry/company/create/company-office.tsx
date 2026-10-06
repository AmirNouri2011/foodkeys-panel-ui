import { useFieldArray, useFormContext } from 'react-hook-form';
import type { CreateCompanyInput } from './form-utils';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import TrashIcon from '@/components/icons/trash';

export default function CompanyOffice({
  className,
  data,
}: {
  className?: string;
  data?: any;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateCompanyInput>();

  // Keep dynamic rows in the form; no state-to-form synchronization effects.
  const {
    fields: officeTels,
    append: appendOfficeTels,
    remove: removeOfficeTels,
  } = useFieldArray({ control, name: 'officeTels' });
  const {
    fields: officeFaxes,
    append: appendOfficeFaxes,
    remove: removeOfficeFaxes,
  } = useFieldArray({ control, name: 'officeFaxes' });

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
            key={phone.id}
            className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
          >
            <Input
              type="tel"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              defaultValue={phone.telNumber}
              {...register(`officeTels.${index}.telNumber`)}
              placeholder={`تلفن دفتر مرکزی ${index + 1}`}
              className="min-w-0"
              inputClassName="text-left"
              error={(errors.officeTels as any)?.[index]?.telNumber?.message}
              helperText="(مثال: 02112345678)"
            />
            <ActionIcon
              type="button"
              aria-label={`حذف تلفن دفتر مرکزی ${index + 1}`}
              className="h-10 w-10 shrink-0 self-start"
              onClick={() => removeOfficeTels(index)}
              variant="flat"
              color="danger"
            >
              <TrashIcon className="h-4 w-4 text-red-light" />
            </ActionIcon>
          </div>
        ))}
        {officeTels.length < 3 && (
          <Button
            type="button"
            onClick={() =>
              appendOfficeTels({
                id: 0,
                telType: 'OFFICE',
                telNumber: '',
                companyId: data?.id || 0,
              })
            }
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
            key={fax.id}
            className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
          >
            <Input
              type="tel"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              defaultValue={fax.telNumber}
              {...register(`officeFaxes.${index}.telNumber`)}
              placeholder={`فکس دفتر مرکزی ${index + 1}`}
              className="min-w-0"
              inputClassName="text-left"
              error={(errors.officeFaxes as any)?.[index]?.telNumber?.message}
              helperText="(مثال: 02112345678)"
            />
            <ActionIcon
              type="button"
              aria-label={`حذف فکس دفتر مرکزی ${index + 1}`}
              className="h-10 w-10 shrink-0 self-start"
              onClick={() => removeOfficeFaxes(index)}
              variant="flat"
              color="danger"
            >
              <TrashIcon className="h-4 w-4 text-red-light" />
            </ActionIcon>
          </div>
        ))}
        {officeFaxes.length < 3 && (
          <Button
            type="button"
            onClick={() =>
              appendOfficeFaxes({
                id: 0,
                telType: 'OFFICE_FAX',
                telNumber: '',
                companyId: data?.id || 0,
              })
            }
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
