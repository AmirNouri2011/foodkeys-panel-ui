export interface FileUploadValidation {
  fileType: string;
  accept?: string;
  extensions?: string[];
  mimeTypes?: string[];
  mediaCategory?: string;
  minSizeBytes?: number;
  maxSizeBytes?: number;
  maxFiles?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  rules?: {
    guide?: string | null;
    allowedAspectRatios?: { width: number; height: number; label?: string }[];
    aspectRatioMatchMode?: string;
    aspectRatioTolerance?: number;
    maxPixels?: number;
    allowAnimated?: boolean;
  };
}

const extensionMime: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  svg: ['image/svg+xml'],
  pdf: ['application/pdf'],
  mp4: ['video/mp4'],
  mov: ['video/quicktime'],
  webm: ['video/webm'],
  m4v: ['video/x-m4v', 'video/mp4'],
  mkv: ['video/x-matroska'],
};
export const uploadNumber = (value: number) =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(value);

export function uploadSize(bytes: number) {
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
  const index = Math.min(
    Math.max(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), 0),
    units.length - 1
  );
  return `${uploadNumber(bytes / 1024 ** index)} ${units[index]}`;
}

export function uploadExtensions(validation: FileUploadValidation) {
  const extensions = validation.extensions?.length
    ? validation.extensions
    : (validation.accept || '')
        .split(',')
        .filter((value) => value.trim().startsWith('.'));
  return extensions
    .map((value) => value.trim().replace(/^\./, '').toLowerCase())
    .filter(
      (extension) =>
        !validation.mimeTypes?.length ||
        !extensionMime[extension] ||
        extensionMime[extension].some((mime) =>
          validation.mimeTypes!.includes(mime)
        )
    );
}

export function uploadAccept(validation?: FileUploadValidation) {
  if (!validation) return undefined;
  const extensions = uploadExtensions(validation);
  return extensions.length
    ? extensions.map((value) => `.${value}`).join(',')
    : validation.mimeTypes?.length
    ? validation.mimeTypes.join(',')
    : validation.accept || undefined;
}

export function uploadGuidelines(
  validation: FileUploadValidation,
  multiple = false
) {
  const rows: {
    label: string;
    value: string;
    ltr?: boolean;
    ratios?: { width: number; height: number }[];
  }[] = [];
  const extensions = uploadExtensions(validation);
  rows.push({
    label: 'فرمت‌های مجاز',
    value: extensions.length
      ? extensions.map((value) => value.toUpperCase()).join('، ')
      : validation.mimeTypes?.join('، ') || 'فرمت خاصی تعیین نشده است',
    ltr: extensions.length > 0,
  });
  if (validation.maxSizeBytes != null)
    rows.push({
      label: 'حجم هر فایل',
      value: `${
        validation.minSizeBytes
          ? `از ${uploadSize(validation.minSizeBytes)} تا`
          : 'حداکثر'
      } ${uploadSize(validation.maxSizeBytes)}`,
    });
  if (
    validation.minWidth ||
    validation.maxWidth ||
    validation.minHeight ||
    validation.maxHeight
  ) {
    const range = (min?: number, max?: number) =>
      min && max
        ? `${uploadNumber(min)} تا ${uploadNumber(max)}`
        : min
        ? `حداقل ${uploadNumber(min)}`
        : max
        ? `حداکثر ${uploadNumber(max)}`
        : 'بدون محدودیت';
    rows.push({
      label: 'ابعاد به پیکسل',
      value: `عرض: ${range(
        validation.minWidth,
        validation.maxWidth
      )} · ارتفاع: ${range(validation.minHeight, validation.maxHeight)}`,
    });
  }
  const ratios = validation.rules?.allowedAspectRatios?.filter(
    (r) => r.width > 0 && r.height > 0
  );
  if (ratios?.length)
    rows.push({
      label: 'نسبت عرض به ارتفاع',
      ratios,
      value: ratios
        .map(
          (r) =>
            `${uploadNumber(r.width)}:${uploadNumber(r.height)}${
              r.width === r.height ? ' (مربعی)' : ''
            }`
        )
        .join(' یا '),
      ltr: true,
    });
  if (validation.minDurationSeconds || validation.maxDurationSeconds)
    rows.push({
      label: 'مدت ویدئو',
      value: `${
        validation.minDurationSeconds
          ? `از ${uploadNumber(validation.minDurationSeconds)}`
          : ''
      }${
        validation.maxDurationSeconds
          ? ` تا ${uploadNumber(validation.maxDurationSeconds)}`
          : ''
      } ثانیه`,
    });
  if (multiple && validation.maxFiles)
    rows.push({
      label: 'تعداد در هر بار آپلود',
      value: `حداکثر ${uploadNumber(validation.maxFiles)} فایل`,
    });
  return rows;
}

