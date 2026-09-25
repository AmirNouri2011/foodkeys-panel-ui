'use client';
import { API_BASE_URL, STATIC_FILES_URL } from '@/config/api.config';
// //
// // import { useState, useEffect } from 'react';
// // import { useForm, Controller } from 'react-hook-form';
// // import {
// //     Button,
// //     Input,
// //     Textarea,
// //     Checkbox,
// //     Radio,
// //     FieldError,
// //     Text,
// //     Alert,
// //     ActionIcon
// // } from 'rizzui';
// // import { DatePicker } from '@/components/ui/datepicker';
// // import FileUpload from '@/components/ui/file-upload';
// // import { Plus, Minus, CheckCircle, XCircle } from 'lucide-react';
// // import cn from '@/utils/class-names';
// // import { FieldType, convertSchemaToFields, formatFormDataForApi } from '@/utils/schema-converter';
// // import {Select, Title} from '@/components/ui/compatible-components';
// //
// // interface DynamicFormProps {
// //     schema: any;
// //     initialData?: any;
// //     onSubmit: (data: any) => Promise<void>;
// //     loading?: boolean;
// //     submitButtonLabel?: string;
// //     hideSubmit?: boolean;
// // }
// //
// // export default function DynamicForm({
// //                                         schema,
// //                                         initialData = {},
// //                                         onSubmit,
// //                                         loading = false,
// //                                         submitButtonLabel = 'ذخیره',
// //                                         hideSubmit = false
// //                                     }: DynamicFormProps) {
// //     const [fields, setFields] = useState<FieldType[]>([]);
// //     const [formTitle, setFormTitle] = useState('');
// //     const [formDescription, setFormDescription] = useState('');
// //     const [localError, setLocalError] = useState<string | null>(null);
// //     const [showSuccess, setShowSuccess] = useState(false);
// //
// //     const {
// //         control,
// //         handleSubmit,
// //         formState: { errors, isDirty },
// //         reset,
// //         setValue,
// //         watch
// //     } = useForm({
// //         defaultValues: initialData
// //     });
// //
// //     useEffect(() => {
// //         if (schema) {
// //             try {
// //                 // Convert schema to fields
// //                 const fieldsFromSchema = convertSchemaToFields(schema.schemaDefinition);
// //                 setFields(fieldsFromSchema);
// //                 setFormTitle(schema.formTitle || 'فرم سرویس');
// //                 setFormDescription(schema.formDescription || '');
// //             } catch (err) {
// //                 console.error('Error processing schema:', err);
// //                 setLocalError('خطا در پردازش اسکیمای فرم');
// //             }
// //         }
// //     }, [schema]);
// //
// //     useEffect(() => {
// //         if (initialData && Object.keys(initialData).length > 0) {
// //             reset(initialData);
// //         }
// //     }, [initialData, reset]);
// //
// //     const getValidationRules = (field: FieldType) => {
// //         const rules: any = {};
// //
// //         if (field.required) {
// //             rules.required = "این فیلد الزامی است";
// //         }
// //
// //         if (field.type === 'email') {
// //             rules.pattern = {
// //                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
// //                 message: "ایمیل معتبر وارد کنید"
// //             };
// //         }
// //
// //         if (field.minLength) {
// //             rules.minLength = {
// //                 value: field.minLength,
// //                 message: `حداقل ${field.minLength} کاراکتر وارد کنید`
// //             };
// //         }
// //
// //         if (field.maxLength) {
// //             rules.maxLength = {
// //                 value: field.maxLength,
// //                 message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
// //             };
// //         }
// //
// //         if (field.min !== undefined && (field.type === 'number' || field.type === 'range')) {
// //             rules.min = {
// //                 value: field.min,
// //                 message: `حداقل مقدار ${field.min} است`
// //             };
// //         }
// //
// //         if (field.max !== undefined && (field.type === 'number' || field.type === 'range')) {
// //             rules.max = {
// //                 value: field.max,
// //                 message: `حداکثر مقدار ${field.max} است`
// //             };
// //         }
// //
// //         if (field.pattern) {
// //             rules.pattern = {
// //                 value: new RegExp(field.pattern),
// //                 message: "فرمت وارد شده صحیح نیست"
// //             };
// //         }
// //
// //         if (field.type === 'array' && field.minItems) {
// //             rules.validate = {
// //                 minItems: (value: any[]) => {
// //                     if (!value || !Array.isArray(value)) return true;
// //                     return value.length >= (field.minItems || 0) || `حداقل ${field.minItems} مورد الزامی است`;
// //                 }
// //             };
// //         }
// //
// //         return rules;
// //     };
// //
// //     const renderField = (field: FieldType) => {
// //         const validationRules = getValidationRules(field);
// //
// //         switch (field.type) {
// //             case 'text':
// //             case 'email':
// //             case 'url':
// //             case 'tel':
// //             case 'password':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <Input
// //                                 type={field.type}
// //                                 label={field.label}
// //                                 placeholder={field.placeholder}
// //                                 value={value || ''}
// //                                 onChange={onChange}
// //                                 onBlur={onBlur}
// //                                 error={errors[field.name]?.message as string}
// //                                 disabled={loading}
// //                                 helperText={field.description}
// //                             />
// //                         )}
// //                     />
// //                 );
// //
// //             case 'textarea':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <Textarea
// //                                 label={field.label}
// //                                 placeholder={field.placeholder}
// //                                 value={value || ''}
// //                                 onChange={onChange}
// //                                 onBlur={onBlur}
// //                                 error={errors[field.name]?.message as string}
// //                                 disabled={loading}
// //                                 helperText={field.description}
// //                             />
// //                         )}
// //                     />
// //                 );
// //
// //             case 'number':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <Input
// //                                 type="number"
// //                                 label={field.label}
// //                                 placeholder={field.placeholder}
// //                                 value={value === undefined || value === null ? '' : value}
// //                                 onChange={(e) => {
// //                                     const val = e.target.value === '' ? '' : Number(e.target.value);
// //                                     onChange(val);
// //                                 }}
// //                                 onBlur={onBlur}
// //                                 error={errors[field.name]?.message as string}
// //                                 disabled={loading}
// //                                 helperText={field.description}
// //                                 min={field.min}
// //                                 max={field.max}
// //                             />
// //                         )}
// //                     />
// //                 );
// //
// //             case 'checkbox':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <div className="space-y-1">
// //                                 <Checkbox
// //                                     label={field.label}
// //                                     checked={!!value}
// //                                     onChange={(e) => onChange(e.target.checked)}
// //                                     onBlur={onBlur}
// //                                     disabled={loading}
// //                                     error={errors[field.name]?.message as string}
// //                                     helperText={field.description}
// //                                 />
// //                             </div>
// //                         )}
// //                     />
// //                 );
// //
// //             case 'radio':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <div className="space-y-3">
// //                                 <Text>{field.label}</Text>
// //                                 <div className="flex flex-col gap-2">
// //                                     {field.options?.map((option) => (
// //                                         <Radio
// //                                             key={option}
// //                                             label={option}
// //                                             name={field.name}
// //                                             value={option}
// //                                             checked={value === option}
// //                                             onChange={() => onChange(option)}
// //                                             onBlur={onBlur}
// //                                             disabled={loading}
// //                                         />
// //                                     ))}
// //                                 </div>
// //                                 {errors[field.name] && (
// //                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
// //                                 )}
// //                                 {field.description && !errors[field.name] && (
// //                                     <Text className="text-xs text-gray-500">{field.description}</Text>
// //                                 )}
// //                             </div>
// //                         )}
// //                     />
// //                 );
// //
// //             case 'select':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <Select
// //                                 label={field.label}
// //                                 placeholder={field.placeholder || 'انتخاب کنید'}
// //                                 value={value || ''}
// //                                 onChange={onChange}
// //                                 onBlur={onBlur}
// //                                 error={errors[field.name]?.message as string}
// //                                 disabled={loading}
// //                                 options={field.options?.map(option => ({
// //                                     label: option,
// //                                     value: option
// //                                 })) || []}
// //                                 helperText={field.description}
// //                             />
// //                         )}
// //                     />
// //                 );
// //
// //             case 'date':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <div className="space-y-1">
// //                                 <Text className="text-sm font-medium">{field.label}</Text>
// //                                 <DatePicker
// //                                     placeholder={field.placeholder || 'انتخاب تاریخ'}
// //                                     selected={value ? new Date(value) : null}
// //                                     onChange={onChange}
// //                                     onBlur={onBlur}
// //                                     disabled={loading}
// //                                 />
// //                                 {errors[field.name] && (
// //                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
// //                                 )}
// //                                 {field.description && !errors[field.name] && (
// //                                     <Text className="text-xs text-gray-500">{field.description}</Text>
// //                                 )}
// //                             </div>
// //                         )}
// //                     />
// //                 );
// //
// //             case 'array':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         defaultValue={[]}
// //                         render={({ field: { value = [], onChange, onBlur } }) => (
// //                             <div className="space-y-3">
// //                                 <div className="flex justify-between items-center">
// //                                     <Text className="font-medium">{field.label}</Text>
// //                                     <Button
// //                                         type="button"
// //                                         variant="outline"
// //                                         onClick={() => onChange([...value, ''])}
// //                                         disabled={loading || (field.maxItems !== undefined && value.length >= field.maxItems)}
// //                                         className="h-8 px-2"
// //                                     >
// //                                         <Plus className="h-4 w-4 mr-1" />
// //                                         افزودن
// //                                     </Button>
// //                                 </div>
// //
// //                                 <div className="space-y-2">
// //                                     {Array.isArray(value) && value.map((item, index) => (
// //                                         <div key={index} className="flex gap-2 items-start">
// //                                             <Input
// //                                                 value={item || ''}
// //                                                 onChange={(e) => {
// //                                                     const newValue = [...value];
// //                                                     newValue[index] = e.target.value;
// //                                                     onChange(newValue);
// //                                                 }}
// //                                                 onBlur={onBlur}
// //                                                 disabled={loading}
// //                                                 placeholder={`${field.placeholder || ''} ${index + 1}`}
// //                                                 className="flex-1"
// //                                             />
// //                                             <ActionIcon
// //                                                 variant="outline"
// //                                                 onClick={() => {
// //                                                     const newValue = value.filter((_: any, i: number) => i !== index);
// //                                                     onChange(newValue);
// //                                                 }}
// //                                                 disabled={loading || value.length <= (field.minItems || 0)}
// //                                                 className="mt-1"
// //                                             >
// //                                                 <Minus className="h-4 w-4" />
// //                                             </ActionIcon>
// //                                         </div>
// //                                     ))}
// //                                 </div>
// //
// //                                 {errors[field.name] && (
// //                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
// //                                 )}
// //
// //                                 {field.description && !errors[field.name] && (
// //                                     <Text className="text-xs text-gray-500">{field.description}</Text>
// //                                 )}
// //                             </div>
// //                         )}
// //                     />
// //                 );
// //
// //             case 'file':
// //                 return (
// //                     <Controller
// //                         name={field.name}
// //                         control={control}
// //                         rules={validationRules}
// //                         render={({ field: { value, onChange, onBlur } }) => (
// //                             <FileUpload
// //                                 label={field.label}
// //                                 value={value}
// //                                 onChange={onChange}
// //                                 onBlur={onBlur}
// //                                 error={errors[field.name]?.message as string}
// //                                 helperText={field.description}
// //                                 multiple={field.maxFiles ? field.maxFiles > 1 : false}
// //                                 accept={field.accept}
// //                                 maxSize={field.maxSize}
// //                                 maxFiles={field.maxFiles}
// //                                 fileServiceType={field.fileServiceType}
// //                                 disabled={loading}
// //                             />
// //                         )}
// //                     />
// //                 );
// //
// //             default:
// //                 return null;
// //         }
// //     };
// //
// //     const handleFormSubmit = async (data: any) => {
// //         try {
// //             setLocalError(null);
// //
// //             // Format data according to schema
// //             const formattedData = schema.schemaDefinition
// //                 ? formatFormDataForApi(data, schema.schemaDefinition)
// //                 : data;
// //
// //             await onSubmit(formattedData);
// //
// //             // Show success message
// //             setShowSuccess(true);
// //             setTimeout(() => {
// //                 setShowSuccess(false);
// //             }, 3000);
// //
// //         } catch (err) {
// //             console.error('Error submitting form:', err);
// //             setLocalError('خطا در ارسال فرم. لطفا دوباره تلاش کنید.');
// //         }
// //     };
// //
// //     if (!schema) {
// //         return (
// //             <div className="p-4">
// //                 <Alert variant="danger">اسکیمای فرم موجود نیست</Alert>
// //             </div>
// //         );
// //     }
// //
// //     return (
// //         <div className="w-full max-w-4xl mx-auto">
// //             {localError && (
// //                 <Alert variant="danger" className="mb-4">
// //                     {localError}
// //                 </Alert>
// //             )}
// //
// //             {showSuccess && (
// //                 <Alert variant="success" className="mb-4 flex items-center">
// //                     <CheckCircle className="w-5 h-5 mr-2" />
// //                     فرم با موفقیت ذخیره شد
// //                 </Alert>
// //             )}
// //
// //             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
// //                 {formTitle && (
// //                     <Title className="text-xl font-bold mb-2">{formTitle}</Title>
// //                 )}
// //
// //                 {formDescription && (
// //                     <Text className="text-gray-500 mb-6">{formDescription}</Text>
// //                 )}
// //
// //                 <form onSubmit={handleSubmit(handleFormSubmit)}>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                         {fields.map((field) => (
// //                             <div
// //                                 key={field.id}
// //                                 className={cn(
// //                                     field.column === 6 ? 'col-span-1' : 'col-span-1 md:col-span-2'
// //                                 )}
// //                             >
// //                                 {renderField(field)}
// //                             </div>
// //                         ))}
// //                     </div>
// //
// //                     {!hideSubmit && (
// //                         <div className="mt-8 flex justify-end">
// //                             <Button
// //                                 type="submit"
// //                                 disabled={loading || !isDirty}
// //                                 isLoading={loading}
// //                             >
// //                                 {loading ? 'در حال ارسال...' : submitButtonLabel}
// //                             </Button>
// //                         </div>
// //                     )}
// //                 </form>
// //             </div>
// //         </div>
// //     );
// // }
// 'use client';
//
// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import {
//     Button,
//     Input,
//     Textarea,
//     Checkbox,
//     Radio,
//     FieldError,
//     Text,
//     ActionIcon
// } from 'rizzui';
// import { DatePicker } from '@/components/ui/datepicker';
// import FileUpload from '@/components/ui/file-upload';
// import { Plus, Minus, CheckCircle, XCircle, Image, FileText, X } from 'lucide-react';
// import cn from '@/utils/class-names';
// import { FieldType, convertSchemaToFields, formatFormDataForApi } from '@/utils/schema-converter';
// import { Select, Title } from '@/components/ui/compatible-components';
//
// // Custom alert component to avoid the rizzui Alert issue
// const CustomAlert = ({ children, variant = "default", className = "" }) => {
//     const baseStyles = "p-4 rounded-md mb-4 text-sm";
//     const variantStyles = {
//         default: "bg-gray-100 text-gray-800",
//         info: "bg-blue-50 text-blue-800",
//         success: "bg-green-50 text-green-800",
//         warning: "bg-yellow-50 text-yellow-800",
//         danger: "bg-red-50 text-red-800"
//     };
//
//     return (
//         <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
//             {children}
//         </div>
//     );
// };
//
// // File preview component
// const FilePreview = ({ file, onRemove }) => {
//     const baseUrl = API_BASE_URL || '';
//     const fileUrl = file && file.path ? `${baseUrl}${file.path}` : '';
//     const fileName = file ? (file.name || file.originalName || 'File') : '';
//
//     const isImage = fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i);
//
//     return (
//         <div className="relative mt-2 rounded-md border border-gray-200 p-2">
//             <div className="flex items-center">
//                 {isImage ? (
//                     <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
//                         <img
//                             src={fileUrl}
//                             alt={fileName}
//                             className="h-full w-full object-cover"
//                             onError={(e) => {
//                                 e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
//                             }}
//                         />
//                     </div>
//                 ) : (
//                     <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-50">
//                         <FileText className="h-6 w-6 text-gray-400" />
//                     </div>
//                 )}
//
//                 <div className="ml-4 flex-1 overflow-hidden">
//                     <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
//                     <p className="text-xs text-gray-500">
//                         {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
//                     </p>
//                     {isImage && (
//                         <a
//                             href={fileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="mt-1 inline-block text-xs text-blue-600 hover:underline"
//                         >
//                             مشاهده تصویر
//                         </a>
//                     )}
//                 </div>
//
//                 {onRemove && (
//                     <button
//                         type="button"
//                         onClick={onRemove}
//                         className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
//                     >
//                         <X className="h-4 w-4 text-gray-600" />
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// interface DynamicFormProps {
//     schema: any;
//     initialData?: any;
//     onSubmit: (data: any) => Promise<void>;
//     onChange?: (data: any) => void; // Added onChange prop for live updates
//     loading?: boolean;
//     submitButtonLabel?: string;
//     hideSubmit?: boolean;
// }
//
// export default function DynamicForm({
//                                         schema,
//                                         initialData = {},
//                                         onSubmit,
//                                         onChange, // Receive onChange prop
//                                         loading = false,
//                                         submitButtonLabel = 'ذخیره',
//                                         hideSubmit = false
//                                     }: DynamicFormProps) {
//     const [fields, setFields] = useState<FieldType[]>([]);
//     const [formTitle, setFormTitle] = useState('');
//     const [formDescription, setFormDescription] = useState('');
//     const [localError, setLocalError] = useState<string | null>(null);
//     const [showSuccess, setShowSuccess] = useState(false);
//
//     // Use a ref to prevent infinite updates
//     const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const isFirstRenderRef = useRef(true);
//     const lastFormDataRef = useRef({});
//
//     const {
//         control,
//         handleSubmit,
//         formState: { errors, isDirty },
//         reset,
//         watch,
//         getValues
//     } = useForm({
//         defaultValues: initialData
//     });
//
//     // Watch all form values for changes, but debounce updates
//     const formValues = watch();
//
//     // Notify parent component of changes with debounce to prevent infinite loops
//     useEffect(() => {
//         // Skip the first render to avoid an unnecessary update
//         if (isFirstRenderRef.current) {
//             isFirstRenderRef.current = false;
//             return;
//         }
//
//         // If no change in data, don't trigger an update
//         if (JSON.stringify(formValues) === JSON.stringify(lastFormDataRef.current)) {
//             return;
//         }
//
//         // Store current form values
//         lastFormDataRef.current = {...formValues};
//
//         // Clear existing timeout
//         if (updateTimeoutRef.current) {
//             clearTimeout(updateTimeoutRef.current);
//         }
//
//         // Set new timeout to update parent
//         updateTimeoutRef.current = setTimeout(() => {
//             if (onChange && Object.keys(formValues).length > 0) {
//                 onChange(formValues);
//             }
//         }, 300); // 300ms debounce
//
//         return () => {
//             // Cleanup timeout on unmount
//             if (updateTimeoutRef.current) {
//                 clearTimeout(updateTimeoutRef.current);
//             }
//         };
//     }, [formValues, onChange]);
//
//     useEffect(() => {
//         if (schema) {
//             try {
//                 // Convert schema to fields
//                 const fieldsFromSchema = convertSchemaToFields(schema.schemaDefinition);
//                 setFields(fieldsFromSchema);
//                 setFormTitle(schema.formTitle || 'فرم سرویس');
//                 setFormDescription(schema.formDescription || '');
//             } catch (err) {
//                 console.error('Error processing schema:', err);
//                 setLocalError('خطا در پردازش اسکیمای فرم');
//             }
//         }
//     }, [schema]);
//
//     useEffect(() => {
//         if (initialData && Object.keys(initialData).length > 0) {
//             reset(initialData);
//             lastFormDataRef.current = initialData;
//         }
//     }, [initialData, reset]);
//
//     const getValidationRules = (field: FieldType) => {
//         const rules: any = {};
//
//         if (field.required) {
//             rules.required = "این فیلد الزامی است";
//         }
//
//         if (field.type === 'email') {
//             rules.pattern = {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: "ایمیل معتبر وارد کنید"
//             };
//         }
//
//         if (field.minLength) {
//             rules.minLength = {
//                 value: field.minLength,
//                 message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//             };
//         }
//
//         if (field.maxLength) {
//             rules.maxLength = {
//                 value: field.maxLength,
//                 message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//             };
//         }
//
//         if (field.min !== undefined && (field.type === 'number' || field.type === 'range')) {
//             rules.min = {
//                 value: field.min,
//                 message: `حداقل مقدار ${field.min} است`
//             };
//         }
//
//         if (field.max !== undefined && (field.type === 'number' || field.type === 'range')) {
//             rules.max = {
//                 value: field.max,
//                 message: `حداکثر مقدار ${field.max} است`
//             };
//         }
//
//         if (field.pattern) {
//             rules.pattern = {
//                 value: new RegExp(field.pattern),
//                 message: "فرمت وارد شده صحیح نیست"
//             };
//         }
//
//         if (field.type === 'array' && field.minItems) {
//             rules.validate = {
//                 minItems: (value: any[]) => {
//                     if (!value || !Array.isArray(value)) return true;
//                     return value.length >= (field.minItems || 0) || `حداقل ${field.minItems} مورد الزامی است`;
//                 }
//             };
//         }
//
//         return rules;
//     };
//
//     const renderField = (field: FieldType) => {
//         const validationRules = getValidationRules(field);
//         if (field.component) {
//             switch (field.component) {
//                 case 'FileUpload':
//                     return (
//                         <Controller
//                             name={field.name}
//                             control={control}
//                             rules={validationRules}
//                             render={({ field: { value, onChange, onBlur } }) => (
//                                 <div className="space-y-2">
//                                     <FileUpload
//                                         label={field.label}
//                                         value={value}
//                                         onChange={(uploadedValue) => {
//                                             // Process file upload response
//                                             onChange(uploadedValue);
//                                         }}
//                                         onBlur={onBlur}
//                                         error={errors[field.name]?.message as string}
//                                         helperText={field.description}
//                                         multiple={field.maxFiles ? field.maxFiles > 1 : false}
//                                         accept={field.accept}
//                                         maxSize={field.maxSize}
//                                         maxFiles={field.maxFiles}
//                                         fileServiceType={field.fileServiceType}
//                                         disabled={loading}
//                                     />
//
//                                     {/* Display file preview for single file */}
//                                     {value && !Array.isArray(value) && (
//                                         <FilePreview
//                                             file={value}
//                                             onRemove={() => onChange(null)}
//                                         />
//                                     )}
//
//                                     {/* Display file previews for multiple files */}
//                                     {Array.isArray(value) && value.length > 0 && (
//                                         <div className="space-y-2">
//                                             {value.map((file, index) => (
//                                                 <FilePreview
//                                                     key={index}
//                                                     file={file}
//                                                     onRemove={() => {
//                                                         const newFiles = [...value];
//                                                         newFiles.splice(index, 1);
//                                                         onChange(newFiles);
//                                                     }}
//                                                 />
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         />
//                     )
//                 case 'LongTextField':
//                     return (
//                         <Controller
//                             name={field.name}
//                             control={control}
//                             rules={validationRules}
//                             render={({ field: { value, onChange, onBlur } }) => (
//                                 <Textarea
//                                     label={field.label}
//                                     placeholder={field.placeholder}
//                                     value={value || ''}
//                                     onChange={onChange}
//                                     onBlur={onBlur}
//                                     error={errors[field.name]?.message as string}
//                                     disabled={loading}
//                                     helperText={field.description}
//                                 />
//                             )}
//                         />
//                     )
//             }
//         }
//         if (field.enum) {
//             return (
//                 <Controller
//                     name={field.name}
//                     control={control}
//                     rules={validationRules}
//                     render={({ field: { value, onChange, onBlur } }) => (
//                         <Select
//                             label={field.label}
//                             placeholder={field.placeholder || 'انتخاب کنید'}
//                             value={value || ''}
//                             onChange={(e) => {
//                                 onChange(e.target.value);
//                             }}
//                             onBlur={onBlur}
//                             error={errors[field.name]?.message as string}
//                             disabled={loading}
//                             options={field.enum?.map(option => ({
//                                 label: option,
//                                 value: option
//                             })) || []}
//                             helperText={field.description}
//                         />
//                     )}
//                 />
//             )
//         }
//         switch (field.type) {
//             case 'text':
//             case 'email':
//             case 'url':
//             case 'tel':
//             case 'password':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <Input
//                                 type={field.type}
//                                 label={field.label}
//                                 placeholder={field.placeholder}
//                                 value={value || ''}
//                                 onChange={onChange}
//                                 onBlur={onBlur}
//                                 error={errors[field.name]?.message as string}
//                                 disabled={loading}
//                                 helperText={field.description}
//                             />
//                         )}
//                     />
//                 );
//
//             case 'textarea':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <Textarea
//                                 label={field.label}
//                                 placeholder={field.placeholder}
//                                 value={value || ''}
//                                 onChange={onChange}
//                                 onBlur={onBlur}
//                                 error={errors[field.name]?.message as string}
//                                 disabled={loading}
//                                 helperText={field.description}
//                             />
//                         )}
//                     />
//                 );
//
//             case 'number':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <Input
//                                 type="number"
//                                 label={field.label}
//                                 placeholder={field.placeholder}
//                                 value={value === undefined || value === null ? '' : value}
//                                 onChange={(e) => {
//                                     const val = e.target.value === '' ? '' : Number(e.target.value);
//                                     onChange(val);
//                                 }}
//                                 onBlur={onBlur}
//                                 error={errors[field.name]?.message as string}
//                                 disabled={loading}
//                                 helperText={field.description}
//                                 min={field.min}
//                                 max={field.max}
//                             />
//                         )}
//                     />
//                 );
//
//             case 'checkbox':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <div className="space-y-1">
//                                 <Checkbox
//                                     label={field.label}
//                                     checked={!!value}
//                                     onChange={(e) => onChange(e.target.checked)}
//                                     onBlur={onBlur}
//                                     disabled={loading}
//                                     error={errors[field.name]?.message as string}
//                                     helperText={field.description}
//                                 />
//                             </div>
//                         )}
//                     />
//                 );
//
//             case 'radio':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <div className="space-y-3">
//                                 <Text>{field.label}</Text>
//                                 <div className="flex flex-col gap-2">
//                                     {field.options?.map((option) => (
//                                         <Radio
//                                             key={option}
//                                             label={option}
//                                             name={field.name}
//                                             value={option}
//                                             checked={value === option}
//                                             onChange={() => onChange(option)}
//                                             onBlur={onBlur}
//                                             disabled={loading}
//                                         />
//                                     ))}
//                                 </div>
//                                 {errors[field.name] && (
//                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
//                                 )}
//                                 {field.description && !errors[field.name] && (
//                                     <Text className="text-xs text-gray-500">{field.description}</Text>
//                                 )}
//                             </div>
//                         )}
//                     />
//                 );
//
//             case 'select':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <Select
//                                 label={field.label}
//                                 placeholder={field.placeholder || 'انتخاب کنید'}
//                                 value={value || ''}
//                                 onChange={(e) => {
//                                     onChange(e.target.value);
//                                 }}
//                                 onBlur={onBlur}
//                                 error={errors[field.name]?.message as string}
//                                 disabled={loading}
//                                 options={field.options?.map(option => ({
//                                     label: option,
//                                     value: option
//                                 })) || []}
//                                 helperText={field.description}
//                             />
//                         )}
//                     />
//                 );
//
//             case 'date':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <div className="space-y-1">
//                                 <Text className="text-sm font-medium">{field.label}</Text>
//                                 <DatePicker
//                                     placeholder={field.placeholder || 'انتخاب تاریخ'}
//                                     selected={value ? new Date(value) : null}
//                                     onChange={onChange}
//                                     onBlur={onBlur}
//                                     disabled={loading}
//                                 />
//                                 {errors[field.name] && (
//                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
//                                 )}
//                                 {field.description && !errors[field.name] && (
//                                     <Text className="text-xs text-gray-500">{field.description}</Text>
//                                 )}
//                             </div>
//                         )}
//                     />
//                 );
//
//             case 'array':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         defaultValue={[]}
//                         render={({ field: { value = [], onChange, onBlur } }) => (
//                             <div className="space-y-3">
//                                 <div className="flex justify-between items-center">
//                                     <Text className="font-medium">{field.label}</Text>
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         onClick={() => onChange([...value, ''])}
//                                         disabled={loading || (field.maxItems !== undefined && value.length >= field.maxItems)}
//                                         className="h-8 px-2"
//                                     >
//                                         <Plus className="h-4 w-4 mr-1" />
//                                         افزودن
//                                     </Button>
//                                 </div>
//
//                                 <div className="space-y-2">
//                                     {Array.isArray(value) && value.map((item, index) => (
//                                         <div key={index} className="flex gap-2 items-start">
//                                             <Input
//                                                 value={item || ''}
//                                                 onChange={(e) => {
//                                                     const newValue = [...value];
//                                                     newValue[index] = e.target.value;
//                                                     onChange(newValue);
//                                                 }}
//                                                 onBlur={onBlur}
//                                                 disabled={loading}
//                                                 placeholder={`${field.placeholder || ''} ${index + 1}`}
//                                                 className="flex-1"
//                                             />
//                                             <ActionIcon
//                                                 variant="outline"
//                                                 onClick={() => {
//                                                     const newValue = value.filter((_: any, i: number) => i !== index);
//                                                     onChange(newValue);
//                                                 }}
//                                                 disabled={loading || value.length <= (field.minItems || 0)}
//                                                 className="mt-1"
//                                             >
//                                                 <Minus className="h-4 w-4" />
//                                             </ActionIcon>
//                                         </div>
//                                     ))}
//                                 </div>
//
//                                 {errors[field.name] && (
//                                     <FieldError>{errors[field.name]?.message as string}</FieldError>
//                                 )}
//
//                                 {field.description && !errors[field.name] && (
//                                     <Text className="text-xs text-gray-500">{field.description}</Text>
//                                 )}
//                             </div>
//                         )}
//                     />
//                 );
//
//             case 'file':
//                 return (
//                     <Controller
//                         name={field.name}
//                         control={control}
//                         rules={validationRules}
//                         render={({ field: { value, onChange, onBlur } }) => (
//                             <div className="space-y-2">
//                                 <FileUpload
//                                     label={field.label}
//                                     value={value}
//                                     onChange={(uploadedValue) => {
//                                         // Process file upload response
//                                         onChange(uploadedValue);
//                                     }}
//                                     onBlur={onBlur}
//                                     error={errors[field.name]?.message as string}
//                                     helperText={field.description}
//                                     multiple={field.maxFiles ? field.maxFiles > 1 : false}
//                                     accept={field.accept}
//                                     maxSize={field.maxSize}
//                                     maxFiles={field.maxFiles}
//                                     fileServiceType={field.fileServiceType}
//                                     disabled={loading}
//                                 />
//
//                                 {/* Display file preview for single file */}
//                                 {value && !Array.isArray(value) && (
//                                     <FilePreview
//                                         file={value}
//                                         onRemove={() => onChange(null)}
//                                     />
//                                 )}
//
//                                 {/* Display file previews for multiple files */}
//                                 {Array.isArray(value) && value.length > 0 && (
//                                     <div className="space-y-2">
//                                         {value.map((file, index) => (
//                                             <FilePreview
//                                                 key={index}
//                                                 file={file}
//                                                 onRemove={() => {
//                                                     const newFiles = [...value];
//                                                     newFiles.splice(index, 1);
//                                                     onChange(newFiles);
//                                                 }}
//                                             />
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     />
//                 );
//
//             default:
//                 return null;
//         }
//     };
//
//     const handleFormSubmit = async (data: any) => {
//         try {
//             setLocalError(null);
//
//             // Format data according to schema
//             const formattedData = schema.schemaDefinition
//                 ? formatFormDataForApi(data, schema.schemaDefinition)
//                 : data;
//
//             await onSubmit(formattedData);
//
//             // Show success message
//             setShowSuccess(true);
//             setTimeout(() => {
//                 setShowSuccess(false);
//             }, 3000);
//
//         } catch (err) {
//             console.error('Error submitting form:', err);
//             setLocalError('خطا در ارسال فرم. لطفا دوباره تلاش کنید.');
//         }
//     };
//
//     if (!schema) {
//         return (
//             <div className="p-4">
//                 <CustomAlert variant="danger">اسکیمای فرم موجود نیست</CustomAlert>
//             </div>
//         );
//     }
//
//     return (
//         <div className="w-full max-w-4xl mx-auto">
//             {localError && (
//                 <CustomAlert variant="danger" className="mb-4">
//                     {localError}
//                 </CustomAlert>
//             )}
//
//             {showSuccess && (
//                 <CustomAlert variant="success" className="mb-4 flex items-center">
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                     فرم با موفقیت ذخیره شد
//                 </CustomAlert>
//             )}
//
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
//                 {formTitle && (
//                     <Title className="text-xl font-bold mb-2">{formTitle}</Title>
//                 )}
//
//                 {formDescription && (
//                     <Text className="text-gray-500 mb-6">{formDescription}</Text>
//                 )}
//
//                 <form onSubmit={handleSubmit(handleFormSubmit)}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {fields.map((field) => (
//                             <div
//                                 key={field.id}
//                                 className={cn(
//                                     field.column === 6 ? 'col-span-1' : 'col-span-1 md:col-span-2'
//                                 )}
//                             >
//                                 {renderField(field)}
//                             </div>
//                         ))}
//                     </div>
//
//                     {!hideSubmit && (
//                         <div className="mt-8 flex justify-end">
//                             <Button
//                                 type="submit"
//                                 disabled={loading || !isDirty}
//                                 isLoading={loading}
//                             >
//                                 {loading ? 'در حال ارسال...' : submitButtonLabel}
//                             </Button>
//                         </div>
//                     )}
//                 </form>
//             </div>
//         </div>
//     );
// }

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Radio,
  FieldError,
  Text,
  ActionIcon,
} from 'rizzui';
import { DatePicker } from '@/components/ui/datepicker';
import FileUpload from '@/components/ui/file-upload';
import LogoUpload from '@/components/ui/logo-upload';
import { Plus, CheckCircle, XCircle, Image, FileText, X } from 'lucide-react';
import cn from '@/utils/class-names';
import {
  FieldType,
  convertSchemaToFields,
  formatFormDataForApi,
  filterSchemaDefinitionForUserPanel,
  filterFormDataByUserPanelSchema,
} from '@/utils/schema-converter';
import { Select, Title } from '@/components/ui/compatible-components';
import {
  getRhfEmailRules,
  getRhfMobilePhoneRules,
  getRhfWebsiteRules,
  validationMessages,
} from '@/utils/form-validators';

