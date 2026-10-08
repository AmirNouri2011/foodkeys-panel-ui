'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Check,
  Headphones,
  Info,
  MessagesSquare,
  Paperclip,
  Send,
  Wallet,
  Wrench,
  Upload,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import useAxiosPrivate from '@/hooks/use-axios-private';
import styles from './ticket-create.module.css';

const categories = [
  {
    value: 'GENERAL',
    label: 'عمومی',
    description: 'سؤال‌ها و درخواست‌های شما',
    icon: MessagesSquare,
  },
  {
    value: 'TECHNICAL',
    label: 'فنی',
    description: 'مشکل در استفاده از سامانه',
    icon: Wrench,
  },
  {
    value: 'FINANCIAL',
    label: 'مالی و اعتباری',
    description: 'پرداخت، کیف پول و اشتراک',
    icon: Wallet,
  },
] as const;
const schema = z.object({
  category: z.enum(['GENERAL', 'TECHNICAL', 'FINANCIAL']),
  department: z.enum(['MANAGEMENT', 'SUPPORT', 'FINANCE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  subject: z
    .string()
    .trim()
    .min(3, 'موضوع تیکت باید حداقل ۳ حرف باشد')
    .max(150, 'موضوع نباید بیشتر از ۱۵۰ حرف باشد'),
  message: z.string().trim().min(1, 'شرح درخواست را بنویسید'),
});
type FormValues = z.infer<typeof schema>;
type Attachment = {
  key: string;
  file: File;
  id?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
};

export default function CreateTicketPage() {
  const axios = useAxiosPrivate();
  const router = useRouter();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const submitting = useRef(false);
  const [uploadError, setUploadError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'GENERAL',
      department: 'SUPPORT',
      priority: 'MEDIUM',
      subject: '',
      message: '',
    },
  });
  const category = watch('category');
  const priority = watch('priority');
  const subject = watch('subject');

  function addFiles(files: FileList | null) {
    if (!files || submitting.current) return;
    const selected = Array.from(files);
    setAttachments((previous) => {
      const next = [...previous];
      selected.forEach((file) => {
        if (
          !next.some(
            (item) =>
              item.file.name === file.name &&
              item.file.size === file.size &&
              item.file.lastModified === file.lastModified
          )
        ) {
          next.push({
            key: crypto.randomUUID(),
            file,
            status: 'pending',
            progress: 0,
          });
        }
      });
      return next;
    });
    setUploadError('');
  }

  function updateAttachment(key: string, patch: Partial<Attachment>) {
    setAttachments((previous) =>
      previous.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  async function submit(data: FormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setUploadError('');
    try {
      const attachmentIds: string[] = [];
      for (const attachment of attachments) {
        if (attachment.id) {
          attachmentIds.push(attachment.id);
          continue;
        }
        updateAttachment(attachment.key, { status: 'uploading', progress: 0 });
        try {
          const formData = new FormData();
          formData.append('fileServiceType', 'TICKET_ATTACHMENT');
          formData.append('files', attachment.file);
          const upload = await axios.post('/file', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
            onUploadProgress: ({ loaded, total }) => {
              if (total)
                updateAttachment(attachment.key, {
                  progress: Math.min(99, Math.round((loaded * 100) / total)),
                });
            },
          });
          const id = upload.data?.data?.[0]?.id;
          if (
            upload.data?.status !== 'SUCCESS' ||
            typeof id !== 'string' ||
            !id.trim()
          ) {
            throw new Error('Invalid attachment upload response');
          }
          updateAttachment(attachment.key, {
            id,
            status: 'uploaded',
            progress: 100,
          });
          attachmentIds.push(id);
        } catch {
          updateAttachment(attachment.key, { status: 'error' });
          setUploadError(
            `آپلود «${attachment.file.name}» انجام نشد. دوباره ارسال کنید یا این فایل را از پیوست‌ها حذف کنید.`
          );
          return;
        }
      }
      // Ticket conversations render HTML; escape user text before preserving line breaks.
      const message = data.message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      const response = await axios.post(
        '/ticket',
        { ...data, message, attachmentIds },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.status !== 'SUCCESS')
        throw new Error('Ticket creation failed');
      toast.success('تیکت با موفقیت ثبت شد');
      router.push(routes.support.ticket);
    } catch {
      toast.error('ثبت تیکت انجام نشد؛ دوباره تلاش کنید');
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div className={styles.page} dir="rtl">
      <Link href={routes.support.ticket} className={styles.back}>
        <ArrowRight size={16} />
        بازگشت به تیکت‌ها
      </Link>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>مرکز پشتیبانی فودکیز</span>
          <h1>ثبت تیکت جدید</h1>
          <p>درخواستتان را با ما در میان بگذارید؛ از همین‌جا همراهتان هستیم.</p>
        </div>
        <span className={styles.headerIcon}>
          <Headphones size={30} strokeWidth={1.5} />
        </span>
      </header>
      <div className={styles.layout}>
        <form
          id="create-ticket-form"
          className={styles.form}
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <fieldset disabled={isSubmitting} className={styles.fields}>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span>۱</span>
                <div>
                  <h2>درخواست شما دربارهٔ چیست؟</h2>
                  <p>دسته‌بندی مرتبط را انتخاب کنید.</p>
                </div>
              </div>
              <fieldset className={styles.categoryGrid}>
                <legend className="sr-only">دسته‌بندی درخواست</legend>
                {categories.map(({ value, label, description, icon: Icon }) => (
                  <label
                    key={value}
                    className={`${styles.category} ${
                      category === value ? styles.selected : ''
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register('category')}
                    />
                    <span className={styles.categoryTop}>
                      <Icon size={21} />
                      <span className={styles.radioMark}>
                        {category === value && <Check size={12} />}
                      </span>
                    </span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </label>
                ))}
              </fieldset>
            </section>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span>۲</span>
                <div>
                  <h2>جزئیات درخواست</h2>
                  <p>موضوع و توضیحات را روشن و کامل بنویسید.</p>
                </div>
              </div>
              <label className={styles.label} htmlFor="ticket-subject">
                موضوع تیکت <span>ضروری</span>
              </label>
              <input
                id="ticket-subject"
                className={styles.input}
                placeholder="مثلاً: مشکل در ویرایش اطلاعات شرکت"
                maxLength={150}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
                {...register('subject')}
              />
              <div className={styles.fieldMeta}>
                <span id="subject-error" className={styles.error}>
                  {errors.subject?.message}
                </span>
                <span>{subject.length.toLocaleString('fa-IR')} / ۱۵۰</span>
              </div>
              <div className={styles.options}>
                <div>
                  <label className={styles.label} htmlFor="ticket-department">
                    واحد پاسخ‌گو
                  </label>
                  <select
                    id="ticket-department"
                    className={styles.input}
                    {...register('department')}
                  >
                    <option value="SUPPORT">پشتیبانی فنی</option>
                    <option value="FINANCE">مالی و اعتباری</option>
                    <option value="MANAGEMENT">مدیریت</option>
                  </select>
                </div>
                <fieldset>
                  <legend className={styles.label}>اولویت درخواست</legend>
                  <div className={styles.priorities}>
                    {[
                      { value: 'LOW', label: 'کم' },
                      { value: 'MEDIUM', label: 'متوسط' },
                      { value: 'HIGH', label: 'بالا' },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={
                          priority === item.value ? styles.prioritySelected : ''
                        }
                      >
                        <input
                          type="radio"
                          value={item.value}
                          {...register('priority')}
                        />
                        <span
                          className={styles.priorityDot}
                          data-priority={item.value}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <label className={styles.label} htmlFor="ticket-message">
                شرح درخواست <span>ضروری</span>
              </label>
              <textarea
                id="ticket-message"
                className={styles.textarea}
                rows={8}
                placeholder="چه اتفاقی افتاده است؟ چه انتظاری داشتید؟ اگر پیام خطایی مشاهده کرده‌اید، متن آن را اینجا بنویسید…"
                aria-invalid={!!errors.message}
                aria-describedby={
                  errors.message ? 'message-error' : 'attachment-note'
                }
                {...register('message')}
              />
              {errors.message && (
                <p id="message-error" className={styles.error} role="alert">
                  {errors.message.message}
                </p>
              )}
              <p id="attachment-note" className={styles.attachment}>
                <Paperclip size={15} />
                تصویر خطا، رسید یا فایل‌های مرتبط را در بخش پیوست اضافه کنید.
              </p>
            </section>
            <section
              className={styles.section}
              aria-labelledby="attachments-title"
            >
              <div className={styles.sectionTitle}>
                <span>۳</span>
                <div>
                  <h2 id="attachments-title">
                    پیوست‌های درخواست{' '}
                    <small className={styles.optional}>اختیاری</small>
                  </h2>
                  <p>می‌توانید چند فایل به تیکت خود اضافه کنید.</p>
                </div>
              </div>
              <label className={styles.uploadBox}>
                <input
                  type="file"
                  multiple
                  aria-label="انتخاب فایل‌های پیوست"
                  aria-describedby="upload-help"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <Upload size={25} />
                <strong>انتخاب فایل‌های پیوست</strong>
                <span id="upload-help">
                  فایل‌ها هنگام ارسال تیکت آپلود می‌شوند.
                </span>
              </label>
              {attachments.length > 0 && (
                <ul
                  className={styles.fileList}
                  aria-label="فایل‌های انتخاب‌شده"
                >
                  {attachments.map((item) => (
                    <li key={item.key} className={styles.fileRow}>
                      <FileText size={20} />
                      <div className={styles.fileInfo}>
                        <strong dir="auto">{item.file.name}</strong>
                        <span>
                          {(item.file.size / 1024).toLocaleString('fa-IR', {
                            maximumFractionDigits: 1,
                          })}{' '}
                          کیلوبایت
                        </span>
                        <span
                          role="status"
                          className={
                            item.status === 'error' ? styles.error : undefined
                          }
                        >
                          {item.status === 'uploaded'
                            ? 'آپلود شد'
                            : item.status === 'uploading'
                            ? `در حال آپلود… ${item.progress.toLocaleString(
                                'fa-IR'
                              )}٪`
                            : item.status === 'error'
                            ? 'آپلود ناموفق؛ با ارسال مجدد دوباره تلاش می‌شود'
                            : 'آمادهٔ ارسال'}
                        </span>
                        {item.status === 'uploading' && (
                          <progress
                            className={styles.uploadProgress}
                            value={item.progress}
                            max={100}
                            aria-label={`پیشرفت آپلود ${item.file.name}`}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.removeFile}
                        aria-label={`حذف پیوست ${item.file.name}`}
                        onClick={() => {
                          setAttachments((previous) =>
                            previous.filter((file) => file.key !== item.key)
                          );
                          setUploadError('');
                        }}
                      >
                        <X size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {uploadError && (
                <p className={styles.error} role="alert">
                  {uploadError}
                </p>
              )}
            </section>
          </fieldset>
        </form>
        <aside className={styles.aside}>
          <div className={styles.guide}>
            <span className={styles.guideIcon}>
              <Headphones size={25} />
            </span>
            <h2>کمک بهتر، با توضیح دقیق‌تر</h2>
            <p>چند نکتهٔ ساده کمک می‌کند درخواست شما بهتر بررسی شود.</p>
            <ul>
              <li>
                <Check size={16} />
                <span>برای هر موضوع، یک تیکت جداگانه ثبت کنید.</span>
              </li>
              <li>
                <Check size={16} />
                <span>
                  نام کسب‌وکار و بخش مربوط به مشکل را در توضیحات بنویسید.
                </span>
              </li>
              <li>
                <Check size={16} />
                <span>
                  در صورت مشکل پرداخت، شمارهٔ پیگیری تراکنش را ذکر کنید.
                </span>
              </li>
            </ul>
            <div className={styles.privacy}>
              <Info size={17} />
              <p>
                رمز عبور، کد ورود و اطلاعات کامل کارت بانکی را در تیکت ننویسید.
              </p>
            </div>
          </div>
          <Link className={styles.previous} href={routes.support.ticket}>
            <MessagesSquare size={21} />
            <div>
              <strong>قبلاً تیکت ثبت کرده‌اید؟</strong>
              <span>مشاهده و پیگیری تیکت‌ها</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </aside>
      </div>
      <footer className={styles.footer}>
        <span>پاسخ‌ها را در بخش «تیکت‌ها» دنبال کنید.</span>
        <Button
          type="submit"
          form="create-ticket-form"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submit}
        >
          {!isSubmitting && <Send size={16} />}ثبت و ارسال تیکت
        </Button>
      </footer>
    </div>
  );
}
