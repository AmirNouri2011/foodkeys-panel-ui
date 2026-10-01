import { API_BASE_URL, STATIC_FILES_URL } from '@/config/api.config';
import { ForwardedRef, forwardRef, useRef, useState } from 'react';
import cn from '@/utils/class-names';
import Image from 'next/image';
import { Progressbar } from 'rizzui';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { PiPencilBold, PiUploadSimpleBold, PiTrashBold } from 'react-icons/pi';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { UploadValidationState } from '@/hooks/use-company-upload-validation';
import { validateUploadFile } from '@/utils/file-upload-validation';
import FileUploadGuidelines from './file-upload-guidelines';
import { isAxiosError } from 'axios';

const inputClasses = {
    base: 'relative border rounded-xl duration-75 ease-in-out focus:ring',
    flex: 'flex flex-col items-center gap-4',
    disabled: '!text-gray-500 !bg-gray-100 !border-gray-200 hover:border-gray-200',
};

interface SimpleTempFileDTO {
    id: string;
    fileName: string;
    originalFileName?: string;
    filePath: string;
}

export interface LogoUploadProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    className?: string;
    wrapperClassName?: string;
    logoPreview?: string | null;
    loading?: boolean;
    progress?: number;
    error?: string | null;
    success?: boolean;
    onRemove?: () => void;
    onUploadSuccess?: (fileData: SimpleTempFileDTO) => void;
    fileServiceType?: string;
    shape?: 'circle' | 'landscape';
    dimensionsHint?: string;
    uploadValidation?: UploadValidationState;
}