export type DynamicFormValidateRef = {
  validate: () => Promise<boolean>;
  getFormattedData: () => any;
  validateWithStatus: () => Promise<DynamicFormValidationResult>;
  focusField: (fieldName: string) => void;
};

export type DynamicFormValidationItem = {
  id: string;
  label: string;
  isValid: boolean;
  message: string;
};

export type DynamicFormValidationResult = {
  isValid: boolean;
  items: DynamicFormValidationItem[];
};

// Custom alert component to avoid the rizzui Alert issue
const CustomAlert = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = 'p-4 rounded-md mb-4 text-sm';
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    danger: 'bg-red-50 text-red-800',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

// File preview component with proper image handling
const FilePreview = ({ file, onRemove }) => {
  const getFileUrl = (file) => {
    const baseUrl = STATIC_FILES_URL || '';

    // If file has filePath property, use it
    if (file && file.filePath) {
      return `${baseUrl}${file.filePath}`;
    }

    // If file is a string (probably a filePath), use it directly
    if (typeof file === 'string') {
      return `${baseUrl}${file}`;
    }

    // If it's a File/Blob object (newly uploaded), create object URL
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }

    // Fallback to empty string
    return '';
  };

  const getFileName = (file) => {
    if (file && file.originalFileName) return file.originalFileName;
    if (file && file.fileName) return file.fileName;
    if (file && file.name) return file.name;
    if (typeof file === 'string') {
      // Extract filename from path
      const parts = file.split('/');
      return parts[parts.length - 1] || 'File';
    }
    return 'File';
  };

  const getFileSize = (file) => {
    if (file && file.fileSize) return file.fileSize;
    if (file && file.size) return file.size;
    return null;
  };

  const fileUrl = getFileUrl(file);
  const fileName = getFileName(file);
  const fileSize = getFileSize(file);

  // Check if file is an image based on filename extension
  const isImage = fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div className="relative mt-2 rounded-md border border-gray-200 p-2">
      <div className="flex items-center">
        {isImage && fileUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
            <img
              src={fileUrl}
              alt={fileName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to file icon if image fails to load
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                                        <div class="flex h-16 w-16 items-center justify-center rounded-md bg-gray-50">
                                            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                    `;
                }
              }}
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-50">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
        )}

        <div className="ml-4 ms-4 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-gray-900">
            {fileName}
          </p>
          {fileSize && (
            <p className="text-xs text-gray-500">
              {(fileSize / 1024).toFixed(2)} KB
            </p>
          )}
          {isImage && fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 mt-1 inline-block text-xs hover:underline"
            >
              مشاهده تصویر
            </a>
          )}
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

interface DynamicFormProps {
  schema: any;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onChange?: (data: any) => void; // Added onChange prop for live updates
  loading?: boolean;
  submitButtonLabel?: string;
  hideSubmit?: boolean;
  clientPanel?: boolean;
  hideFormHeader?: boolean;
  className?: string;
  surface?: 'card' | 'plain';
  validateRef?: React.MutableRefObject<DynamicFormValidateRef | null>;
}

export default function DynamicForm({
  schema,
  initialData = {},
  onSubmit,
  onChange, // Receive onChange prop
  loading = false,
  submitButtonLabel = 'ذخیره',
  hideSubmit = false,
  clientPanel = false,
  hideFormHeader = false,
  className,
  surface = 'card',
  validateRef,
}: DynamicFormProps) {
  const [fields, setFields] = useState<FieldType[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use a ref to prevent infinite updates
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRenderRef = useRef(true);
  const lastFormDataRef = useRef({});

  // Filtering returns new objects. Memoizing them is important because they are
  // effect dependencies below; recreating them on every render caused a
  // setFields/reset render loop that could starve Next.js client navigation.
  const effectiveSchemaDefinition = useMemo(
    () =>
      schema?.schemaDefinition
        ? clientPanel
          ? filterSchemaDefinitionForUserPanel(schema.schemaDefinition)
          : schema.schemaDefinition
        : null,
    [clientPanel, schema?.schemaDefinition]
  );

  const filteredInitialData = useMemo(
    () =>
      effectiveSchemaDefinition
        ? filterFormDataByUserPanelSchema(
            initialData,
            effectiveSchemaDefinition
          )
        : initialData,
    [effectiveSchemaDefinition, initialData]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    getValues,
    getFieldState,
    trigger,
  } = useForm({
    defaultValues: filteredInitialData,
  });

  useEffect(() => {
    if (validateRef) {
      validateRef.current = {
        validate: () => trigger(),
        focusField: (fieldName: string) => {
          const fieldContainer = document.getElementById(
            `dynamic-field-${fieldName}`
          );
          if (!fieldContainer) return;

          fieldContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          window.setTimeout(() => {
            const editableControl = fieldContainer.querySelector<HTMLElement>(
              'input:not([type="file"]), textarea, select, [role="combobox"]'
            );
            const fallbackControl = fieldContainer.querySelector<HTMLElement>(
              'button, input[type="file"], [tabindex]:not([tabindex="-1"])'
            );
            (editableControl || fallbackControl)?.focus({ preventScroll: true });
          }, 350);
        },
        validateWithStatus: async () => {
          const isValid = await trigger(undefined, { shouldFocus: false });
          const items = fields
            .map((field) => {
              const fieldState = getFieldState(field.name);
              return {
                id: `dynamic.${field.name}`,
                label: field.label || field.name,
                isValid: !fieldState.invalid,
                message: (fieldState.error?.message as string) || 'تکمیل شده',
                required: Boolean(field.required),
              };
            })
            .filter((item) => item.required || !item.isValid)
            .map(({ required: _required, ...item }) => item);

          return { isValid, items };
        },
        getFormattedData: () => {
          const values = getValues();
          const schemaDefinition =
            effectiveSchemaDefinition || schema?.schemaDefinition;
          const scopedData = schemaDefinition
            ? filterFormDataByUserPanelSchema(values, schemaDefinition)
            : values;

          return schemaDefinition
            ? formatFormDataForApi(scopedData, schemaDefinition)
            : scopedData;
        },
      };
    }
  }, [
    effectiveSchemaDefinition,
    fields,
    getFieldState,
    getValues,
    schema,
    trigger,
    validateRef,
  ]);

  // Watch all form values for changes, but debounce updates
  const formValues = watch();

  // Notify parent component of changes with debounce to prevent infinite loops
  useEffect(() => {
    // Skip the first render to avoid an unnecessary update
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // If no change in data, don't trigger an update
    if (
      JSON.stringify(formValues) === JSON.stringify(lastFormDataRef.current)
    ) {
      return;
    }

    // Store current form values
    lastFormDataRef.current = { ...formValues };

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout to update parent
    updateTimeoutRef.current = setTimeout(() => {
      if (onChange && Object.keys(formValues).length > 0) {
        const payload = effectiveSchemaDefinition
          ? filterFormDataByUserPanelSchema(
              formValues,
              effectiveSchemaDefinition
            )
          : formValues;
        onChange(payload);
      }
    }, 120);

    return () => {
      // Cleanup timeout on unmount
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [formValues, onChange, effectiveSchemaDefinition]);

  useEffect(() => {
    if (schema) {
      try {
        const schemaDefinition =
          effectiveSchemaDefinition || schema.schemaDefinition;
        const fieldsFromSchema = convertSchemaToFields(schemaDefinition);
        setFields(fieldsFromSchema);
        setFormTitle(schema.formTitle || 'فرم سرویس');
        setFormDescription(schema.formDescription || '');
      } catch (err) {
        console.error('Error processing schema:', err);
        setLocalError('خطا در پردازش اسکیمای فرم');
      }
    }
  }, [schema, effectiveSchemaDefinition]);

  useEffect(() => {
    if (filteredInitialData && Object.keys(filteredInitialData).length > 0) {
      // onChange mirrors the form data into the parent. Do not reset the form
      // when that same data comes back as initialData, otherwise every field
      // edit can start a parent/child update loop.
      if (JSON.stringify(getValues()) !== JSON.stringify(filteredInitialData)) {
        reset(filteredInitialData);
      }
      lastFormDataRef.current = filteredInitialData;
    }
  }, [filteredInitialData, getValues, reset]);

  const getValidationRules = (field: FieldType) => {
    const rules: any = {};

    if (field.required) {
      rules.required = validationMessages.required;
    }

    if (field.type === 'email') {
      Object.assign(rules, getRhfEmailRules(field.required));
    }

    if (field.type === 'tel') {
      Object.assign(rules, getRhfMobilePhoneRules(field.required));
    }

    if (field.type === 'url') {
      Object.assign(rules, getRhfWebsiteRules(field.required));
    }

    if (field.minLength) {
      rules.minLength = {
        value: field.minLength,
        message: `حداقل ${field.minLength} کاراکتر وارد کنید`,
      };
    }

    if (field.maxLength) {
      rules.maxLength = {
        value: field.maxLength,
        message: `حداکثر ${field.maxLength} کاراکتر مجاز است`,
      };
    }

    if (
      field.min !== undefined &&
      (field.type === 'number' || field.type === 'range')
    ) {
      rules.min = {
        value: field.min,
        message: `حداقل مقدار ${field.min} است`,
      };
    }

    if (
      field.max !== undefined &&
      (field.type === 'number' || field.type === 'range')
    ) {
      rules.max = {
        value: field.max,
        message: `حداکثر مقدار ${field.max} است`,
      };
    }

    if (field.pattern) {
      rules.pattern = {
        value: new RegExp(field.pattern),
        message: validationMessages.invalidFormat,
      };
    }

    if (field.type === 'array') {
      const minimumItems = field.minItems ?? (field.required ? 1 : 0);
      rules.validate = {
        minItems: (value: any[]) => {
          const completedItems = Array.isArray(value)
            ? value.filter((item) =>
                typeof item === 'string'
                  ? item.trim().length > 0
                  : item !== null && item !== undefined
              )
            : [];

          if (completedItems.length >= minimumItems) return true;
          return minimumItems === 1
            ? validationMessages.required
            : `حداقل ${minimumItems} مورد الزامی است`;
        },
      };
    }

    return rules;
  };

  const renderField = (field: FieldType) => {
    const validationRules = getValidationRules(field);
    const fieldLabel = field.required
      ? `${field.label || field.name} *`
      : field.label;
    const isLogoField =
      field.name.toLowerCase().includes('logo') ||
      Boolean(field.label?.includes('لوگو'));
        const getLogoPreview = (value: any) => {
            const uploadedFile = Array.isArray(value) ? value[0] : value;
            if (typeof uploadedFile === 'string') {
                if (uploadedFile.startsWith('http')) return uploadedFile;
                if (uploadedFile.startsWith('/')) {
                    return `${STATIC_FILES_URL}${uploadedFile}`;
                }
                return null;
            }
            const filePath = uploadedFile?.filePath || uploadedFile?.path;

      if (!filePath || typeof filePath !== 'string') return null;
      return filePath.startsWith('http')
        ? filePath
        : `${STATIC_FILES_URL}${filePath}`;
    };
    if (field.component) {
      switch (field.component) {
        case 'FileUpload':
          return (
            <Controller
              name={field.name}
              control={control}
              rules={validationRules}
              render={({ field: { value, onChange, onBlur } }) => (
                <div className="space-y-2">
                  {isLogoField ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <LogoUpload
                        label={fieldLabel}
                        logoPreview={getLogoPreview(value)}
                        fileServiceType={
                          field.fileServiceType || 'COMPANY_LOGO'
                                                }
                                                onUploadSuccess={(uploadedFile) => {
                                                    onChange(uploadedFile.id);
                                                    onBlur();
                                                }}
                        onRemove={() => {
                          onChange(null);
                          onBlur();
                        }}
                        error={errors[field.name]?.message as string}
                        disabled={loading}
                        wrapperClassName="items-center"
                      />
                      {field.description && !errors[field.name] && (
                        <Text className="mt-3 text-center text-xs text-gray-500">
                          {field.description}
                        </Text>
                      )}
                    </div>
                  ) : (
                    <FileUpload
                      label={fieldLabel}
                      value={value}
                      onChange={(uploadedValue) => {
                        // Process file upload response
                        onChange(uploadedValue);
                      }}
                      onBlur={onBlur}
                      error={errors[field.name]?.message as string}
                      helperText={field.description}
                      multiple={field.maxFiles ? field.maxFiles > 1 : false}
                      accept={field.accept}
                      maxSize={field.maxSize}
                      maxFiles={field.maxFiles}
                      fileServiceType={field.fileServiceType}
                      disabled={loading}
                    />
                  )}

                  {/* Display file preview for single file */}
                  {!isLogoField && value && !Array.isArray(value) && (
                    <FilePreview file={value} onRemove={() => onChange(null)} />
                  )}

                  {/* Display file previews for multiple files */}
                  {!isLogoField && Array.isArray(value) && value.length > 0 && (
                    <div className="space-y-2">
                      {value.map((file, index) => (
                        <FilePreview
                          key={index}
                          file={file}
                          onRemove={() => {
                            const newFiles = [...value];
                            newFiles.splice(index, 1);
                            onChange(newFiles);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          );
        case 'LongTextField':
          return (
            <Controller
              name={field.name}
              control={control}
              rules={validationRules}
              render={({ field: { value, onChange, onBlur } }) => (
                <Textarea
                  label={fieldLabel}
                  placeholder={field.placeholder}
                  value={value || ''}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors[field.name]?.message as string}
                  disabled={loading}
                  helperText={field.description}
                />
              )}
            />
          );
      }
    }
    if (field.enum) {
      return (
        <Controller
          name={field.name}
          control={control}
          rules={validationRules}
          render={({ field: { value, onChange, onBlur } }) => (
            <Select
              label={fieldLabel}
              placeholder={field.placeholder || 'انتخاب کنید'}
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              onBlur={onBlur}
              error={errors[field.name]?.message as string}
              disabled={loading}
              options={
                field.enum?.map((option) => ({
                  label: option,
                  value: option,
                })) || []
              }
              helperText={field.description}
            />
          )}
        />
      );
    }
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'password':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                type={field.type}
                label={fieldLabel}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                error={errors[field.name]?.message as string}
                disabled={loading}
                helperText={field.description}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <Textarea
                label={fieldLabel}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                error={errors[field.name]?.message as string}
                disabled={loading}
                helperText={field.description}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                type="number"
                label={fieldLabel}
                placeholder={field.placeholder}
                value={value === undefined || value === null ? '' : value}
                onChange={(e) => {
                  const val =
                    e.target.value === '' ? '' : Number(e.target.value);
                  onChange(val);
                }}
                onBlur={onBlur}
                error={errors[field.name]?.message as string}
                disabled={loading}
                helperText={field.description}
                min={field.min}
                max={field.max}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <div className="space-y-1">
                <Checkbox
                  label={fieldLabel}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  disabled={loading}
                  error={errors[field.name]?.message as string}
                  helperText={field.description}
                />
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <div className="space-y-3">
                <Text>{fieldLabel}</Text>
                <div className="flex flex-col gap-2">
                  {field.options?.map((option) => (
                    <Radio
                      key={option}
                      label={option}
                      name={field.name}
                      value={option}
                      checked={value === option}
                      onChange={() => onChange(option)}
                      onBlur={onBlur}
                      disabled={loading}
                    />
                  ))}
                </div>
                {errors[field.name] && (
                  <FieldError>
                    {errors[field.name]?.message as string}
                  </FieldError>
                )}
                {field.description && !errors[field.name] && (
                  <Text className="text-xs text-gray-500">
                    {field.description}
                  </Text>
                )}
              </div>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                label={fieldLabel}
                placeholder={field.placeholder || 'انتخاب کنید'}
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                onBlur={onBlur}
                error={errors[field.name]?.message as string}
                disabled={loading}
                options={
                  field.options?.map((option) => ({
                    label: option,
                    value: option,
                  })) || []
                }
                helperText={field.description}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <div className="space-y-1">
                <Text className="text-sm font-medium">{fieldLabel}</Text>
                <DatePicker
                  placeholder={field.placeholder || 'انتخاب تاریخ'}
                  selected={value ? new Date(value) : null}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={loading}
                />
                {errors[field.name] && (
                  <FieldError>
                    {errors[field.name]?.message as string}
                  </FieldError>
                )}
                {field.description && !errors[field.name] && (
                  <Text className="text-xs text-gray-500">
                    {field.description}
                  </Text>
                )}
              </div>
            )}
          />
        );

      case 'array':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            defaultValue={[]}
            render={({ field: { value = [], onChange, onBlur } }) => {
              const arrayHasError = Boolean(errors[field.name]);
              const arrayErrorMessage =
                (errors[field.name]?.message as string) ||
                (arrayHasError ? validationMessages.required : '');
              const items =
                Array.isArray(value) && value.length > 0 ? value : [''];
              const hasReachedLimit =
                field.maxItems !== undefined && items.length >= field.maxItems;

              return (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Text
                        className={cn(
                          'font-medium',
                          arrayHasError ? 'text-red-dark' : 'text-gray-900'
                        )}
                      >
                        {fieldLabel}
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-500">
                        هر مورد را در یک ردیف جداگانه وارد کنید.
                      </Text>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onChange([...items, ''])}
                      disabled={loading || hasReachedLimit}
                      className="h-9 gap-1.5 border-primary-lighter bg-primary-lighter/30 px-3 text-primary-dark hover:border-primary hover:bg-primary-lighter"
                    >
                      افزودن
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-2 rounded-xl border bg-white p-2 transition focus-within:ring-2',
                          arrayHasError
                            ? 'border-red bg-red-lighter/20 focus-within:border-red focus-within:ring-red-lighter'
                            : 'border-gray-200 focus-within:border-primary-lighter focus-within:ring-primary-lighter/30'
                        )}
                      >
                        <span className="min-w-6 mt-2.5 flex h-6 items-center justify-center rounded-lg bg-gray-100 px-1 text-xs font-semibold text-gray-500">
                          {index + 1}
                        </span>
                        <Input
                          value={item || ''}
                          onChange={(e) => {
                            const newValue = [...items];
                            newValue[index] = e.target.value;
                            onChange(newValue);
                          }}
                          onBlur={onBlur}
                          disabled={loading}
                          placeholder={
                            field.placeholder ||
                            `${field.label || 'مورد'} را وارد کنید`
                          }
                          className="flex-1 [&_.ring-inset]:border-0"
                        />
                        {items.length > 1 && (
                          <ActionIcon
                            type="button"
                            variant="text"
                            aria-label={`حذف مورد ${index + 1}`}
                            onClick={() => {
                              const newValue = items.filter(
                                (_: any, itemIndex: number) =>
                                  itemIndex !== index
                              );
                              onChange(newValue);
                              onBlur();
                            }}
                            disabled={loading}
                            className="mt-1 text-gray-500 hover:bg-red-lighter hover:text-red-dark"
                          >
                            <X className="h-4 w-4" />
                          </ActionIcon>
                        )}
                      </div>
                    ))}
                  </div>

                  {field.maxItems !== undefined && (
                    <Text className="text-xs text-gray-400">
                      حداکثر {field.maxItems} مورد
                    </Text>
                  )}

                  {arrayHasError && (
                    <div
                      role="alert"
                      className="flex items-center gap-1.5 rounded-lg bg-red-lighter px-3 py-2 text-xs font-medium text-red-dark"
                    >
                      <XCircle className="h-4 w-4 shrink-0" />
                      {arrayErrorMessage}
                    </div>
                  )}

                  {field.description && !errors[field.name] && (
                    <Text className="text-xs text-gray-500">
                      {field.description}
                    </Text>
                  )}
                </div>
              );
            }}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value, onChange, onBlur } }) => (
              <div className="space-y-2">
                <FileUpload
                  label={fieldLabel}
                  value={value}
                  onChange={(uploadedValue) => {
                    // Process file upload response
                    onChange(uploadedValue);
                  }}
                  onBlur={onBlur}
                  error={errors[field.name]?.message as string}
                  helperText={field.description}
                  multiple={field.maxFiles ? field.maxFiles > 1 : false}
                  accept={field.accept}
                  maxSize={field.maxSize}
                  maxFiles={field.maxFiles}
                  fileServiceType={field.fileServiceType}
                  disabled={loading}
                />

                {/* Display file preview for single file */}
                {value && !Array.isArray(value) && (
                  <FilePreview file={value} onRemove={() => onChange(null)} />
                )}

                {/* Display file previews for multiple files */}
                {Array.isArray(value) && value.length > 0 && (
                  <div className="space-y-2">
                    {value.map((file, index) => (
                      <FilePreview
                        key={index}
                        file={file}
                        onRemove={() => {
                          const newFiles = [...value];
                          newFiles.splice(index, 1);
                          onChange(newFiles);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLocalError(null);

      // Format data according to schema
      const schemaDefinition =
        effectiveSchemaDefinition || schema.schemaDefinition;
      const scopedData = schemaDefinition
        ? filterFormDataByUserPanelSchema(data, schemaDefinition)
        : data;
      const formattedData = schemaDefinition
        ? formatFormDataForApi(scopedData, schemaDefinition)
        : scopedData;

      await onSubmit(formattedData);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setLocalError('خطا در ارسال فرم. لطفا دوباره تلاش کنید.');
    }
  };

  if (!schema) {
    return (
      <div className="p-4">
        <CustomAlert variant="danger">اسکیمای فرم موجود نیست</CustomAlert>
      </div>
    );
  }

  return (
    <div className={cn('mx-auto w-full max-w-5xl', className)}>
      {localError && (
        <CustomAlert variant="danger" className="mb-4">
          {localError}
        </CustomAlert>
      )}

      {showSuccess && (
        <CustomAlert variant="success" className="mb-4 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          فرم با موفقیت ذخیره شد
        </CustomAlert>
      )}

      <div
        className={cn(
          surface === 'card'
            ? 'rounded-lg bg-gray-0 p-6 shadow-sm dark:bg-gray-50'
            : 'bg-transparent p-0'
        )}
      >
        {!hideFormHeader && formTitle && (
          <Title className="mb-2 text-xl font-bold">{formTitle}</Title>
        )}

        {!hideFormHeader && formDescription && (
          <Text className="mb-6 text-gray-500">{formDescription}</Text>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.id}
                id={`dynamic-field-${field.name}`}
                className={cn(
                  surface === 'plain'
                    ? field.type === 'array' ||
                      field.type === 'file' ||
                      field.component === 'Textarea' ||
                      field.component === 'FileUpload' ||
                      field.component === 'MultiFileUpload'
                      ? 'col-span-1 md:col-span-2'
                      : 'col-span-1'
                    : field.column === 6
                    ? 'col-span-1'
                    : 'col-span-1 md:col-span-2',
                  surface === 'plain' &&
                    'rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors focus-within:border-primary-lighter focus-within:bg-primary-lighter/10 md:p-4'
                )}
              >
                {renderField(field)}
              </div>
            ))}
          </div>

          {!hideSubmit && (
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={loading || !isDirty}
                isLoading={loading}
              >
                {loading ? 'در حال ارسال...' : submitButtonLabel}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
