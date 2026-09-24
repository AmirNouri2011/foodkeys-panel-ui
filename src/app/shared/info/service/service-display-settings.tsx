'use client';

import React, { useEffect, useState } from 'react';
import { Input, Textarea } from 'rizzui';
import { PiTagBold, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import LogoUpload from '@/components/ui/logo-upload';
import { STATIC_FILES_URL } from '@/config/api.config';

export interface ServiceDisplaySettingsValues {
  name: string;
  nameEn: string;
  description: string;
  logo?: string;
  backgroundImage?: string;
  keywords: string[];
  tags: string[];
  currentLogo?: string;
  currentBackgroundImage?: string;
}

interface ServiceDisplaySettingsProps {
  values: ServiceDisplaySettingsValues;
  onChange: (
    field: keyof ServiceDisplaySettingsValues,
    value: ServiceDisplaySettingsValues[keyof ServiceDisplaySettingsValues]
  ) => void;
  nameError?: string;
  fieldErrors?: Partial<Record<keyof ServiceDisplaySettingsValues, string>>;
}

function resolveImagePreview(
  fileId?: string,
  filePath?: string
): string | null {
  if (filePath) {
    return filePath.startsWith('http')
      ? filePath
      : `${STATIC_FILES_URL}${filePath}`;
  }

  if (fileId) {
    return fileId.startsWith('http') || fileId.startsWith('/')
      ? fileId.startsWith('/')
        ? `${STATIC_FILES_URL}${fileId}`
        : fileId
      : null;
  }

  return null;
}

export default function ServiceDisplaySettings({
  values,
  onChange,
  nameError,
  fieldErrors,
}: ServiceDisplaySettingsProps) {
  const [tags, setTags] = useState<string[]>(values.tags || []);
  const [keywords, setKeywords] = useState<string[]>(values.keywords || []);

  useEffect(() => {
    setTags(values.tags || []);
  }, [values.tags]);

  useEffect(() => {
    setKeywords(values.keywords || []);
  }, [values.keywords]);

  const logoPreview = resolveImagePreview(values.logo, values.currentLogo);
  const backgroundPreview = resolveImagePreview(
    values.backgroundImage,
    values.currentBackgroundImage
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="نام خدمت"
          placeholder="نام خدمت را وارد کنید"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={fieldErrors?.name || nameError}
          required
        />

        <Input
          label="نام انگلیسی خدمت"
          placeholder="نام انگلیسی خدمت را وارد کنید"
          value={values.nameEn}
          onChange={(e) => onChange('nameEn', e.target.value)}
          error={fieldErrors?.nameEn}
        />
      </div>

      <Textarea
        label="توضیحات"
        placeholder="توضیحات خدمت را وارد کنید"
        value={values.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={fieldErrors?.description}
        rows={4}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LogoUpload
          label="لوگوی خدمت"
          accept="image/*"
          logoPreview={logoPreview}
          fileServiceType="SERVICE_LOGO"
          onUploadSuccess={(fileData) => {
            onChange('logo', fileData.id);
            onChange('currentLogo', fileData.filePath);
          }}
          onRemove={() => {
            onChange('logo', '');
            onChange('currentLogo', '');
          }}
          wrapperClassName="flex-grow"
        />
        <LogoUpload
          label="تصویر پس‌زمینه صفحه اختصاصی"
          accept="image/*"
          logoPreview={backgroundPreview}
          fileServiceType="SERVICE_BACKGROUND_IMAGE"
          onUploadSuccess={(fileData) => {
            onChange('backgroundImage', fileData.id);
            onChange('currentBackgroundImage', fileData.filePath);
          }}
          onRemove={() => {
            onChange('backgroundImage', '');
            onChange('currentBackgroundImage', '');
          }}
          wrapperClassName="flex-grow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StringListInput
          name="تگ"
          items={tags}
          onChange={(next) => {
            setTags(next);
            onChange('tags', next);
          }}
        />
        <StringListInput
          name="کلمه کلیدی"
          items={keywords}
          onChange={(next) => {
            setKeywords(next);
            onChange('keywords', next);
          }}
        />
      </div>
    </div>
  );
}

function StringListInput({
  name,
  items,
  onChange,
}: {
  name: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [itemText, setItemText] = useState('');

  const handleAdd = () => {
    const trimmed = itemText.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setItemText('');
  };

  const handleRemove = (text: string) => {
    onChange(items.filter((item) => item !== text));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {name}
      </label>
      <div className="flex items-center">
        <Input
          value={itemText}
          placeholder={`${name} جدید وارد کنید`}
          onChange={(e) => setItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          prefix={<PiTagBold className="h-4 w-4" />}
          className="w-full"
        />
        <Button
          type="button"
          onClick={handleAdd}
          className="ms-4 shrink-0 text-sm dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
        >
          افزودن {name}
        </Button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((text, index) => (
            <div
              key={`${text}-${index}`}
              className="flex items-center rounded-full border border-gray-300 py-1 pe-2.5 ps-3 text-sm font-medium text-gray-700"
            >
              {text}
              <button
                type="button"
                onClick={() => handleRemove(text)}
                className="ps-2 text-gray-500 hover:text-gray-900"
              >
                <PiXBold className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
