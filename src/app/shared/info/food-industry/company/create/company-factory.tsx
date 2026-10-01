import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import SelectLoader from '@/components/loader/select-loader';
import QuillLoader from '@/components/loader/quill-loader';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import TrashIcon from '@/components/icons/trash';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../../../../hooks/use-axios-private';
import { Textarea } from '@/components/ui/textarea';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

interface FactoryTel {
  id: number;
  telType: string;
  telNumber: string;
  companyId: number;
}

export default function CompanyFactory({
                                         className,
                                         category,
                                         data,
                                       }: {
  className?: string;
  category?: number;
  data?: any;
}) {
  const _axios = useAxiosPrivate();
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [factoryTels, setFactoryTels] = useState<string[]>(['']);
  const [factoryFaxes, setFactoryFaxes] = useState<string[]>([]);
  const [contacts, setContacts] = useState<
      {
        name: string;
        lastName: string;
        position: string;
        phone: string;
        email: string;
      }[]
  >([]);

  const {
    register,
    control,
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = useFormContext();

  const watchedTels = watch('factoryTels', []);
  const watchedFaxes = watch('factoryFaxes', []);
  const watchedContacts = watch('contacts', []);

  // Initialize local state from form values if they exist
  useEffect(() => {
    if (watchedTels && watchedTels.length) {
      const nextTels = watchedTels.map((tel: FactoryTel) => tel.telNumber);
      setFactoryTels((current) =>
          JSON.stringify(current) === JSON.stringify(nextTels) ? current : nextTels
      );
    }
    if (watchedFaxes && watchedFaxes.length) {
      const nextFaxes = watchedFaxes.map((fax: FactoryTel) => fax.telNumber);
      setFactoryFaxes((current) =>
          JSON.stringify(current) === JSON.stringify(nextFaxes) ? current : nextFaxes
      );
    }
    if (watchedContacts && watchedContacts.length) {
      setContacts((current) =>
          JSON.stringify(current) === JSON.stringify(watchedContacts)
              ? current
              : watchedContacts
      );
    }
  }, [watchedContacts, watchedFaxes, watchedTels]);

  // Update form values when local state changes
  useEffect(() => {
    // Convert string array to required format for the form
    const formattedTels = factoryTels.map((tel, index) => ({
      id: index,
      telType: 'FACTORY',
      telNumber: tel,
      companyId: data?.id || 0,
    }));
    setValue('factoryTels', formattedTels, { shouldValidate: isSubmitted });
  }, [factoryTels, setValue, data?.id, isSubmitted]);

  useEffect(() => {
    // Convert string array to required format for the form
    const formattedFaxes = factoryFaxes.map((fax, index) => ({
      id: index,
      telType: 'FACTORY_FAX',
      telNumber: fax,
      companyId: data?.id || 0,
    }));
    setValue('factoryFaxes', formattedFaxes, { shouldValidate: isSubmitted });
  }, [factoryFaxes, setValue, data?.id, isSubmitted]);

  useEffect(() => {
    setValue('contacts', contacts, { shouldValidate: isSubmitted });
  }, [contacts, setValue, isSubmitted]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await _axios.get('/province');
        if (response.data.status === 'SUCCESS') {
          setProvinces(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, [_axios]);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          // @ts-ignore
          const response = await _axios.get(
              //@ts-ignore
              `/province/${selectedProvince.value}/city`
          );
          if (response.data.status === 'SUCCESS') {
            setCities(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      };
      fetchCities();
    }
  }, [selectedProvince, _axios]);

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
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
              >
                <Input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    placeholder={`تلفن کارخانه ${index + 1}`}
                    onChange={(e) => {
                      const newPhones = [...factoryTels];
                      newPhones[index] = e.target.value;
                      setFactoryTels(newPhones);
                    }}
                    className="min-w-0"
                    inputClassName="text-left"
                    error={(errors.factoryTels as any)?.[index]?.telNumber?.message}
                    helperText="(مثال: 02112345678)"
                />
                <ActionIcon
                    type="button"
                    aria-label={`حذف تلفن کارخانه ${index + 1}`}
                    className="h-10 w-10 shrink-0 self-start"
                    onClick={() =>
                        setFactoryTels(factoryTels.filter((_, i) => i !== index))
                    }
                    variant="flat"
                    color="danger"
                >
                  <TrashIcon className="h-4 w-4 text-red-light" />
                </ActionIcon>
              </div>
          ))}
          {factoryTels.length < 3 && (
              <Button
                  onClick={() => setFactoryTels([...factoryTels, ''])}
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
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-2"
              >
                <Input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={fax}
                    placeholder={`فکس کارخانه ${index + 1}`}
                    onChange={(e) => {
                      const newFaxes = [...factoryFaxes];
                      newFaxes[index] = e.target.value;
                      setFactoryFaxes(newFaxes);
                    }}
                    className="min-w-0"
                    inputClassName="text-left"
                    error={(errors.factoryFaxes as any)?.[index]?.telNumber?.message}
                    helperText="(مثال: 02112345678)"
                />
                <ActionIcon
                    type="button"
                    aria-label={`حذف فکس کارخانه ${index + 1}`}
                    className="h-10 w-10 shrink-0 self-start"
                    onClick={() =>
                        setFactoryFaxes(factoryFaxes.filter((_, i) => i !== index))
                    }
                    variant="flat"
                    color="danger"
                >
                  <TrashIcon className="h-4 w-4 text-red-light" />
                </ActionIcon>
              </div>
          ))}
          {factoryFaxes.length < 3 && (
              <Button
                  onClick={() => setFactoryFaxes([...factoryFaxes, ''])}
                  variant="outline"
              >
                <PiPlusBold className="me-2 h-4 w-4" /> اضافه کردن فکس جدید
              </Button>
          )}
        </div>

        <div id="field-contacts" className="col-span-full flex flex-col space-y-2">
          <label className="mb-4 font-medium text-gray-700 dark:text-gray-600">
            اطلاعات موبایل های شرکت
          </label>
          {contacts.map((contact, index) => (
              <div
                  key={index}
                  className="grid grid-cols-1 items-center gap-4 xl:grid-cols-4"
              >
                <Input
                    label="نام*"
                    placeholder="نام*"
                    value={contact.name}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].name = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-grow"
                />

                <Input
                    label="نام خانوادگی*"
                    placeholder="نام خانوادگی*"
                    value={contact.lastName}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].lastName = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-grow"
                />

                <Input
                    label="سمت*"
                    placeholder="سمت"
                    value={contact.position}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].position = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-grow"
                />
                <Input
                    label="شماره موبایل*"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="شماره موبایل*"
                    value={contact.phone}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].phone = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-grow"
                    error={(errors.contacts as any)?.[index]?.phone?.message}
                    helperText="(مثال: 09123456789)"
                />

                <Input
                    label="ایمیل"
                    type="email"
                    placeholder="ایمیل"
                    value={contact.email}
                    onChange={(e) => {
                      const newContacts = [...contacts];
                      newContacts[index].email = e.target.value;
                      setContacts(newContacts);
                    }}
                    className="flex-grow"
                    error={(errors.contacts as any)?.[index]?.email?.message}
                    helperText="(مثال: info@foodkeys.com)"
                />
                <ActionIcon
                    onClick={() =>
                        setContacts(contacts.filter((_, i) => i !== index))
                    }
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
                  onClick={() =>
                      setContacts([
                        ...contacts,
                        { name: '', lastName: '', email: '', position: '', phone: '' },
                      ])
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