function LogoUpload(
    {
        label,
        className,
        wrapperClassName,
        logoPreview,
        loading: externalLoading,
        progress: externalProgress,
        error: externalError,
        success: externalSuccess,
        onRemove: externalOnRemove,
        onUploadSuccess,
        fileServiceType = 'COMPANY_LOGO',
        shape = 'circle',
        dimensionsHint,
        uploadValidation,
        ...props
    }: LogoUploadProps,
    ref: ForwardedRef<HTMLInputElement>
) {
    const _axios = useAxiosPrivate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [hover, setHover] = useState(false);

    // Internal state for handling the upload process
    const [loading, setLoading] = useState(externalLoading || false);
    const [progress, setProgress] = useState(externalProgress || 0);
    const [error, setError] = useState<string | null>(externalError || null);
    const [success, setSuccess] = useState(externalSuccess || false);
    const [fileData, setFileData] = useState<SimpleTempFileDTO | null>(null);

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    // Handle logo file upload to API
    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccess(false);

        const uploadedFile = (event.target as HTMLInputElement).files?.[0];
        if (!uploadedFile) return;

        if (uploadValidation) {
            if (!uploadValidation.ready || !uploadValidation.validation) return;
            setLoading(true);
            const validationError = await validateUploadFile(uploadedFile, uploadValidation.validation);
            if (validationError) {
                setError(validationError);
                setLoading(false);
                event.target.value = '';
                return;
            }
        } else if (!checkFileSizeAndType(uploadedFile)) {
            setError(
                'فرمت فایل اشتباه است. تنها فایل‌های با پسوند .JPG، .PNG و .WebP مجاز هستند و حداکثر حجم مجاز ۸ مگابایت است'
            );
            return;
        }

        setLoading(true);
        setProgress(0);

        // Simulate initial progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            // Prepare FormData for API upload
            const formData = new FormData();
            formData.append('files', uploadedFile);
            formData.append('fileServiceType', fileServiceType);

            // Upload to API
            const response = await _axios.post(
                `${API_BASE_URL}/file`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            // Clear interval and set progress to 100%
            clearInterval(progressInterval);
            setProgress(100);

            if (response.data.status === 'SUCCESS' && response.data.data && response.data.data.length > 0) {
                const uploadedFileData = response.data.data[0];
                setFileData(uploadedFileData);
                setSuccess(true);
                // Call the callback with the uploaded file data
                if (onUploadSuccess) {
                    onUploadSuccess(uploadedFileData);
                }
            } else {
                setError(response?.data?.message || 'خطا در آپلود لوگو. لطفا دوباره تلاش کنید.');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            setError((isAxiosError(error) && error.response?.data?.message) || 'خطا در آپلود لوگو. لطفا دوباره تلاش کنید.');
        } finally {
            clearInterval(progressInterval);
            setLoading(false);
            event.target.value = '';
        }
    };

    // Handle logo removal
    const handleLogoRemove = () => {
        setFileData(null);
        setSuccess(false);
        if (externalOnRemove) {
            externalOnRemove();
        }
    };

    // File validation
    const checkFileSizeAndType = (file: File) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 8 * 1024 * 1024; // 8MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    };

    // Generate preview URL for the uploaded logo
    const getPreviewUrl = () => {
        if (logoPreview) return logoPreview;
        if (fileData?.filePath) {
            return `${STATIC_FILES_URL}${fileData.filePath}`;
        }
        return null;
    };

    const currentLogoPreview = getPreviewUrl();
    const currentFileName = fileData?.originalFileName || fileData?.fileName ||
        (currentLogoPreview
            ? decodeURIComponent(currentLogoPreview.split('/').pop()?.split('?')[0] || '')
            : '');

    return (
        <div className={cn('flex flex-col', wrapperClassName)}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className={cn(uploadValidation && 'flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start')}>
            <div
                className={cn(
                    'relative flex flex-col items-center justify-center',
                    uploadValidation && 'shrink-0',
                    'transition duration-200',
                    className
                )}
            >
                <input
                    ref={(e) => {
                        if (ref) typeof ref === 'function' ? ref(e) : (ref.current = e);
                        inputRef.current = e;
                    }}
                    title=""
                    type="file"
                    className="sr-only"
                    onChange={handleLogoUpload}
                    {...props}
                    accept={uploadValidation ? uploadValidation.accept : props.accept || 'image/jpeg,image/png,image/webp'}
                    disabled={props.disabled || loading || (!!uploadValidation && !uploadValidation.ready)}
                    aria-describedby={uploadValidation ? 'company-logo-upload-rules' : props['aria-describedby']}
                />

                {loading ? (
                    <div
                        className={cn(
                            'flex h-40 flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 p-4',
                            shape === 'landscape'
                                ? 'w-full rounded-2xl'
                                : 'w-40 rounded-full'
                        )}
                    >
                        <Progressbar
                            value={progress}
                            size="lg"
                            label={`${progress}%`}
                            className="w-full"
                        />
                        <span className="mt-2 text-xs text-gray-500">در حال آپلود...</span>
                    </div>
                ) : (
                    <div
                        className={cn(
                            'group relative overflow-hidden transition-all duration-200',
                            currentLogoPreview
                                ? cn(
                                      'h-40 border-2 border-solid bg-white',
                                      shape === 'landscape'
                                          ? 'w-full rounded-2xl'
                                          : 'w-40 rounded-full'
                                  )
                                : cn(
                                      'h-40 cursor-pointer border-2 border-dashed',
                                      shape === 'landscape'
                                          ? 'w-full rounded-2xl'
                                          : 'w-40 rounded-full'
                                  ),
                            error
                                ? 'border-red-light bg-red-lighter'
                                : (currentLogoPreview
                                        ? 'border-blue-light'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-light hover:bg-blue-lighter/30'
                                )
                        )}
                        onClick={currentLogoPreview ? undefined : handleClick}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {currentLogoPreview ? (
                            <>
                                <PhotoProvider>
                                    <PhotoView src={currentLogoPreview}>
                                        <div className={cn('absolute', shape === 'circle' ? 'inset-[16%]' : 'inset-0')}>
                                        <Image
                                            src={currentLogoPreview}
                                            alt="تصویر لوگو"
                                            fill
                                            sizes={shape === 'circle' ? '110px' : '100vw'}
                                            unoptimized
                                            className={cn(
                                                'transition-opacity duration-300',
                                                shape === 'circle' ? 'object-contain' : 'object-cover',
                                                hover ? 'opacity-70' : 'opacity-100'
                                            )}
                                        />
                                        </div>
                                    </PhotoView>
                                </PhotoProvider>

                                <div className={cn(
                                    'absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 transition-opacity duration-300',
                                    hover ? 'opacity-100' : 'opacity-0'
                                )}>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            aria-label="تغییر لوگو"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-0 text-gray-600 hover:bg-blue-lighter hover:text-blue-dark dark:bg-gray-100 dark:text-gray-600 dark:hover:bg-blue-lighter/30 dark:hover:text-blue-light"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClick();
                                            }}
                                        >
                                            <PiPencilBold size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="حذف لوگو"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-red-light bg-red-lighter text-red-dark transition-colors hover:bg-red-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLogoRemove();
                                            }}
                                        >
                                            <PiTrashBold size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-4">
                                <div className="mb-2 rounded-full bg-blue-lighter p-3 text-blue-dark">
                                    <PiUploadSimpleBold size={28} />
                                </div>
                                <span className="px-2 text-center text-sm font-medium text-gray-600 group-hover:text-blue-dark">
                                    انتخاب لوگو
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {!uploadValidation && !loading && !currentLogoPreview && (
                    <div className="mt-3 w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            برای بارگذاری لوگو روی کادر بالا کلیک کنید
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                                فرمت: JPG، PNG، WebP
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                                حداکثر حجم: ۸ مگابایت
                            </span>
                            {dimensionsHint && (
                                <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                                    ابعاد مجاز: {dimensionsHint}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <p role="alert" className="mt-2 text-xs text-red-dark">
                        {error}
                    </p>
                )}

                {currentLogoPreview && currentFileName && (
                    <p
                        className="mt-2 max-w-64 truncate text-center text-xs text-gray-500"
                        title={currentFileName}
                    >
                        {currentFileName}
                    </p>
                )}

                {success && !error && (
                    <p className="mt-2 text-xs text-green-dark">
                        تصویر با موفقیت آپلود شد
                    </p>
                )}
            </div>
            {uploadValidation && <FileUploadGuidelines id="company-logo-upload-rules" state={uploadValidation} className="mt-0 w-full max-w-sm" />}
            </div>
        </div>
    );
}

export default forwardRef(LogoUpload);
LogoUpload.displayName = 'LogoUpload';
