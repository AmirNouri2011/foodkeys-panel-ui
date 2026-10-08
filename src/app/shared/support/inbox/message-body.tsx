'use client';

import Image from 'next/image';
import type { Key } from 'react';
import isEmpty from 'lodash/isEmpty';
import DOMPurify from 'dompurify';
import {
  PiDownloadSimpleBold,
  PiEye,
  PiHeadset,
} from 'react-icons/pi';
import { TbClockHour8 } from 'react-icons/tb';
import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import cn from '@/utils/class-names';
import pdfIcon from '@public/pdf-icon.svg';
import imageIcon from '@public/image-icon.svg';
import { STATIC_FILES_URL } from '@/config/api.config';

type TicketAttachment = {
  id: Key;
  contentType?: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
};

type TicketMessage = {
  ticketDirection?: 'RECEIVED_FROM_ADMIN' | 'SENT_TO_SUPPORT';
  fromEmployee?: boolean;
  id: Key;
  senderAvatar?: string;
  senderName?: string;
  createdAtStr?: string;
  createdAtTimeStr?: string;
  messageContent: string;
  attachments?: TicketAttachment[];
};

function formatFileSize(size = 0) {
  if (!size) return 'حجم نامشخص';
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024)).toLocaleString('fa-IR')} کیلوبایت`;
  }
  return `${(size / (1024 * 1024)).toLocaleString('fa-IR', {
    maximumFractionDigits: 1,
  })} مگابایت`;
}

function getFileUrl(path: string) {
  return `${STATIC_FILES_URL}${path}`;
}

async function downloadAttachment(attachment: TicketAttachment) {
  try {
    const response = await fetch(getFileUrl(attachment.filePath));
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Error downloading ticket attachment:', error);
  }
}

export default function MessageBody({ messages }: { messages: TicketMessage[] }) {
  if (!messages?.length) {
    return (
      <div className="grid min-h-[260px] place-items-center px-4 py-10 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 text-gray-400">
            <PiHeadset className="h-7 w-7" />
          </span>
          <Text tag="h4" className="mt-4 font-semibold text-gray-800">
            هنوز پیامی ثبت نشده است
          </Text>
          <p className="mt-1 text-xs leading-6 text-gray-500">
            اولین توضیح یا پاسخ خود را از بخش پایین ارسال کنید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 pb-8 pt-1 sm:px-8 sm:pb-10">
      {messages.map((message) => {
        const isSupport =
          message.ticketDirection === 'RECEIVED_FROM_ADMIN'
            ? true
            : message.ticketDirection === 'SENT_TO_SUPPORT'
            ? false
            : message.fromEmployee === true;
        const sanitizedContent = DOMPurify.sanitize(message.messageContent);
        const avatarUrl = message.senderAvatar
          ? `${process.env.NEXT_PUBLIC_STATIC_FILES_URL || STATIC_FILES_URL}${message.senderAvatar}`
          : undefined;

        return (
          <article
            key={message.id}
            id={`ticket-message-${message.id}`}
            dir="ltr"
            className={cn(
              'flex w-full items-start gap-2.5 sm:gap-3',
              isSupport ? 'justify-start' : 'justify-end'
            )}
          >
            <div
              className={cn(
                'flex min-w-0 max-w-full items-start gap-2.5 sm:max-w-[90%] sm:gap-3',
                isSupport ? 'flex-row' : 'flex-row-reverse'
              )}
            >
              <span className="relative flex-none">
                <Avatar
                  name={message.senderName || (isSupport ? 'پشتیبانی' : 'کاربر')}
                  src={avatarUrl}
                  className={cn(
                    '!h-9 !w-9 border-2 font-medium text-white shadow-sm sm:!h-10 sm:!w-10',
                    isSupport
                      ? 'border-primary-lighter bg-primary'
                      : 'border-gray-100 bg-gray-500'
                  )}
                />
                {isSupport && (
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-green text-white">
                    <PiHeadset className="h-2.5 w-2.5" />
                  </span>
                )}
              </span>

              <div
                dir="rtl"
                className={cn(
                  'min-w-0 flex-1',
                  isSupport ? 'text-right' : 'text-right'
                )}
              >
                <div className="mb-1.5 flex items-center justify-start gap-2 px-1">
                  <Text tag="h3" className="text-xs font-semibold text-gray-700">
                    {isSupport ? message.senderName || 'کارشناس پشتیبانی' : 'شما'}
                  </Text>
                  {isSupport && (
                    <span className="rounded-full bg-green-lighter px-2 py-0.5 text-[10px] font-medium text-green-dark">
                      پشتیبانی
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    'overflow-hidden rounded-2xl border px-3.5 py-2.5 shadow-sm',
                    isSupport
                      ? 'rounded-tl-md border-gray-200 bg-gray-0 text-gray-800'
                      : 'rounded-tr-md border-primary bg-primary text-white'
                  )}
                >
                  <div
                    className={cn(
                      'break-words text-sm leading-7 [overflow-wrap:anywhere] [&_a]:underline [&_ol]:list-decimal [&_ol]:pr-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pr-5',
                      isSupport ? '[&_a]:text-primary' : '[&_a]:text-white'
                    )}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />

                  {!isEmpty(message.attachments) && (
                    <div
                      className={cn(
                        'mt-2.5 grid gap-2 border-t pt-2.5',
                        isSupport ? 'border-gray-100' : 'border-white/20'
                      )}
                    >
                      {message.attachments?.map((attachment) => {
                        const isImage = attachment.contentType?.startsWith('image/');

                        return (
                          <div
                            key={attachment.id}
                            className={cn(
                              'flex items-center gap-2.5 rounded-xl border p-2',
                              isSupport
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-white/20 bg-white/10'
                            )}
                          >
                            <figure className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-lg bg-white/90">
                              <Image
                                src={isImage ? imageIcon : pdfIcon}
                                alt="نوع فایل پیوست"
                                className="block !h-7 !w-7 object-contain"
                              />
                            </figure>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {attachment.fileName}
                              </p>
                              <p
                                className={cn(
                                  'mt-1 text-[10px]',
                                  isSupport ? 'text-gray-500' : 'text-white/70'
                                )}
                              >
                                {formatFileSize(attachment.fileSize)}
                              </p>
                            </div>
                            <div className="flex flex-none items-center gap-1">
                              <a
                                href={getFileUrl(attachment.filePath)}
                                target="_blank"
                                rel="noreferrer"
                                title="مشاهده فایل"
                                className={cn(
                                  'grid h-8 w-8 place-items-center rounded-lg transition-colors',
                                  isSupport
                                    ? 'bg-gray-0 text-gray-600 hover:text-primary'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                )}
                              >
                                <PiEye className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                title="دانلود فایل"
                                onClick={() => downloadAttachment(attachment)}
                                className={cn(
                                  'grid h-8 w-8 place-items-center rounded-lg transition-colors',
                                  isSupport
                                    ? 'bg-gray-0 text-gray-600 hover:text-primary'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                )}
                              >
                                <PiDownloadSimpleBold className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    'mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-gray-400',
                    isSupport ? 'justify-start' : 'justify-end'
                  )}
                >
                  <TbClockHour8 className="h-3 w-3" />
                  <span>{message.createdAtTimeStr || '—'}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span>{message.createdAtStr || '—'}</span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
      <div id="ticket-messages-end" className="h-5" aria-hidden="true" />
    </div>
  );
}