export function validateUploadBasics(
  file: Pick<File, 'name' | 'type' | 'size'>,
  validation: FileUploadValidation
) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const extensions = uploadExtensions(validation);
  if (
    (extensions.length && !extensions.includes(extension)) ||
    (validation.mimeTypes?.length &&
      file.type &&
      !validation.mimeTypes.includes(file.type))
  ) {
    return `فرمت این فایل مجاز نیست. ${uploadGuidelines(validation)[0].value}`;
  }
  if (validation.maxSizeBytes != null && file.size > validation.maxSizeBytes)
    return `حجم فایل باید حداکثر ${uploadSize(validation.maxSizeBytes)} باشد.`;
  if (validation.minSizeBytes != null && file.size < validation.minSizeBytes)
    return `حجم فایل باید حداقل ${uploadSize(validation.minSizeBytes)} باشد.`;
  return undefined;
}

export function validateUploadDimensions(
  width: number,
  height: number,
  validation: FileUploadValidation,
  duration?: number
) {
  if (
    (validation.minWidth && width < validation.minWidth) ||
    (validation.maxWidth && width > validation.maxWidth) ||
    (validation.minHeight && height < validation.minHeight) ||
    (validation.maxHeight && height > validation.maxHeight)
  ) {
    return `ابعاد فایل ${uploadNumber(width)} × ${uploadNumber(
      height
    )} پیکسل است. ${uploadGuidelines(validation).find(
      (row) => row.label === 'ابعاد به پیکسل'
    )?.value}`;
  }
  if (
    validation.rules?.maxPixels &&
    width * height > validation.rules.maxPixels
  )
    return `تعداد پیکسل‌ها باید حداکثر ${uploadNumber(
      validation.rules.maxPixels
    )} باشد.`;
  const ratios = validation.rules?.allowedAspectRatios?.filter(
    (r) => r.width > 0 && r.height > 0
  );
  if (
    ratios?.length &&
    !ratios.some((r) => {
      const target = r.width / r.height;
      const difference = Math.abs(width / height - target);
      // Leave borderline tolerance cases to the server, whose match policy is authoritative.
      const tolerance =
        validation.rules?.aspectRatioMatchMode === 'EXACT'
          ? 0
          : validation.rules?.aspectRatioTolerance ?? 0;
      return difference <= tolerance * Math.max(1, target) + Number.EPSILON;
    })
  )
    return `نسبت عرض به ارتفاع باید ${uploadGuidelines(validation).find(
      (row) => row.label === 'نسبت عرض به ارتفاع'
    )?.value} باشد.`;
  if (
    duration != null &&
    ((validation.minDurationSeconds &&
      duration < validation.minDurationSeconds) ||
      (validation.maxDurationSeconds &&
        duration > validation.maxDurationSeconds))
  ) {
    return `مدت ویدئو مجاز نیست. ${uploadGuidelines(validation).find(
      (row) => row.label === 'مدت ویدئو'
    )?.value}`;
  }
  return undefined;
}

export async function validateUploadFile(
  file: File,
  validation: FileUploadValidation
): Promise<string | undefined> {
  const basicError = validateUploadBasics(file, validation);
  if (basicError) return basicError;
  const image =
    file.type.startsWith('image/') || validation.mediaCategory === 'IMAGE';
  const video =
    file.type.startsWith('video/') || validation.mediaCategory === 'VIDEO';
  if (!image && !video) return undefined;
  const url = URL.createObjectURL(file);
  try {
    const metadata = await new Promise<{
      width: number;
      height: number;
      duration?: number;
    } | null>((resolve) => {
      const element = video ? document.createElement('video') : new Image();
      let timer: ReturnType<typeof setTimeout>;
      const finish = (
        value: { width: number; height: number; duration?: number } | null
      ) => {
        clearTimeout(timer);
        element.onload = null;
        element.onerror = null;
        if (element instanceof HTMLVideoElement) {
          element.onloadedmetadata = null;
          element.removeAttribute('src');
          element.load();
        }
        resolve(value);
      };
      element.onerror = () => finish(null);
      if (element instanceof HTMLVideoElement) {
        element.preload = 'metadata';
        element.onloadedmetadata = () =>
          finish({
            width: element.videoWidth,
            height: element.videoHeight,
            duration: element.duration,
          });
      } else
        element.onload = () =>
          finish({
            width: element.naturalWidth,
            height: element.naturalHeight,
          });
      timer = setTimeout(() => finish(null), 10000);
      element.src = url;
    });
    // Some server-supported video containers cannot be decoded by the browser.
    if (!metadata)
      return video
        ? undefined
        : 'تصویر قابل خواندن نیست؛ یک فایل تصویر سالم انتخاب کنید.';
    return validateUploadDimensions(
      metadata.width,
      metadata.height,
      validation,
      metadata.duration
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
