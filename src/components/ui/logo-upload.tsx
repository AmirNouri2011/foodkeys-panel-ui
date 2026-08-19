import { API_BASE_URL } from '@/config/api.config';
import { STATIC_FILES_URL } from '@/config/api.config';
import { ForwardedRef, forwardRef, useRef, useState } from 'react';
import cn from '@/utils/class-names';
import Image from 'next/image';
import { Progressbar } from 'rizzui';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { PiPencilBold, PiUploadSimpleBold, PiTrashBold } from 'react-icons/pi';
import useAxiosPrivate from '@/hooks/use-axios-private';

const inputClasses = {
    base: 'relative border rounded-xl duration-75 ease-in-out focus:ring',
    flex: 'flex flex-col items-center gap-4',
    disabled: '!text-gray-500 !bg-gray-100 !border-gray-200 hover:border-gray-200',
};

interface SimpleTempFileDTO {
    id: string;
    fileName: string;
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

        // Check file size and type
        if (!checkFileSizeAndType(uploadedFile)) {
            setError(
                'فرمت فایل اشتباه است. تنها فایل‌های با پسوند .JPG، .PNG مجاز هستند و حداکثر حجم مجاز ۸ مگابایت است'
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
            setError(error?.response?.data?.message || 'خطا در آپلود لوگو. لطفا دوباره تلاش کنید.');
        } finally {
            setLoading(false);
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
        const validTypes = ['image/jpeg', 'image/png'];
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

    return (
        <div className={cn('flex flex-col', wrapperClassName)}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div
                className={cn(
                    'relative flex flex-col items-center justify-center',
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
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute top-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    onChange={handleLogoUpload}
                    {...props}
                />

                {loading ? (
                    <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50 p-4">
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
                                ? 'h-40 w-40 rounded-full border-2 border-solid'
                                : 'h-40 w-40 cursor-pointer rounded-full border-2 border-dashed',
                            error
                                ? 'border-red-300 bg-red-50'
                                : (currentLogoPreview
                                        ? 'border-blue-300'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                                )
                        )}
                        onClick={handleClick}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {currentLogoPreview ? (
                            <>
                                <PhotoProvider>
                                    <PhotoView src={currentLogoPreview}>
                                        <Image
                                            src={currentLogoPreview}
                                            alt="تصویر لوگو"
                                            layout="fill"
                                            objectFit="cover"
                                            className={cn(
                                                'transition-opacity duration-300',
                                                hover ? 'opacity-70' : 'opacity-100'
                                            )}
                                        />
                                    </PhotoView>
                                </PhotoProvider>

                                <div className={cn(
                                    'absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 transition-opacity duration-300',
                                    hover ? 'opacity-100' : 'opacity-0'
                                )}>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-0 text-gray-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-100 dark:text-gray-600 dark:hover:bg-blue-lighter/30 dark:hover:text-blue-light"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClick();
                                            }}
                                        >
                                            <PiPencilBold size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-0 text-gray-600 hover:bg-red-100 hover:text-red-700 dark:bg-gray-100 dark:text-gray-600 dark:hover:bg-red-lighter/30 dark:hover:text-red-light"
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
                                <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600">
                                    <PiUploadSimpleBold size={28} />
                                </div>
                                <span className="text-center text-sm font-medium text-gray-500 group-hover:text-blue-600">
                                    کلیک کنید تا لوگو را آپلود کنید
                                </span>
                                <span className="mt-2 text-center text-xs text-gray-400">
                                    JPG یا PNG (حداکثر ۸ مگابایت)
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <p role="alert" className="mt-2 text-xs text-red-500">
                        {error}
                    </p>
                )}

                {success && !error && (
                    <p className="mt-2 text-xs text-green-500">
                        لوگو با موفقیت آپلود شد
                    </p>
                )}
            </div>
        </div>
    );
}

export default forwardRef(LogoUpload);
LogoUpload.displayName = 'LogoUpload';