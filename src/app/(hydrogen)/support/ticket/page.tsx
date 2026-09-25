'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Modal, Text } from 'rizzui';
import {
  PiCaretDownBold,
  PiCheckCircle,
  PiClockCountdown,
  PiHeadset,
  PiInfo,
  PiPlusBold,
  PiShieldCheck,
  PiXBold,
} from 'react-icons/pi';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionIcon } from '@/components/ui/action-icon';
import PageHeader from '@/app/shared/page-header';
import { TabList } from '@/app/shared/support/inbox/inbox-tabs';
import SupportInbox from '@/app/shared/support/inbox';
import SelectLoader from '@/components/loader/select-loader';
import QuillLoader from '@/components/loader/quill-loader';
import useAxiosPrivate from '@/hooks/use-axios-private';

const Select = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <SelectLoader />,
});

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader />,
});

const categoryOptions = [
  { value: 'GENERAL', name: 'عمومی' },
  { value: 'TECHNICAL', name: 'فنی' },
  { value: 'FINANCIAL', name: 'مالی و اعتباری' },
];

const departmentOptions = [
  { value: 'MANAGEMENT', name: 'مدیریت' },
  { value: 'SUPPORT', name: 'پشتیبانی فنی' },
  { value: 'FINANCE', name: 'مالی و اعتباری' },
];

const priorityOptions = [
  { value: 'LOW', name: 'کم' },
  { value: 'MEDIUM', name: 'متوسط' },
  { value: 'HIGH', name: 'بالا' },
];

const optionSchema = z.object({
  name: z.string().min(1, 'انتخاب این گزینه الزامی است'),
  value: z.string().min(1, 'انتخاب این گزینه الزامی است'),
});

const ticketSchema = z.object({
  category: optionSchema,
  priority: optionSchema,
  subject: z
    .string()
    .trim()
    .min(3, 'موضوع تیکت باید حداقل ۳ حرف باشد')
    .max(150, 'موضوع تیکت نمی‌تواند بیشتر از ۱۵۰ حرف باشد'),
  message: z.string().trim().min(1, 'شرح درخواست الزامی است'),
  department: optionSchema,
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const pageHeader = {
  title: 'مرکز پشتیبانی',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'خانه' },
    { name: 'پشتیبانی' },
    { name: 'تیکت‌ها' },
  ],
};

