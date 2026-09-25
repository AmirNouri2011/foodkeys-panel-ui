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
    pattern?: string;
    format?: string;
    column?: number;
    maxFiles?: number;
    accept?: string;
    maxSize?: number;
    fileServiceType?: string;
    component?: string;
    enum?: string[];
};

const USER_PANEL = 'USER_PANEL';

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
export function convertSchemaToFields(schema: any): FieldType[] {
    if (!schema || !schema.properties) {
        return [];
    }

    const fields: FieldType[] = [];
    const requiredFields = schema.required || [];

    Object.entries(schema.properties).forEach(([name, property]: [string, any]) => {
        const component = property.uniforms?.component;
        const isFileUpload =
            component === 'FileUpload' || component === 'MultiFileUpload';
        const field: FieldType = {
            id: name,
            name,
            // Some backend schemas describe uploaded images as `format: uri`
            // while rendering them with FileUpload. The component is the source
            // of truth here; otherwise uploaded file IDs are validated as URLs.
            type: isFileUpload
                ? 'file'
                : mapJsonSchemaTypeToFieldType(property.type, property.format),
            label: property.title || name,
            placeholder: property.example || '',
            description: property.description || '',
            required: requiredFields.includes(name),
            defaultValue: property.default,
            column: property['x-column'] || 12, // Default to full width
            component,
            enum: property.enum
        };

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

            // For array fields, set options based on items enum if available
            if (property.items && property.items.enum) {
                field.options = property.items.enum;
            }
        }

        // Handle file uploads
        if (field.type === 'file') {
            field.maxFiles = property.maxFiles || 1;
            field.accept = property.accept || '*';
            field.maxSize = property.maxSize || 5 * 1024 * 1024; // Default to 5MB
            field.fileServiceType = property.fileServiceType || 'SERVICE_FILE';
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
function mapJsonSchemaTypeToFieldType(type: string, format?: string): string {
    if (type === 'string') {
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
            property.uniforms?.component === 'FileUpload';
        if (isFileField && formData[name] === '') {
            delete result[name];
            return;
        }

        // Convert date objects to ISO string format
        if (property.type === 'string' && property.format === 'date' && formData[name] instanceof Date) {
            result[name] = formData[name].toISOString().split('T')[0];
        }

        // Convert numbers from string to number
        if ((property.type === 'number' || property.type === 'integer') && typeof formData[name] === 'string') {
            result[name] = Number(formData[name]);
        }

        // For arrays with primitive types, ensure they are the correct type
        if (property.type === 'array' && Array.isArray(formData[name])) {
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
