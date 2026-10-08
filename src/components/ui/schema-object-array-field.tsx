'use client';

import { ReactNode } from 'react';
import { Control, RegisterOptions, useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FieldType,
  objectArrayDefaults,
  prefixSchemaFields,
  resolveFieldRequirements,
} from '@/utils/schema-converter';

export default function SchemaObjectArrayField({ field, control, rules, disabled, renderField }: {
  field: FieldType;
  control: Control<any>;
  rules?: RegisterOptions;
  disabled?: boolean;
  renderField: (field: FieldType) => ReactNode;
}) {
  const { getValues, getFieldState } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control, name: field.name, rules,
  });
  const error = getFieldState(field.name).error as any;
  const message = error?.root?.message || error?.message;
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-4" dir="rtl">
      <legend className="text-sm font-semibold text-gray-900">
        {field.label || field.name}{field.required ? ' *' : ''}
      </legend>
      {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
      {fields.map((entry, index) => {
        const children = resolveFieldRequirements(
          prefixSchemaFields(field.itemFields || [], `${field.name}.${index}`), getValues()
        );
        return (
          <div key={entry.id} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{field.label || 'مورد'} {index + 1}</span>
              <button type="button" onClick={() => remove(index)} disabled={disabled}
                aria-label={`حذف ${field.label || 'مورد'} ${index + 1}`}
                className="rounded-lg p-2 text-gray-500 hover:bg-red-lighter hover:text-red-dark">
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {children.map((child) => (
                <div key={child.id} id={`dynamic-field-${child.name}`}
                  className={child.type === 'object' || child.type === 'array' || child.component === 'LongTextField' ? 'md:col-span-2' : undefined}>
                  {renderField(child)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {!fields.length && <p className="text-xs text-gray-500">برای وارد کردن اطلاعات، یک مورد اضافه کنید.</p>}
      <Button type="button" variant="outline" className="gap-1.5"
        disabled={disabled || (field.maxItems !== undefined && fields.length >= field.maxItems)}
        onClick={() => append(objectArrayDefaults(field.itemFields || []))}>
        <Plus aria-hidden="true" className="h-4 w-4" />افزودن {field.label || 'مورد'}
      </Button>
      {field.maxItems !== undefined && <p className="text-xs text-gray-500">حداکثر {field.maxItems} مورد</p>}
      {message && <p role="alert" className="text-xs text-red">{message}</p>}
    </fieldset>
  );
}
