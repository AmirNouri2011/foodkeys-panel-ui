import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Modal, Button } from 'rizzui';
import { Plus, ArrowLeft, X, Package, Boxes } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import cn from '@/utils/class-names';
import ProductAvailability from './product-availability';
import ProductAccordion from './product-accordion';
import { groupProducts, GroupedProduct } from './product-groups';
import toast from 'react-hot-toast';
import styles from './product-theme.module.css';

export default function ProductMedia({ className }: { className?: string }) {
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const products = useFieldArray({
    control,
    name: 'products',
    keyName: 'fieldId',
  });
  const outsourced = useFieldArray({
    control,
    name: 'outSourcedProducts',
    keyName: 'fieldId',
  });
  const [modalType, setModalType] = useState<0 | 1 | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const mode = watch('productAvailability', '2');
  const currentProducts: GroupedProduct[] = watch('products') || [];
  const currentOutsourced: GroupedProduct[] = watch('outSourcedProducts') || [];
  const active = modalType === 1 ? outsourced : products;
  const fieldName = modalType === 1 ? 'outSourcedProducts' : 'products';
  const close = () => {
    if (!uploading) setModalType(null);
  };

  const changeMode = (nextMode: string) => {
    if (mode === '2') {
      products.replace([]);
      outsourced.replace([]);
      clearErrors(['products', 'outSourcedProducts']);
    } else {
      for (const name of [
        'productTitles',
        'productsDescription',
        'outSourcedProductsDescription',
      ]) {
        setValue(name, '', { shouldDirty: true });
        clearErrors(name);
      }
    }
    setValue('productAvailability', nextMode, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setPendingMode(null);
  };

  const requestModeChange = (nextMode: string) => {
    if (nextMode === mode) return;
    const hasPreviousData =
      mode === '2'
        ? ['products', 'outSourcedProducts'].some(
            (name) => getValues(name)?.length > 0
          )
        : [
            'productTitles',
            'productsDescription',
            'outSourcedProductsDescription',
          ].some((name) => Boolean(getValues(name)?.trim()));
    if (hasPreviousData) {
      setPendingMode(nextMode);
    } else {
      changeMode(nextMode);
    }
  };

  const confirm = () => {
    const rows: GroupedProduct[] = getValues(fieldName) || [];
    clearErrors(fieldName);
    let invalid = false;
    rows.forEach((row, index) => {
      if (!row.categoryType?.trim()) {
        setError(`${fieldName}.${index}.categoryType`, {
          type: 'required',
          message: 'نام دسته‌بندی را وارد کنید',
        });
        invalid = true;
      }
      if (!row.name?.trim()) {
        setError(`${fieldName}.${index}.name`, {
          type: 'required',
          message: 'عنوان محصول را وارد کنید',
        });
        invalid = true;
      }
      if (modalType === 1 && !row.pictures?.length) {
        setError(`${fieldName}.${index}.pictures`, {
          type: 'required',
          message: 'یک تصویر برای دسته‌بندی انتخاب کنید',
        });
        invalid = true;
      }
    });
    const categoryNames = new Set<string>();
    groupProducts(rows).forEach((group) => {
      const name = group.name.trim();
      if (name && categoryNames.has(name)) {
        setError(`${fieldName}.${group.indices[0]}.categoryType`, {
          type: 'duplicate',
          message:
            'این دسته‌بندی قبلاً اضافه شده؛ محصول را به همان دسته اضافه کنید',
        });
        invalid = true;
      }
      categoryNames.add(name);
    });
    if (invalid) {
      toast.error(
        modalType === 1
          ? 'نام دسته‌بندی، تصویر آن و عنوان تمام محصولات را تکمیل کنید.'
          : 'نام دسته‌بندی و عنوان تمام محصولات را تکمیل کنید.'
      );
      return;
    }
    close();
  };

  return (
    <div className={cn(styles.theme, 'space-y-6', className)}>
      <div>
        <h4 className="text-base font-semibold">مدیریت محصولات و خدمات</h4>
        <p className="mt-2 text-sm text-gray-500">
          محصولات و خدمات شرکت خود را معرفی کنید.
        </p>
      </div>
      <ProductAvailability
        key={`${mode}-${pendingMode ?? 'idle'}`}
        onModeChange={requestModeChange}
      />
      <Modal
        isOpen={pendingMode !== null}
        onClose={() => setPendingMode(null)}
        customSize="480px"
      >
        <div dir="rtl" className={cn(styles.theme, 'p-5 sm:p-6')}>
          <h3 className="text-lg font-semibold">تغییر روش ثبت محصولات</h3>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            {pendingMode === '1'
              ? 'با انتخاب ثبت توصیفی، تمام دسته‌بندی‌ها، محصولات و تصاویر انتخاب‌شده در ثبت تفصیلی، از این فرم حذف می‌شوند.'
              : 'با انتخاب ثبت تفصیلی، عنوان‌ها و توضیحات واردشده در ثبت توصیفی،  از این فرم حذف می‌شوند.'}
          </p>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            این اطلاعات با تغییر دوباره روش برنمی‌گردند. تغییر روش را تأیید
            می‌کنید؟
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingMode(null)}
            >
              انصراف و حفظ اطلاعات
            </Button>
            <Button
              type="button"
              color="danger"
              onClick={() => pendingMode !== null && changeMode(pendingMode)}
            >
              حذف اطلاعات و تغییر روش
            </Button>
          </div>
        </div>
      </Modal>
      <div className="rounded-2xl border border-gray-200 p-4 sm:p-6">
        {mode === '1' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="col-span-full">
              <h5 className="font-semibold">معرفی کلی محصولات</h5>
              <p className="mt-1 text-sm text-gray-500">
                عناوین و توضیحات محصولات و خدمات شرکت را بنویسید.
              </p>
            </div>
            <Textarea
              label="عنوان محصولات و خدمات *"
              {...register('productTitles')}
              error={errors.productTitles?.message as string}
              rows={3}
              placeholder="مثلاً: شیر، ماست و پنیر"
            />
            <Textarea
              label="توضیحات محصولات و خدمات *"
              {...register('productsDescription')}
              error={errors.productsDescription?.message as string}
              rows={3}
              placeholder="معرفی کلی محصولات و خدمات شرکت"
            />
            <Textarea
              className="col-span-full"
              label="توضیحات محصولات برون‌سپاری‌شده"
              {...register('outSourcedProductsDescription')}
              error={errors.outSourcedProductsDescription?.message as string}
              rows={3}
              placeholder="محصولاتی که تولید آن‌ها را به دیگران می‌سپارید (اختیاری)"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold">دسته‌بندی‌ها و محصولات شرکت</h5>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                ابتدا دسته‌بندی بسازید و محصولات آن را اضافه کنید.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  type: 0 as const,
                  title: 'محصولات و خدمات اصلی',
                  description: 'محصولات تولیدی و خدمات ارائه‌شده توسط شرکت',
                  rows: currentProducts,
                  Icon: Package,
                },
                {
                  type: 1 as const,
                  title: 'محصولات برون‌سپاری‌شده',
                  description: 'محصولاتی که تولید آن‌ها را به دیگران می‌سپارید',
                  rows: currentOutsourced,
                  Icon: Boxes,
                },
              ].map(({ type, title, description, rows, Icon }) => {
                const groups = groupProducts(rows);
                return (
                  <div
                    key={type}
                    className="flex min-w-0 flex-col rounded-xl border border-gray-200 p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-primary-lighter p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h6 className="font-semibold">{title}</h6>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {description}
                        </p>
                      </div>
                    </div>
                    <p className="my-4 text-sm text-gray-600">
                      {groups.length.toLocaleString('fa-IR')} دسته‌بندی{' '}
                      <span className="px-2 text-gray-300">|</span>{' '}
                      {rows.length.toLocaleString('fa-IR')} محصول
                    </p>
                    {groups.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {groups.slice(0, 3).map((group) => (
                          <span
                            key={group.key}
                            className="max-w-full truncate rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600"
                          >
                            {group.name || 'دسته‌بندی جدید'}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      color="primary"
                      variant={type === 0 ? 'solid' : 'outline'}
                      className="mt-auto w-full"
                      onClick={() => setModalType(type)}
                    >
                      {rows.length ? (
                        <ArrowLeft className="me-2 h-4 w-4" />
                      ) : (
                        <Plus className="me-2 h-4 w-4" />
                      )}
                      {rows.length
                        ? 'مدیریت دسته‌بندی‌ها و محصولات'
                        : 'افزودن دسته‌بندی و محصول'}
                    </Button>
                  </div>
                );
              })}
            </div>
            {errors.products?.message && (
              <p className="text-sm text-red-dark">
                {errors.products.message as string}
              </p>
            )}
          </div>
        )}
      </div>
      <Modal isOpen={modalType !== null} onClose={close} customSize="1120px">
        <div
          dir="rtl"
          className={cn(styles.theme, 'flex max-h-[90dvh] flex-col')}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b p-4 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold">
                {modalType === 1
                  ? 'محصولات برون‌سپاری‌شده'
                  : 'محصولات و خدمات اصلی'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                یک دسته‌بندی انتخاب کنید؛ سپس محصولات همان دسته را وارد کنید.
              </p>
            </div>
            <button
              type="button"
              aria-label="بستن مدیریت محصولات"
              disabled={uploading}
              onClick={close}
              className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ProductAccordion
              key={fieldName}
              products={active.fields}
              append={active.append}
              insert={active.insert}
              remove={active.remove}
              dataObjectName={fieldName}
              onUploadingChange={setUploading}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-gray-50 p-4 sm:px-6">
            <p className="text-xs text-gray-500">
              اطلاعات تا زمان ثبت نهایی شرکت در این فرم نگه داشته می‌شوند.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={close}
              >
                انصراف
              </Button>
              <Button
                type="button"
                color="primary"
                disabled={uploading}
                onClick={confirm}
              >
                تأیید اطلاعات و بازگشت
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
