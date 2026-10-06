import { getLocationKind, isLocationPlaceholder } from '@/utils/iran-locations';

export type FieldType = {
    id: string;
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
    options?: string[];
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    minItems?: number;
    maxItems?: number;
    itemType?: string;
    itemMinLength?: number;
    itemMaxLength?: number;
    itemPattern?: string;
    pattern?: string;
    format?: string;
    column?: number;
    maxFiles?: number;
    accept?: string;
    maxSize?: number;
    fileServiceType?: string;
    fileMode?: 'single' | 'multiple';
    validationMessage?: string;
    component?: string;
    enum?: string[];
    fields?: FieldType[];
    latitudeField?: string;
    longitudeField?: string;
    currency?: string;
    displayCurrency?: string;
};

const USER_PANEL = 'USER_PANEL';

export function hasFormValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.some(hasFormValue);
    if (typeof value === 'object') return Object.values(value).some(hasFormValue);
    return true;
}

// A required child belongs to an optional object only after that object is filled.
export function resolveFieldRequirements(
    fields: FieldType[],
    values: any,
    parentActive = true
): FieldType[] {
    return fields.map((field) => {
        const value = field.name.split('.').reduce((current, key) => current?.[key], values);
        const required = parentActive && Boolean(field.required);
        return {
            ...field,
            required,
            fields: field.fields
                ? resolveFieldRequirements(field.fields, values, required || hasFormValue(value))
                : undefined,
        };
    });
}

export function getClientDisplay(property: any): string[] | null {
    const displays =
        property?.clientDisplay ?? property?.uniforms?.clientDisplay;

    if (!displays || !Array.isArray(displays) || displays.length === 0) {
        return null;
    }

    return displays;
}

export function isPropertyVisibleForUserPanel(property: any): boolean {
    const displays = getClientDisplay(property);
    if (displays === null) {
        return true;
    }

    return displays.includes(USER_PANEL);
}

export function filterSchemaDefinitionForUserPanel(schemaDefinition: any): any {
    if (!schemaDefinition?.properties) {
        return schemaDefinition;
    }

    const filteredProperties: Record<string, any> = {};

    Object.entries(schemaDefinition.properties).forEach(
        ([name, property]: [string, any]) => {
            if (isPropertyVisibleForUserPanel(property)) {
                filteredProperties[name] = property;
            }
        }
    );

    const required = (schemaDefinition.required || []).filter(
        (name: string) => name in filteredProperties
    );

    return {
        ...schemaDefinition,
        properties: filteredProperties,
        required,
    };
}

export function filterFormDataByUserPanelSchema(
    formData: any,
    schemaDefinition: any
): any {
    if (!schemaDefinition?.properties || !formData) {
        return formData ?? {};
    }

    const result: Record<string, any> = {};

    Object.entries(schemaDefinition.properties).forEach(
        ([name, property]: [string, any]) => {
            if (
                isPropertyVisibleForUserPanel(property) &&
                formData[name] !== undefined
            ) {
                result[name] = formData[name];

                const isFileField =
                    property.format === 'file' ||
                    property.items?.format === 'file' ||
                    Boolean(property['x-file']);
                const altFieldName = `${name}Alt`;
                if (isFileField && formData[altFieldName] !== undefined) {
                    result[altFieldName] = formData[altFieldName];
                }
            }
        }
    );

    return result;
}

/**
 * Converts a JSON schema into a standardized array of field objects
 * @param schema The JSON schema object
 * @returns Array of field objects
 */
