import { useFieldArray, useFormContext } from 'react-hook-form';
import type { CreateCompanyInput } from './form-utils';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import TrashIcon from '@/components/icons/trash';

export default function CompanyFactory({
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
  } = useFormContext<CreateCompanyInput>();

  // Keep dynamic rows in the form; no state-to-form synchronization effects.
  const {
    fields: factoryTels,
    append: appendFactoryTels,
    remove: removeFactoryTels,
  } = useFieldArray({ control, name: 'factoryTels' });
  const {
    fields: factoryFaxes,
    append: appendFactoryFaxes,
    remove: removeFactoryFaxes,
  } = useFieldArray({ control, name: 'factoryFaxes' });
  const {
    fields: contacts,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control, name: 'contacts' });

  return (
    <FormGroup
      title="اطلاعات تماس کارخانه"
      description="شامل تلفن های تماس، آدرس و ..."
      className={cn(className)}
    >
      <div id="field-factoryTels" className="flex flex-col space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-600">
          تلفن‌های ثابت کارخانه*
        </label>
        {factoryTels.map((phone, index) => (
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
              {...register(`factoryTels.${index}.telNumber`)}
              placeholder={`تلفن کارخانه ${index + 1}`}
              className="min-w-0"
              inputClassName="text-left"
              error={(errors.factoryTels as any)?.[index]?.telNumber?.message}
              helperText="(مثال: 02112345678)"
            />
            <ActionIcon
              type="button"
              aria-label={`حذف تلفن کارخانه ${index + 1}`}
              className="h-10 w-10 shrink-0 self-start"
              onClick={() => removeFactoryTels(index)}
              variant="flat"
              color="danger"
            >
              <TrashIcon className="h-4 w-4 text-red-light" />
            </ActionIcon>
          </div>
        ))}
        {factoryTels.length < 3 && (
          <Button
            type="button"
            onClick={() =>
              appendFactoryTels({
                id: 0,
                telType: 'FACTORY',
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

      <div id="field-factoryFaxes" className="flex flex-col space-y-2">
        <label className="font-medium text-gray-700 dark:text-gray-600">
          فکس ثابت کارخانه
        </label>
        {factoryFaxes.map((fax, index) => (
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
              {...register(`factoryFaxes.${index}.telNumber`)}
              placeholder={`فکس کارخانه ${index + 1}`}
              className="min-w-0"
              inputClassName="text-left"
              error={(errors.factoryFaxes as any)?.[index]?.telNumber?.message}
              helperText="(مثال: 02112345678)"
            />
            <ActionIcon
              type="button"
              aria-label={`حذف فکس کارخانه ${index + 1}`}
              className="h-10 w-10 shrink-0 self-start"
              onClick={() => removeFactoryFaxes(index)}
              variant="flat"
              color="danger"
            >
              <TrashIcon className="h-4 w-4 text-red-light" />
            </ActionIcon>
          </div>
        ))}
        {factoryFaxes.length < 3 && (
          <Button
            type="button"
            onClick={() =>
              appendFactoryFaxes({
                id: 0,
                telType: 'FACTORY_FAX',
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

      <div
        id="field-contacts"
        className="col-span-full flex flex-col space-y-2"
      >
        <label className="mb-4 font-medium text-gray-700 dark:text-gray-600">
          اطلاعات موبایل های شرکت
        </label>
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="grid grid-cols-1 items-center gap-4 xl:grid-cols-4"
          >
            <Input
              label="نام*"
              placeholder="نام*"
              defaultValue={contact.name as string}
              {...register(`contacts.${index}.name`)}
              className="flex-grow"
            />

            <Input
              label="نام خانوادگی*"
              placeholder="نام خانوادگی*"
              defaultValue={contact.lastName as string}
              {...register(`contacts.${index}.lastName`)}
              className="flex-grow"
            />

            <Input
              label="سمت*"
              placeholder="سمت"
              defaultValue={contact.position as string}
              {...register(`contacts.${index}.position`)}
              className="flex-grow"
            />
            <Input
              label="شماره موبایل*"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="شماره موبایل*"
              defaultValue={contact.phone as string}
              {...register(`contacts.${index}.phone`)}
              className="flex-grow"
              error={(errors.contacts as any)?.[index]?.phone?.message}
              helperText="(مثال: 09123456789)"
            />

            <Input
              label="ایمیل"
              type="email"
              placeholder="ایمیل"
              defaultValue={contact.email as string}
              {...register(`contacts.${index}.email`)}
              className="flex-grow"
              error={(errors.contacts as any)?.[index]?.email?.message}
              helperText="(مثال: info@foodkeys.com)"
            />
            <ActionIcon
              type="button"
              onClick={() => removeContact(index)}
              variant="flat"
              color="danger"
              className="mt-6"
            >
              <TrashIcon className="h-4 w-4 text-red-light" />
            </ActionIcon>
          </div>
        ))}
        {contacts.length < 10 && (
          <Button
            type="button"
            onClick={() =>
              appendContact({
                name: '',
                lastName: '',
                email: '',
                position: '',
                phone: '',
              })
            }
            variant="outline"
          >
            <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن تماس جدید
          </Button>
        )}
      </div>
    </FormGroup>
  );
}
