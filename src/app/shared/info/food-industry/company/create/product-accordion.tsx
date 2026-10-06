import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from 'rizzui';
import { Plus, Trash2, Layers3, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { API_BASE_URL, STATIC_FILES_URL } from '@/config/api.config';
import { groupProducts, GroupedProduct } from './product-groups';
import { useCompanyUploadValidation } from '@/hooks/use-company-upload-validation';
import { validateUploadFile } from '@/utils/file-upload-validation';
import FileUploadGuidelines from '@/components/ui/file-upload-guidelines';
import Image from 'next/image';

interface Props {
  products: GroupedProduct[];
  append: (product: GroupedProduct) => void;
  insert: (index: number, product: GroupedProduct) => void;
  remove: (indices: number | number[]) => void;
  dataObjectName: string;
  onUploadingChange: (uploading: boolean) => void;
}

export default function ProductAccordion({
  products,
  append,
  insert,
  remove,
  dataObjectName,
  onUploadingChange,
}: Props) {
  const {
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const axios = useAxiosPrivate();
  const uploadValidation = useCompanyUploadValidation('PRODUCT_PICTURE');
  const values: GroupedProduct[] = watch(dataObjectName) || [];
  const groups = groupProducts(
    values.map((p, i) => ({ ...p, fieldId: products[i]?.fieldId }))
  );
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const setShared = (key: string, property: string, value: unknown) => {
    const current = getValues(dataObjectName) as GroupedProduct[];
    const group = groupProducts(
      current.map((p, i) => ({ ...p, fieldId: products[i]?.fieldId }))
    ).find((g) => g.key === key);
    group?.indices.forEach((index) => {
      setValue(`${dataObjectName}.${index}._categoryKey`, key);
      setValue(`${dataObjectName}.${index}.${property}`, value, {
        shouldDirty: true,
      });
      clearErrors(`${dataObjectName}.${index}.${property}`);
    });
  };

  const upload = async (key: string, file?: File) => {
    if (!file) return;
    if (!uploadValidation.ready || !uploadValidation.validation) return;
    setUploading(key);
    onUploadingChange(true);
    try {
      const validationError = await validateUploadFile(file, uploadValidation.validation);
      if (validationError) { toast.error(validationError); return; }
      const body = new FormData();
      body.append('files', file);
      body.append('fileServiceType', 'PRODUCT_PICTURE');
      const response = await axios.post(`${API_BASE_URL}/file`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const image = response.data?.data?.[0];
      if (response.data?.status !== 'SUCCESS' || !image?.id)
        throw new Error('Upload failed');
      setShared(key, 'pictures', [image]);
      toast.success('تصویر دسته‌بندی ثبت شد');
    } catch {
      toast.error('آپلود تصویر انجام نشد؛ دوباره تلاش کنید.');
    } finally {
      setUploading(null);
      onUploadingChange(false);
    }
  };

  const editorHeading = useRef<HTMLDivElement>(null);
  const errorKeys = groups
    .filter((group) =>
      group.indices.some((index) => (errors[dataObjectName] as any)?.[index])
    )
    .map((group) => group.key);
  const errorSignature = JSON.stringify(errorKeys);
  useEffect(() => {
    const keys: string[] = JSON.parse(errorSignature);
    if (keys.length) setOpenKey(keys[0]);
  }, [errorSignature]);
  const selected = groups.find((group) => group.key === openKey) || groups[0];
  useEffect(() => {
    editorHeading.current?.scrollIntoView({ block: 'nearest' });
  }, [selected?.key]);
  const addCategory = () => {
    const key = crypto.randomUUID();
    append({
      id: values[0]?.id ?? null,
      showProduct: values[0]?.showProduct ?? true,
      _productPictures: values[0]?._productPictures,
      _categoryKey: key,
      categoryType: '',
      name: '',
      description: '',
      pictures: [],
      outsourced: dataObjectName === 'outSourcedProducts',
    });
    setOpenKey(key);
    setDeleteKey(null);
  };
  const imageSrc = (picture: any) =>
    picture?.url ||
    (picture?.filePath
      ? (/^https?:\/\//i.test(picture.filePath) ? picture.filePath : `${STATIC_FILES_URL}${picture.filePath}`)
      : '');

  return (
    <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 min-w-0 self-start border-b bg-gray-50 p-4 md:border-b-0 md:border-l">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">دسته‌بندی‌ها</h4>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">
            {groups.length.toLocaleString('fa-IR')}
          </span>
        </div>
        <Button
          type="button"
          color="primary"
          variant="outline"
          disabled={!!uploading}
          onClick={addCategory}
          className="mb-4 w-full bg-white"
        >
          <Plus className="me-2 h-4 w-4" />
          افزودن دسته‌بندی
        </Button>
        <nav
          aria-label="انتخاب دسته‌بندی محصولات"
          className="flex gap-2 overflow-x-auto pb-1 md:max-h-[50dvh] md:flex-col md:overflow-y-auto md:overflow-x-hidden"
        >
          {groups.map((group, index) => (
            <div
              key={group.key}
              className={`min-w-[190px] shrink-0 rounded-xl border p-2 transition md:min-w-0 ${
                selected?.key === group.key
                  ? 'border-primary bg-white shadow-sm'
                  : 'border-gray-200 bg-white/60'
              }`}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-current={
                    selected?.key === group.key ? 'true' : undefined
                  }
                  disabled={!!uploading}
                  onClick={() => {
                    setOpenKey(group.key);
                    setDeleteKey(null);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1 text-right focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Layers3 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {group.name ||
                        `دسته‌بندی جدید ${(index + 1).toLocaleString('fa-IR')}`}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {group.indices.length.toLocaleString('fa-IR')} محصول
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`حذف دسته‌بندی ${group.name || index + 1}`}
                  title="حذف دسته‌بندی"
                  disabled={!!uploading}
                  onClick={() => setDeleteKey(group.key)}
                  className="shrink-0 rounded-lg bg-red-lighter/40 p-2 text-red-dark transition hover:bg-red-lighter focus-visible:ring-2 focus-visible:ring-red disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {deleteKey === group.key && (
                <div className="mt-3 border-t border-red-lighter pt-3">
                  <p className="mb-3 text-xs leading-6 text-red-dark">
                    این دسته و {group.indices.length.toLocaleString('fa-IR')}{' '}
                    محصول آن حذف شوند؟
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      color="danger"
                      disabled={!!uploading}
                      onClick={() => {
                        remove(group.indices);
                        setDeleteKey(null);
                        if (selected?.key === group.key) setOpenKey(null);
                      }}
                    >
                      حذف
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteKey(null)}
                    >
                      انصراف
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <p className="mt-4 hidden text-xs leading-6 text-gray-500 md:block">
          برای ویرایش هر دسته، نام آن را انتخاب کنید.
        </p>
      </aside>
      <div className="min-w-0 p-4 sm:p-6">
        {!selected ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <span className="mb-4 rounded-2xl bg-primary-lighter p-4 text-primary">
              <Layers3 className="h-8 w-8" />
            </span>
            <h4 className="text-lg font-semibold">
              محصولاتتان را دسته‌بندی کنید
            </h4>
            <p className="mt-2 max-w-sm text-sm leading-7 text-gray-500">
              مثلاً یک دسته با نام «لبنیات» بسازید و شیر، ماست و پنیر را به آن
              اضافه کنید.
            </p>
            <Button
              type="button"
              color="primary"
              className="mt-5"
              onClick={addCategory}
            >
              <Plus className="me-2 h-4 w-4" />
              ساخت اولین دسته‌بندی
            </Button>
          </div>
        ) : (
          <div key={selected.key} className="space-y-6">
            <section aria-label="اطلاعات دسته‌بندی">
              <div ref={editorHeading} className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-lighter text-xs font-semibold text-primary">
                  ۱
                </span>
                <h4 className="font-semibold">نام و تصویر دسته‌بندی</h4>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                <div>
                  <Controller
                    name={`${dataObjectName}.${selected.indices[0]}.categoryType`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        name={field.name}
                        ref={field.ref}
                        label="نام دسته‌بندی *"
                        placeholder="مثلاً لبنیات"
                        value={field.value || ''}
                        onBlur={field.onBlur}
                        onChange={(e) =>
                          setShared(
                            selected.key,
                            'categoryType',
                            e.target.value
                          )
                        }
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    محصولات مشابه را در یک دسته قرار دهید.
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">
                    تصویر دسته‌بندی {dataObjectName === 'products' ? '(اختیاری)' : '*'}
                  </p>
                  <label
                    className={`relative flex min-h-[100px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed bg-gray-50 p-3 text-center transition focus-within:ring-2 focus-within:ring-primary hover:border-primary ${
                      uploading || !uploadValidation.ready ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    {imageSrc(selected.pictures[0]) ? (
                      <Image
                        src={imageSrc(selected.pictures[0])}
                        alt={`تصویر ${selected.name}`}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <span>
                        <ImagePlus className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                        <span className="text-xs font-medium">
                          انتخاب تصویر
                        </span>
                      </span>
                    )}
                    <input
                      aria-label="انتخاب تصویر دسته‌بندی"
                      type="file"
                      accept={uploadValidation.accept}
                      aria-describedby="product-category-upload-rules"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      disabled={!!uploading || !uploadValidation.ready}
                      onChange={(e) => {
                        void upload(selected.key, e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {selected.pictures.length > 0 && (
                    <button
                      type="button"
                      disabled={!!uploading}
                      onClick={() => setShared(selected.key, 'pictures', [])}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-red-lighter/40 px-3 py-2 text-xs font-medium text-red-dark hover:bg-red-lighter disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف تصویر دسته‌بندی
                    </button>
                  )}
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {uploading
                      ? 'در حال بارگذاری…'
                      : selected.pictures.length
                      ? 'برای تغییر تصویر کلیک کنید'
                      : dataObjectName === 'products'
                      ? 'در صورت تمایل تصویر اضافه کنید'
                      : 'یک تصویر برای تمام محصولات این دسته انتخاب کنید'}
                  </p>
                  {(errors[dataObjectName] as any)?.[selected.indices[0]]
                    ?.pictures?.message && (
                    <p className="mt-1 text-xs text-red-dark">
                      {
                        (errors[dataObjectName] as any)[selected.indices[0]]
                          .pictures.message
                      }
                    </p>
                  )}
                </div>
              </div>
              <FileUploadGuidelines id="product-category-upload-rules" state={uploadValidation} compact />
            </section>
            <section aria-label="محصولات دسته‌بندی" className="border-t pt-5">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-lighter text-xs font-semibold text-primary">
                    ۲
                  </span>
                  <h4 className="font-semibold">محصولات این دسته</h4>
                  <span className="text-xs text-gray-500">
                    ({selected.indices.length.toLocaleString('fa-IR')})
                  </span>
                </div>
              </div>
              <p className="mb-4 text-xs leading-6 text-gray-500">
                هر محصول یک عنوان و توضیح جداگانه دارد؛ تصویر بالا برای همه
                محصولات این دسته استفاده می‌شود.
              </p>
              <div className="space-y-3">
                {selected.indices.map((index, row) => (
                  <div
                    key={products[index]?.fieldId || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-500">
                        محصول {(row + 1).toLocaleString('fa-IR')}
                      </span>
                      {selected.indices.length > 1 && (
                        <button
                          type="button"
                          disabled={!!uploading}
                          aria-label={`حذف محصول ${row + 1}`}
                          onClick={() => remove(index)}
                          className="flex items-center gap-1 rounded-lg bg-red-lighter/40 px-3 py-2 text-xs font-medium text-red-dark transition hover:bg-red-lighter"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                      <Controller
                        name={`${dataObjectName}.${index}.name`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Input
                            {...field}
                            value={field.value || ''}
                            label="عنوان محصول *"
                            placeholder="مثلاً شیر کم‌چرب"
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`${dataObjectName}.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            label="توضیحات محصول"
                            placeholder="ویژگی‌ها، نوع بسته‌بندی یا کاربرد محصول"
                            rows={2}
                          />
                        )}
                      />
                    </div>
                    {row === selected.indices.length - 1 && (
                      <div className="mt-4 border-t border-gray-200 pt-2">
                        <button
                          type="button"
                          disabled={!!uploading}
                          className="inline-flex items-center gap-1.5 rounded py-2 text-sm font-medium text-primary transition hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                          onClick={() =>
                            insert(index + 1, {
                              id: values[index]?.id ?? null,
                              showProduct: values[index]?.showProduct ?? true,
                              _productPictures: values[index]?._productPictures,
                              _categoryKey: selected.key,
                              categoryType: selected.name,
                              pictures: selected.pictures,
                              name: '',
                              description: '',
                              outsourced:
                                dataObjectName === 'outSourcedProducts',
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          افزودن محصول
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