export function convertSchemaToFields(
    schema: any,
    validations: Record<string, string> = {}
): FieldType[] {
    if (!schema || !schema.properties) {
        return [];
    }

    const fields: FieldType[] = [];
    const requiredFields = schema.required || [];

    Object.entries(schema.properties).forEach(([name, property]: [string, any]) => {
        // Upload fields render their companion descriptions beside each file.
        // Keep the companion in the schema/payload, but do not render it twice.
        if (name.endsWith('Alt')) {
            const upload = schema.properties[name.slice(0, -3)];
            const uploadComponent = upload?.uniforms?.component;
            const rendersInlineDescriptions = upload &&
                (!uploadComponent || uploadComponent === 'FileUpload' || uploadComponent === 'MultiFileUpload') &&
                (upload.format === 'file' || upload.items?.format === 'file' ||
                    upload['x-file'] || uploadComponent === 'FileUpload' || uploadComponent === 'MultiFileUpload');
            if (rendersInlineDescriptions) return;
        }
        const fileConfig = property['x-file'];
        const component = property.uniforms?.component;
        const isFileUpload =
            component === 'FileUpload' ||
            component === 'MultiFileUpload' ||
            property.format === 'file' ||
            property.items?.format === 'file' ||
            Boolean(fileConfig);
        const field: FieldType = {
            id: name,
            name,
            // Some backend schemas describe uploaded images as `format: uri`
            // while rendering them with FileUpload. The component is the source
            // of truth here; otherwise uploaded file IDs are validated as URLs.
            type: isFileUpload
                ? 'file'
                : mapJsonSchemaTypeToFieldType(
                    property.type,
                    property.format,
                    property.pattern
                ),
            label: property.title || name,
            placeholder:
                property.example ||
                property.placeHolder ||
                property.placeholder ||
                '',
            description: property.description || '',
            required: requiredFields.includes(name) || property.required === true || property.uniforms?.required === true ||
                /[（(]\s*(?:الزامی|اجباری)\s*[)）]\s*$/.test(property.title || ''),
            defaultValue: property.default ?? property.defaultValue,
            // LongTextField is always rendered as a complete row, even when an
            // older schema explicitly requests a half-width column.
            column: component === 'LongTextField' ? 12 : property['x-column'] || 12,
            component: isFileUpload ? component || 'FileUpload' : component,
            currency: property.currency ?? property.uniforms?.currency ?? property['x-currency']?.currency,
            displayCurrency: property.displayCurrency ?? property.uniforms?.displayCurrency ?? property['x-currency']?.displayCurrency,
            validationMessage: validations[name],
            enum: property.enum
        };

        if (property.type === 'object') {
            if (property.format === 'map' || property['x-map']?.enabled) {
                field.type = 'map';
                field.latitudeField = property['x-map']?.latitudeField || 'lat';
                field.longitudeField = property['x-map']?.longitudeField || 'lng';
            }
            field.fields = convertSchemaToFields(property, validations).map((child) => ({
                ...child,
                id: `${name}.${child.id}`,
                name: `${name}.${child.name}`,
            }));
        }

        // Handle enum for select/radio options
        if (property.enum) {
            field.options = property.enum;
        }

        // Handle string validations
        if (property.type === 'string') {
            if (property.minLength !== undefined) field.minLength = property.minLength;
            if (property.maxLength !== undefined) field.maxLength = property.maxLength;
            if (property.pattern) field.pattern = property.pattern;
            if (property.format) field.format = property.format;
        }

        // Handle number validations
        if (property.type === 'number' || property.type === 'integer') {
            if (property.minimum !== undefined) field.min = property.minimum;
            if (property.maximum !== undefined) field.max = property.maximum;
        }

        // Handle array validations
        if (property.type === 'array') {
            if (property.minItems !== undefined) field.minItems = property.minItems;
            if (property.maxItems !== undefined) field.maxItems = property.maxItems;

            if (property.items) {
                field.itemType = mapJsonSchemaTypeToFieldType(
                    property.items.type,
                    property.items.format,
                    property.items.pattern
                );
                if (property.items.minLength !== undefined) {
                    field.itemMinLength = property.items.minLength;
                }
                if (property.items.maxLength !== undefined) {
                    field.itemMaxLength = property.items.maxLength;
                }
                if (property.items.pattern) {
                    field.itemPattern = property.items.pattern;
                }

                // For array fields, set options based on items enum if available
                if (property.items.enum) {
                    field.options = property.items.enum;
                }
            }
        }

        // Handle file uploads
        if (field.type === 'file') {
            // The form builder stores multi-file limits as JSON Schema's
            // `maxItems` (for example slider has maxItems: 5), not maxFiles.
            field.maxFiles =
                fileConfig?.maxFiles ??
                property.maxFiles ??
                property.maxItems ??
                property.uniforms?.maxFiles ??
                1;
            field.fileMode =
                fileConfig?.mode ?? ((field.maxFiles ?? 1) > 1 ? 'multiple' : 'single');
            field.accept =
                property.accept ??
                property.contentMediaType ??
                property.uniforms?.accept ??
                '*';
            field.maxSize =
                property.maxSize ??
                property.uniforms?.maxSize ??
                5 * 1024 * 1024; // Default to 5MB
            field.fileServiceType =
                fileConfig
                    ? 'SERVICE_FILE'
                    : property.fileServiceType ??
                      property.uniforms?.fileServiceType ??
                      'SERVICE_FILE';
        }

        fields.push(field);
    });

    return fields;
}

/**
 * Maps JSON schema types to field types
 * @param type The JSON schema type
 * @param format Optional format specifier
 * @returns Field type string
 */
function isMobilePhonePattern(pattern?: string): boolean {
    if (!pattern) return false;

    const normalizedPattern = pattern
        .trim()
        .replace(/\s/g, '')
        .replace(/\\d/g, '[0-9]');

    return normalizedPattern === '^09[0-9]{9}$';
}

