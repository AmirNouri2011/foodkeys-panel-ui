import React from 'react';
import { UseFormRegister, FieldErrors, Control, useFieldArray } from 'react-hook-form';
import SchemaLocationField from '@/components/ui/schema-location-field';
import { getLocationKind } from '@/utils/iran-locations';

interface DynamicFormProps {
    schema: any;
    register: UseFormRegister<any>;
    errors: FieldErrors;
    control: Control<any>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, register, errors, control }) => {

    const renderField = (fieldName: string, fieldSchema: any, parentName?: string) => {
        const fullName = parentName ? `${parentName}.${fieldName}` : fieldName;
        const fieldType = fieldSchema.type;
        const locationKind = fieldType === 'string' ? getLocationKind(fieldName, fieldSchema.title) : undefined;
        if (locationKind) {
            return <SchemaLocationField name={fullName} control={control} kind={locationKind}
                label={fieldSchema.title || fieldName}
                rules={{ minLength: fieldSchema.minLength, maxLength: fieldSchema.maxLength }} />;
        }

        if (!fieldType && fieldSchema.properties) {
            return renderObject(fieldName, fieldSchema, parentName);
        }

        switch (fieldType) {
            case 'string':
                return <input {...register(fullName)} />;
            case 'integer':
                return <input type="number" {...register(fullName, { valueAsNumber: true })} />;
            case 'boolean':
                return <input type="checkbox" {...register(fullName)} />;
            case 'array':
                return renderArray(fieldName, fieldSchema, parentName);
            case 'object':
                return renderObject(fieldName, fieldSchema, parentName);
            default:
                return <input {...register(fullName)} />;
        }
    };

    const renderObject = (fieldName: string, fieldSchema: any, parentName?: string) => {
        const props = fieldSchema.properties || {};
        const fullName = parentName ? `${parentName}.${fieldName}` : fieldName;

        return (
            <fieldset style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <legend>{fieldSchema.title || fieldName}</legend>
                {Object.keys(props).map((propName) => (
                    <div key={propName}>
                        <label>
                            {propName}:
                            {renderField(propName, props[propName], fullName)}
                        </label>
                        {renderError(fullName ? `${fullName}.${propName}` : propName)}
                    </div>
                ))}
            </fieldset>
        );
    };

    const renderArray = (fieldName: string, fieldSchema: any, parentName?: string) => {
        const fullName = parentName ? `${parentName}.${fieldName}` : fieldName;
        const { fields, append, remove } = useFieldArray({ control, name: fullName });

        return (
            <fieldset style={{ border: '1px solid #aaa', margin: '10px 0', padding: '10px' }}>
                <legend>{fieldName}</legend>
                {fields.map((item, index) => {
                    const itemName = `${fullName}.${index}`;
                    if (fieldSchema.items && fieldSchema.items.type === 'object') {
                        const props = fieldSchema.items.properties || {};
                        return (
                            <div key={item.id} style={{ border: '1px dotted #888', marginBottom: '10px', padding: '10px' }}>
                                {Object.keys(props).map((propName) => (
                                    <div key={propName}>
                                        <label>
                                            {propName}:
                                            {renderField(propName, props[propName], itemName)}
                                        </label>
                                        {renderError(`${itemName}.${propName}`)}
                                    </div>
                                ))}
                                <button type="button" onClick={() => remove(index)}>Remove</button>
                            </div>
                        );
                    } else {
                        return (
                            <div key={item.id}>
                                <input {...register(`${fullName}.${index}`)} />
                                {renderError(`${fullName}.${index}`)}
                                <button type="button" onClick={() => remove(index)}>Remove</button>
                            </div>
                        );
                    }
                })}
                <button type="button" onClick={() => append(fieldSchema.items.type === 'object' ? {} : '')}>Add</button>
            </fieldset>
        );
    };

    const renderError = (fieldPath: string) => {
        let current: any = errors;
        for (const part of fieldPath.split('.')) {
            if (current && current[part]) {
                current = current[part];
            } else {
                current = null;
                break;
            }
        }

        if (current && current.message) {
            return <p style={{ color: 'red' }}>{current.message}</p>;
        }

        return null;
    };

    return (
        <div>
            {Object.keys(schema.properties).map((fieldName) => (
                <div key={fieldName} style={{ marginBottom: '20px' }}>
                    <label>
                        <strong>{fieldName}{schema.required?.includes(fieldName) ? ' *' : ''}:</strong><br/>
                        {renderField(fieldName, schema.properties[fieldName])}
                    </label>
                    {renderError(fieldName)}
                </div>
            ))}
        </div>
    );
};

export default DynamicForm;