export default function SupportInboxPage() {
  const _axios = useAxiosPrivate();
  const [refetchTickets, setRefetchTickets] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const methods = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: {} as TicketFormValues['category'],
      priority: priorityOptions[1],
      subject: '',
      message: '',
      department: {} as TicketFormValues['department'],
    },
  });

  function closeModal() {
    setIsModalOpen(false);
    methods.clearErrors();
  }

  const onSubmit = async (data: TicketFormValues) => {
    try {
      const response = await _axios.post(
        '/ticket',
        {
          category: data.category.value,
          department: data.department.value,
          priority: data.priority.value,
          message: data.message,
          subject: data.subject,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status !== 'SUCCESS') {
        throw new Error(response.data.message || 'Ticket creation failed');
      }

      toast.success('تیکت با موفقیت ثبت شد');
      setRefetchTickets((value) => value + 1);
      methods.reset({
        category: {} as TicketFormValues['category'],
        priority: priorityOptions[1],
        subject: '',
        message: '',
        department: {} as TicketFormValues['department'],
      });
      closeModal();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('ثبت تیکت انجام نشد؛ دوباره تلاش کنید');
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Button
          type="button"
          color="success"
          onClick={() => setIsModalOpen(true)}
          className="mt-2 w-full gap-2 shadow-sm @lg:mt-0 @lg:w-auto"
        >
          <PiPlusBold className="h-4 w-4" />
          ثبت تیکت جدید
        </Button>
      </PageHeader>

      <section className="relative mb-5 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-l from-primary/10 via-white to-green-lighter/40 p-5 dark:via-gray-50 sm:p-6">
        <span className="absolute -left-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <PiHeadset className="h-6 w-6" />
            </span>
            <div>
              <Text tag="h2" className="text-lg font-bold text-gray-900">
                برای حل مسئله کنارتان هستیم
              </Text>
              <p className="mt-1 max-w-2xl text-sm leading-7 text-gray-600">
                درخواست خود را با جزئیات ثبت کنید. پاسخ کارشناسان و تمام
                گفتگوهای قبلی را می‌توانید همین‌جا دنبال کنید.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 xs:grid-cols-3 lg:min-w-[430px]">
            <span className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 backdrop-blur dark:bg-gray-100/80">
              <PiClockCountdown className="h-4 w-4 text-orange-dark" />
              پیگیری یکپارچه
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 backdrop-blur dark:bg-gray-100/80">
              <PiShieldCheck className="h-4 w-4 text-green-dark" />
              گفتگوی امن
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 backdrop-blur dark:bg-gray-100/80">
              <PiCheckCircle className="h-4 w-4 text-primary" />
              تاریخچه کامل
            </span>
          </div>
        </div>
      </section>

      <TabList />
      <SupportInbox refetchTickets={refetchTickets} />

      <Modal isOpen={isModalOpen} size="lg" onClose={closeModal}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text tag="h3" className="text-lg font-bold text-gray-900">
                    ثبت تیکت جدید
                  </Text>
                  <p className="mt-1 text-xs leading-6 text-gray-500">
                    هرچه توضیحات دقیق‌تر باشد، سریع‌تر می‌توانیم کمک کنیم.
                  </p>
                </div>
                <ActionIcon
                  type="button"
                  size="sm"
                  variant="text"
                  aria-label="بستن"
                  onClick={closeModal}
                >
                  <PiXBold className="h-5 w-5" />
                </ActionIcon>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-7">
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-6 text-blue-700">
                <PiInfo className="mt-1 h-4 w-4 flex-none" />
                <p>
                  برای هر موضوع یک تیکت جدا ثبت کنید. فایل‌های مرتبط را پس از
                  ثبت تیکت، داخل گفت‌وگو ارسال کنید.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="موضوع تیکت"
                    placeholder="مثلاً: مشکل در ویرایش اطلاعات شرکت"
                    {...methods.register('subject')}
                    error={methods.formState.errors.subject?.message}
                    labelClassName="mb-1.5 font-medium text-gray-800"
                  />
                </div>

                <Controller
                  name="category"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="دسته‌بندی"
                      placeholder="انتخاب دسته‌بندی"
                      options={categoryOptions}
                      value={value}
                      onChange={onChange}
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) => selected?.name}
                      error={methods.formState.errors.category?.name?.message}
                      suffix={<PiCaretDownBold className="h-3.5 w-3.5" />}
                    />
                  )}
                />

                <Controller
                  name="department"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="واحد پاسخ‌گو"
                      placeholder="انتخاب واحد"
                      options={departmentOptions}
                      value={value}
                      onChange={onChange}
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) => selected?.name}
                      error={methods.formState.errors.department?.name?.message}
                      suffix={<PiCaretDownBold className="h-3.5 w-3.5" />}
                    />
                  )}
                />

                <Controller
                  name="priority"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="اولویت"
                      options={priorityOptions}
                      value={value}
                      onChange={onChange}
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) => selected?.name}
                      error={methods.formState.errors.priority?.name?.message}
                      suffix={<PiCaretDownBold className="h-3.5 w-3.5" />}
                    />
                  )}
                />

                <div className="hidden sm:block" />

                <div className="sm:col-span-2">
                  <Controller
                    name="message"
                    control={methods.control}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <QuillEditor
                          label="شرح درخواست"
                          value={value}
                          onChange={onChange}
                          className="rounded-lg bg-gray-0 [&>.ql-container_.ql-editor]:min-h-[150px] [&>.ql-toolbar]:overflow-x-auto"
                        />
                        {fieldState.error && (
                          <p className="mt-1 text-xs text-red-light">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="sm:min-w-[110px]"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                color="success"
                isLoading={methods.formState.isSubmitting}
                className="gap-2 sm:min-w-[150px]"
              >
                {!methods.formState.isSubmitting && (
                  <PiPlusBold className="h-4 w-4" />
                )}
                ثبت تیکت
              </Button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}