function mapJsonSchemaTypeToFieldType(
    type: string,
    format?: string,
    pattern?: string
): string {
    if (type === 'string') {
        if (isMobilePhonePattern(pattern)) return 'tel';
        if (format === 'date') return 'date';
        if (format === 'date-time') return 'datetime-local';
        if (format === 'time') return 'time';
        if (format === 'email') return 'email';
        if (format === 'uri') return 'url';
        if (format === 'tel') return 'tel';
        if (format === 'file') return 'file';
        if (format === 'password') return 'password';
        if (format === 'textarea') return 'textarea';
        return 'text';
    }

    if (type === 'number' || type === 'integer') {
        return 'number';
    }

    if (type === 'boolean') {
        return 'checkbox';
    }

    if (type === 'array') {
        return 'array';
    }

    if (type === 'object') {
        return 'object';
    }

    return 'text';
}

/**
 * Formats form data for API submission based on schema
 * @param formData Form data object
 * @param schema JSON schema object
 * @returns Processed form data
 */
export function formatFormDataForApi(formData: any, schema: any): any {
    if (!formData || !schema || !schema.properties) {
        return formData;
    }

    const result = { ...formData };

    // Process form data based on schema
    Object.entries(schema.properties).forEach(([name, property]: [string, any]) => {
        if (formData[name] === undefined || formData[name] === null) {
            delete result[name];
            return;
        }

        const isFileField =
            property.format === 'file' ||
            property.items?.format === 'file' ||
            property.uniforms?.component === 'FileUpload' ||
            property.uniforms?.component === 'MultiFileUpload' ||
            Boolean(property['x-file']);
        if (getLocationKind(name, property.title) && !isFileField) {
            if (property.type === 'string') {
                const value = typeof formData[name] === 'string' ? formData[name].trim() : formData[name];
                if (isLocationPlaceholder(value)) delete result[name];
                else result[name] = value;
                return;
            }
            if (property.type === 'array' && property.items?.type === 'string' && Array.isArray(formData[name])) {
                result[name] = formData[name]
                    .filter((value: any) => typeof value === 'string' && value.trim() && !isLocationPlaceholder(value))
                    .map((value: string) => value.trim());
                return;
            }
        }
        if (isFileField && formData[name] === '') {
            delete result[name];
            return;
        }

        if (property.type === 'object' && typeof formData[name] === 'object') {
            if (!(schema.required || []).includes(name) && !hasFormValue(formData[name])) {
                delete result[name];
                return;
            }
            if (property.format === 'map' || property['x-map']?.enabled) {
                const latitudeField = property['x-map']?.latitudeField || 'lat';
                const longitudeField = property['x-map']?.longitudeField || 'lng';
                const coordinates = formData[name];
                if ([latitudeField, longitudeField].every((key) =>
                    coordinates[key] !== null && coordinates[key] !== undefined &&
                    coordinates[key] !== '' && Number.isFinite(Number(coordinates[key]))
                )) {
                    result[name] = {
                        [latitudeField]: Number(coordinates[latitudeField]),
                        [longitudeField]: Number(coordinates[longitudeField]),
                    };
                } else {
                    delete result[name];
                }
            } else {
                result[name] = formatFormDataForApi(formData[name], property);
            }
        }

        if (isFileField) {
            const fileId = (file: any) =>
                typeof file === 'string' ? file : file?.id;

            result[name] = Array.isArray(formData[name])
                ? formData[name].map(fileId).filter(Boolean)
                : fileId(formData[name]);
        }

        // Convert date objects to ISO string format
        if (property.type === 'string' && property.format === 'date' && formData[name] instanceof Date) {
            result[name] = formData[name].toISOString().split('T')[0];
        }

        // Convert numbers from string to number
        if ((property.type === 'number' || property.type === 'integer') && typeof formData[name] === 'string') {
            if ((property.currency ?? property.uniforms?.currency ?? property['x-currency']?.currency) && formData[name].trim() === '') {
                delete result[name];
                return;
            }
            result[name] = Number(formData[name]);
        }

        // For arrays with primitive types, ensure they are the correct type
        if (
            !isFileField &&
            property.type === 'array' &&
            Array.isArray(formData[name])
        ) {
            const nonEmptyItems = formData[name].filter((item: any) =>
                typeof item === 'string'
                    ? item.trim().length > 0
                    : item !== null && item !== undefined
            );

            if (property.items && property.items.type === 'number') {
                result[name] = nonEmptyItems.map((item: any) =>
                    typeof item === 'string' ? Number(item) : item
                );
            } else {
                result[name] = nonEmptyItems;
            }
        }

        // Convert boolean strings to actual booleans
        if (property.type === 'boolean' && typeof formData[name] === 'string') {
            result[name] = formData[name] === 'true';
        }
    });

    return result;
}
