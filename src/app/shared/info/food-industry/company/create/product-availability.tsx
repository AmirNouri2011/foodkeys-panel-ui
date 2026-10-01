import { Controller, useFormContext } from 'react-hook-form';
import { Layers3, AlignRight, CheckCircle2 } from 'lucide-react';

export default function ProductAvailability() {
  const { control } = useFormContext();
  return (
    <Controller
      name="productAvailability"
      control={control}
      defaultValue="2"
      render={({ field }) => (
        <fieldset className="space-y-3">
          <legend className="mb-1 font-semibold text-gray-900">
            روش ثبت محصولات را انتخاب کنید
          </legend>
          <p className="text-sm leading-6 text-gray-500">
            یکی از دو روش زیر را انتخاب کنید؛ سپس اطلاعات محصولات را در بخش
            پایین وارد کنید.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                value: '2',
                title: 'ثبت تفصیلی',
                subtitle: 'دسته‌بندی، تصویر و فهرست محصولات',
                description:
                  'محصولات را با عنوان و توضیح در دسته‌بندی‌های دلخواه ثبت کنید.',
                Icon: Layers3,
              },
              {
                value: '1',
                title: 'ثبت توصیفی',
                subtitle: 'معرفی کلی محصولات و خدمات',
                description:
                  'عنوان‌ها و توضیحات کلی شرکت را بدون تصویر وارد کنید.',
                Icon: AlignRight,
              },
            ].map(({ value, title, subtitle, description, Icon }) => (
              <label
                key={value}
                className={`relative flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                  field.value === value
                    ? 'border-primary bg-primary-lighter'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={value}
                  checked={field.value === value}
                  onChange={() => field.onChange(value)}
                  onBlur={field.onBlur}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold">{title}</span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-1 text-sm font-medium">{subtitle}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {description}
                  </p>
                  <span
                    className={`mt-3 flex items-center gap-1 text-xs font-medium ${
                      field.value === value ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    {field.value === value ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        روش انتخاب‌شده
                      </>
                    ) : (
                      'برای انتخاب این روش کلیک کنید'
                    )}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    />
  );
}
