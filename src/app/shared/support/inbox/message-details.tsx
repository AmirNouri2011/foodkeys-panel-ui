// 'use client';
//
// import { useAtomValue } from 'jotai';
// import { z } from 'zod';
// import { LuReply, LuTicket } from 'react-icons/lu';
// import { useState, useEffect } from 'react';
// import {
//   PiCaretDownBold,
//   PiCheck,
//   PiPaperclipLight,
//   PiXCircle,
// } from 'react-icons/pi';
// import { Text } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Avatar } from '@/components/ui/avatar';
// import { Input } from '@/components/ui/input';
// import {
//   dataAtom,
//   messageIdAtom,
// } from '@/app/shared/support/inbox/message-list';
// import { SubmitHandler, Controller } from 'react-hook-form';
// import { Form } from '@/components/ui/form';
// import { Empty } from '@/components/ui/empty';
// import ActionDropdown from '@/app/shared/support/inbox/action-dropdown';
// import Select from '@/components/ui/select';
// import MessageBody from '@/app/shared/support/inbox/message-body';
// import cn from '@/utils/class-names';
// import SimpleBar from '@/components/ui/simplebar';
// import { useElementSize } from '@/hooks/use-element-size';
// import { useMedia } from '@/hooks/use-media';
// import dynamic from 'next/dynamic';
// import { SupportType, supportTypes } from '@/data/support-inbox';
// import Spinner from '@/components/ui/spinner';
// import { toast } from 'react-hot-toast';
// import useAxiosPrivate from '@/hooks/use-axios-private';
// import ticketSelectionImg from '@public/ticketSelection.jpg';
// import Image from 'next/image';
// import { isUUID } from '@/utils/is-uuid';
// import { MdAttachFile } from 'react-icons/md';
// import { Tooltip } from '@/components/ui/tooltip';
// import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
// import { HiOutlineClipboardDocument } from 'react-icons/hi2';
// import { AiTwotoneCloseCircle } from 'react-icons/ai';
// const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
//   ssr: false,
// });
//
// const FormSchema = z.object({
//   message: z.string({ required_error: 'پیام نمی‌تواند خالی باشد' }),
// });
//
// type FormValues = {
//   message: string;
// };
//
// const MAX_ATTACHMENTS = 3;
// const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
//
// const priorityOptions = [
//   {
//     value: 'Low',
//     name: 'Low',
//     label: (
//       <div className="flex items-center gap-2 text-xs sm:text-sm">
//         <Badge renderAsDot color="success" />
//         <span>کم</span>
//       </div>
//     ),
//   },
//   {
//     value: 'Medium',
//     name: 'Medium',
//     label: (
//       <div className="flex items-center gap-2 text-xs sm:text-sm">
//         <Badge renderAsDot color="warning" />
//         <span>متوسط</span>
//       </div>
//     ),
//   },
//   {
//     value: 'High',
//     name: 'High',
//     label: (
//       <div className="flex items-center gap-2 text-xs sm:text-sm">
//         <Badge renderAsDot color="danger" />
//         <span>بالا</span>
//       </div>
//     ),
//   },
// ];
//
// const agents = [
//   {
//     value: 'MANAGEMENT',
//     name: 'مدیریت',
//     label: (
//       <div className="flex items-center gap-2">
//         <Avatar
//           src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-10.webp"
//           name="John Doe"
//           className="!h-6 !w-6 rounded-full"
//         />
//         <span className="whitespace-nowrap text-xs sm:text-sm">مدیریت</span>
//       </div>
//     ),
//   },
//   {
//     value: 'SUPPORT',
//     name: 'پشتیبانی فنی',
//     label: (
//       <div className="flex items-center gap-2">
//         <Avatar
//           src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-13.webp"
//           name="John Doe"
//           className="!h-6 !w-6 rounded-full"
//         />
//         <span className="whitespace-nowrap text-xs sm:text-sm">
//           پشتیبانی فنی
//         </span>
//       </div>
//     ),
//   },
//   {
//     value: 'FINANCE',
//     name: 'مالی و اعتباری',
//     label: (
//       <div className="flex items-center gap-2">
//         <Avatar
//           src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-04.webp"
//           name="John Doe"
//           className="!h-6 !w-6 rounded-full"
//         />
//         <span className="whitespace-nowrap text-xs sm:text-sm">
//           مالی و اعتباری
//         </span>
//       </div>
//     ),
//   },
// ];
//
// const contactStatuses = [
//   {
//     value: 'عمومی',
//     name: 'GENERAL',
//   },
//   {
//     value: 'فنی',
//     name: 'TECHNICAL',
//   },
//   {
//     value: 'مالی و اعتباری',
//     name: 'FINANCE',
//   },
// ];
//
// const supportOptionTypes = [
//   {
//     value: supportTypes.Chat.value,
//     name: supportTypes.Chat.name,
//   },
//   {
//     value: supportTypes.Email.value,
//     name: supportTypes.Email.name,
//   },
// ];
//
// export default function MessageDetails({ className }: { className?: string }) {
//   const data = useAtomValue(dataAtom);
//   const [priority, setPriority] = useState('');
//   const messageId = useAtomValue(messageIdAtom);
//   const selectedTicket = data?.find((t) => t.id === messageId);
//   const [agent, setAgent] = useState(
//     (selectedTicket &&
//       selectedTicket.department &&
//       agents.find((a) => a.value === selectedTicket?.department)) ||
//       null
//   );
//   const [contactStatus, setContactStatus] = useState(
//     (selectedTicket &&
//       selectedTicket.priority &&
//       contactStatuses.find((c) => c.value === selectedTicket?.priority)) ||
//       contactStatuses[0].value
//   );
//
//   const [messages, setMessages] = useState([]);
//   const [isCopied, setIsCopied] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [sendBtnLoading, setSendBtnLoading] = useState(false);
//   const [changed, setChanged] = useState<boolean>(false);
//   const _axios = useAxiosPrivate();
//   const [showMessages, setShowMessages] = useState(false);
//   const [state, copyToClipboard] = useCopyToClipboard();
//   const [supportType, setSupportType] = useState<SupportType | string>(
//     supportTypes.Chat.value
//   );
//   const [ref, { width }] = useElementSize();
//   const isWide = useMedia('(min-width: 1280px) and (max-width: 1440px)', false);
//
//   useEffect(() => {
//     const fetchTicketMessages = async () => {
//       if (!messageId) return;
//       try {
//         const response = await _axios.get(`/ticket/${messageId}/messages`);
//         if (response.data.status === 'SUCCESS') {
//           setMessages(response.data.data);
//           setShowMessages(true);
//           // setTotalItems(response.data.pagination.totalElements);
//         }
//       } catch (error) {
//         setShowMessages(false);
//         console.error('Error fetching ticket data:', error);
//         toast.error('خطا در دریافت تیکت‌ها');
//       }
//       return () => setShowMessages(false);
//     };
//     if (isUUID(messageId)) fetchTicketMessages();
//   }, [messageId, changed]);
//
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       const newFiles = Array.from(event.target.files);
//       const totalFiles = [...attachments, ...newFiles];
//       if (totalFiles.length > MAX_ATTACHMENTS) {
//         toast.error('شما فقط مجاز به ارسال ۳ فایل هستید!');
//         return;
//       }
//       for (const file of newFiles) {
//         if (file.size > MAX_FILE_SIZE) {
//           toast.error(`${file.name} دارای حجمی بیشتر از ۸ مگابایت است.`);
//           return;
//         }
//       }
//       setAttachments(totalFiles);
//     }
//   };
//
//   const removeAttachment = (index: number) => {
//     setAttachments((prev) => prev.filter((_, i) => i !== index));
//   };
//
//   function formWidth() {
//     if (isWide) return width - 64;
//     return width - 44;
//   }
//
//   // const message = data.find((m) => m.id === messageId) ?? data[0];
//   // const initials = `${message?.firstName.charAt(0)}${message?.lastName.charAt(
//   //   0
//   // )}`;
//
//   // set default selected message when render complete
//   useEffect(() => {
//     // setFormWidth(width);
//     console.log('data = ' + JSON.stringify(data));
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 500); // 500 milliseconds
//     return () => clearTimeout(timer);
//   }, []);
//
//   // set active message id
//   // useEffect(() => {
//   //     setSupportType(message?.supportType);
//   // }, [message]);
//
//   const onSubmit: SubmitHandler<FormValues> = async (formData) => {
//     console.log(formData);
//     setSendBtnLoading(true);
//     try {
//       const formDataPayload = new FormData();
//       formDataPayload.append('messageContent', formData.message);
//       attachments.forEach((file, index) => {
//         formDataPayload.append(`attachments`, file);
//       });
//
//       const response = await _axios.post(
//         `/ticket/${messageId}/messages`,
//         formDataPayload
//       );
//
//       if (response.data.status === 'SUCCESS') {
//         toast.success('پیام با موفقیت ارسال شد');
//         setAttachments([]);
//         setChanged(!changed);
//       } else {
//         throw new Error('Failed to send message: ', response?.data?.message);
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       toast.error('خطا در ارسال پیام');
//     } finally {
//       setSendBtnLoading(false);
//     }
//   };
//   const handleCopyToClipboard = (id: string) => {
//     copyToClipboard(id as string);
//     if (!state.error && state.value) {
//       setIsCopied(() => true);
//       setTimeout(() => {
//         setIsCopied(false);
//       }, 3000); // 3 seconds
//     }
//   };
//
//   if (isLoading) {
//     return (
//       <div
//         className={cn(
//           '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
//           className
//         )}
//       >
//         <Spinner size="xl" />
//       </div>
//     );
//   }
//
//   if (!messages) {
//     return (
//       <div
//         className={cn(
//           '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
//           className
//         )}
//       >
//         <Empty
//           text="No conversations selected"
//           textClassName="mt-4 text-base text-gray-500"
//         />
//       </div>
//     );
//   }
//
//   return (
//     <div
//       className={cn(
//         'relative pt-6 lg:rounded-lg lg:border lg:border-gray-200 lg:px-4 lg:py-7 xl:px-5 xl:py-5 2xl:pb-7 2xl:pt-6',
//         className
//       )}
//     >
//       <div>
//         <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 3xl:flex-row 3xl:items-center">
//           <div className="flex flex-col items-start justify-between gap-3 xs:flex-row xs:items-center xs:gap-6 lg:justify-normal">
//             {selectedTicket && (
//               <div className="flex flex-col gap-2">
//                 <div className="flex flex-col gap-2 sm:flex-row">
//                   <Text tag="h4" className="font-semibold">
//                     {/*@ts-ignore*/}
//                     {selectedTicket.subject}
//                   </Text>
//                   <Badge
//                     variant="outline"
//                     // color="success"
//                     size="sm"
//                     className={`animate-pulse ${
//                       selectedTicket?.statusStr === 'در انتظار پاسخ'
//                         ? 'bg-orange-light'
//                         : selectedTicket?.statusStr === 'پاسخ داده شده'
//                         ? 'bg-green-light'
//                         : 'bg-red-light'
//                     } ${
//                       selectedTicket?.statusStr === 'در انتظار پاسخ'
//                         ? 'border-orange-light'
//                         : selectedTicket?.statusStr === 'پاسخ داده شده'
//                         ? 'border-green-light'
//                         : 'border-red-light'
//                     } w-auto min-w-min px-5 text-white`}
//                   >
//                     {selectedTicket?.statusStr || 'مشکل نرم افزار'}
//                   </Badge>
//                 </div>
//                 <span className="mt-1.5 flex items-center text-gray-500 lg:mt-0">
//                   <p>شماره تیکت: </p>
//                   {selectedTicket?.ticketRefId}{' '}
//                   <Tooltip
//                     size="sm"
//                     rounded="sm"
//                     placement="top"
//                     content={() => (isCopied ? 'کپی شده' : 'کپی شود')}
//                   >
//                     <button
//                       type="button"
//                       onClick={() =>
//                         handleCopyToClipboard(selectedTicket?.ticketRefId)
//                       }
//                     >
//                       {isCopied ? (
//                         <PiCheck className="mr-1 h-4 w-4" />
//                       ) : (
//                         <HiOutlineClipboardDocument className="mr-1 h-4 w-4" />
//                       )}
//                     </button>
//                   </Tooltip>
//                 </span>
//               </div>
//             )}
//           </div>
//
//           {selectedTicket && (
//             <div className="jus flex flex-wrap items-center gap-2.5 sm:justify-end">
//               <div className="flex gap-4">
//                 <span className="rounded-md border px-4 py-2 shadow-md">
//                   {agents[0].label}
//                 </span>
//                 <span className="rounded-md border px-4 py-2 shadow-md">
//                   {contactStatuses[0].value}
//                 </span>
//                 <span className="rounded-md border px-4 py-2 shadow-md">
//                   {priorityOptions[0].label}
//                 </span>
//               </div>
//               {selectedTicket.status !== "CLOSED" &&
//               <Button
//                 variant="outline"
//                 color="danger"
//                 type="submit"
//                 size="DEFAULT"
//                 className="group col-span-2 flex items-center gap-1"
//               >
//                 بستن تیکت
//                 <AiTwotoneCloseCircle
//                   className="text-red-light transition-all group-hover:scale-110 group-active:scale-95"
//                   size={20}
//                 />
//               </Button>
//               }
//             </div>
//           )}
//         </header>
//         {showMessages ? (
//           <>
//             <div className="[&_.simplebar-content]:grid [&_.simplebar-content]:gap-8 [&_.simplebar-content]:py-5">
//               <SimpleBar className="@3xl:max-h-[calc(100dvh-29rem)] @4xl:max-h-[calc(100dvh-27rem)] @7xl:max-h-[calc(100dvh-26rem)]">
//                 {/* <SimpleBar className="@3xl:max-h-[calc(100dvh-34rem)] @4xl:max-h-[calc(100dvh-32rem)] @7xl:max-h-[calc(100dvh-31rem)]"> */}
//                 <MessageBody messages={messages} />
//               </SimpleBar>
//             </div>
//
//             {selectedTicket && selectedTicket.status !== "CLOSED" &&
//             <div
//               ref={ref}
//               className="grid grid-cols-[32px_1fr] items-start gap-3 rounded-b-lg bg-white @3xl:pt-4 dark:bg-transparent lg:gap-4 lg:pl-0 dark:lg:pt-0 xl:grid-cols-[48px_1fr]"
//             >
//               <figure className="dark:mt-4">
//                 <Avatar
//                   name="صادق"
//                   // initials={initials}
//                   src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-14.webp"
//                   className="!h-8 !w-8 bg-[#70C5E0] font-medium text-white xl:!h-12 xl:!w-12"
//                 />
//               </figure>
//               <div
//                 className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 2xl:p-5"
//                 style={{
//                   maxWidth: formWidth(),
//                 }}
//               >
//                 <Form<FormValues>
//                   onSubmit={onSubmit}
//                   validationSchema={FormSchema}
//                 >
//                   {({ control, watch, formState: { errors } }) => {
//                     return (
//                       <>
//                         {/* <div className="relative mb-2.5 flex items-center justify-between">
//                           <Select
//                             size="sm"
//                             variant="outline"
//                             value={supportType}
//                             options={supportOptionTypes}
//                             onChange={setSupportType}
//                             getOptionValue={(option) => option.value}
//                             displayValue={(selected: string) => {
//                               return supportTypes[selected].name;
//                             }}
//                             suffix={
//                               <PiCaretDownBold className="ml-1 h-3 w-3" />
//                             }
//                             placement="bottom-start"
//                             useContainerWidth={false}
//                             dropdownClassName="p-2 gap-1 grid w-20"
//                             selectClassName="bg-gray-0 dark:bg-gray-50"
//                             placeholder="پبام"
//                           />
//                           <Button
//                             isLoading={sendBtnLoading}
//                             type="submit"
//                             className="dark:bg-gray-200 dark:text-white"
//                           >
//                             ارسال
//                           </Button>
//                         </div> */}
//                         {supportType === supportTypes.Email.value && (
//                           <div className="mb-2.5 flex items-center gap-2">
//                             <LuReply />
//                             <span className="rounded border border-gray-200 px-1.5 py-1 lowercase">
//                               {/*@ts-ignore*/}
//                               {messages?.email}
//                             </span>
//                           </div>
//                         )}
//
//                         <Controller
//                           control={control}
//                           name="message"
//                           render={({ field: { onChange, value } }) => (
//                             <QuillEditor
//                               value={value}
//                               onChange={onChange}
//                               className="rounded-md bg-gray-0 dark:bg-gray-50 [&>.ql-container_.ql-editor]:min-h-[100px] [&>.ql-toolbar]:3xl:overflow-x-auto"
//                             />
//                           )}
//                         />
//                         <div className="mt-4 flex items-center justify-end">
//                           <Button
//                             variant="solid"
//                             size="DEFAULT"
//                             className="gap-2"
//                             onClick={() =>
//                               document
//                                 .getElementById('attachment-upload')
//                                 ?.click()
//                             }
//                           >
//                             انتخاب فایل
//                             <MdAttachFile className="h-4 w-4" />
//                           </Button>
//                           <input
//                             type="file"
//                             multiple
//                             accept=".png,.jpg,.jpeg,.pdf,.docx,.xlsx,.txt,.zip,.rar"
//                             onChange={handleFileUpload}
//                             className="hidden"
//                             id="attachment-upload"
//                           />
//                           {/* <input
//                             type="file"
//                             multiple
//                             accept=".png,.jpg,.jpeg,.pdf,.docx,.xlsx,.txt,.zip,.rar"
//                             onChange={handleFileUpload}
//                             className="hidden"
//                             id="attachment-upload"
//                           />
//                           <label
//                             htmlFor="attachment-upload"
//                             className="cursor-pointer"
//                           >
//                             <PiPaperclipLight className="h-6 w-6 text-gray-600" />
//                             افزودن فایل
//                           </label> */}
//                         </div>
//                         <div>
//                           <Button
//                             isLoading={sendBtnLoading}
//                             type="submit"
//                             disabled={
//                               !watch('message')?.trim() || sendBtnLoading
//                             }
//                             className="mt-6 dark:bg-gray-200 dark:text-white"
//                           >
//                             ارسال
//                           </Button>
//                         </div>
//                         <div className="mt-4 grid grid-cols-1 gap-2">
//                           {attachments.map((file, index) => (
//                             <div
//                               key={index}
//                               className="flex items-center gap-2 rounded border border-gray-200 p-2"
//                             >
//                               <span>{file.name}</span>
//                               <button
//                                 type="button"
//                                 onClick={() => removeAttachment(index)}
//                                 className="text-red-500"
//                               >
//                                 <PiXCircle className="h-4 w-4" />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       </>
//                     );
//                   }}
//                 </Form>
//               </div>
//             </div>
//             }
//           </>
//         ) : (
//           <div className="h-100 mt-2 flex flex-col items-center justify-center">
//             <Image
//               src={ticketSelectionImg}
//               alt="ticket selection image"
//               className="mb-4 h-64 w-auto"
//             />
//             <p className="text-center text-lg">
//               لطفا یکی از تیکت‌های خود را برای نمایش انتخاب کنید
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
//
// export function DotSeparator({ ...props }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="4"
//       height="4"
//       viewBox="0 0 4 4"
//       fill="none"
//       {...props}
//     >
//       <circle cx="2" cy="2" r="2" fill="#D9D9D9" />
//     </svg>
//   );
// }

'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { z } from 'zod';
import { LuReply, LuTicket } from 'react-icons/lu';
import { useState, useEffect, useRef } from 'react';
import {
  PiCaretDownBold,
  PiChatCircleDots,
  PiCheck,
  PiHash,
  PiInfo,
  PiPaperPlaneRightFill,
  PiPaperclipLight,
  PiXCircle,
} from 'react-icons/pi';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  dataAtom,
  messageIdAtom,
  ticketInfoAtom,
  ticketStatsAtom,
} from '@/app/shared/support/inbox/message-list';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Empty } from '@/components/ui/empty';
import ActionDropdown from '@/app/shared/support/inbox/action-dropdown';
import Select from '@/components/ui/select';
import MessageBody from '@/app/shared/support/inbox/message-body';
import cn from '@/utils/class-names';
import SimpleBar from '@/components/ui/simplebar';
import dynamic from 'next/dynamic';
import { SupportType, supportTypes } from '@/data/support-inbox';
import Spinner from '@/components/ui/spinner';
import { toast } from 'react-hot-toast';
import useAxiosPrivate from '@/hooks/use-axios-private';
import { isUUID } from '@/utils/is-uuid';
import { Tooltip } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';
import { AiTwotoneCloseCircle } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import styles from './support-theme.module.css';
const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
});

const FormSchema = z.object({
  message: z.string({ required_error: 'پیام نمی‌تواند خالی باشد' }),
});

type FormValues = {
  message: string;
};

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

const priorityOptions = [
  {
    value: 'Low',
    name: 'Low',
    label: (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge renderAsDot color="success" />
          <span>کم</span>
        </div>
    ),
  },
  {
    value: 'Medium',
    name: 'Medium',
    label: (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge renderAsDot color="warning" />
          <span>متوسط</span>
        </div>
    ),
  },
  {
    value: 'High',
    name: 'High',
    label: (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge renderAsDot color="danger" />
          <span>بالا</span>
        </div>
    ),
  },
];

const agents = [
  {
    value: 'MANAGEMENT',
    name: 'مدیریت',
    label: (
        <div className="flex items-center gap-2">
          <Avatar
              src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-10.webp"
              name="John Doe"
              className="!h-6 !w-6 rounded-full"
          />
          <span className="whitespace-nowrap text-xs sm:text-sm">مدیریت</span>
        </div>
    ),
  },
  {
    value: 'SUPPORT',
    name: 'پشتیبانی فنی',
    label: (
        <div className="flex items-center gap-2">
          <Avatar
              src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-13.webp"
              name="John Doe"
              className="!h-6 !w-6 rounded-full"
          />
          <span className="whitespace-nowrap text-xs sm:text-sm">
          پشتیبانی فنی
        </span>
        </div>
    ),
  },
  {
    value: 'FINANCE',
    name: 'مالی و اعتباری',
    label: (
        <div className="flex items-center gap-2">
          <Avatar
              src="https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/public/avatars-blur/avatar-04.webp"
              name="John Doe"
              className="!h-6 !w-6 rounded-full"
          />
          <span className="whitespace-nowrap text-xs sm:text-sm">
          مالی و اعتباری
        </span>
        </div>
    ),
  },
];

const contactStatuses = [
  {
    value: 'عمومی',
    name: 'GENERAL',
  },
  {
    value: 'فنی',
    name: 'TECHNICAL',
  },
  {
    value: 'مالی و اعتباری',
    name: 'FINANCE',
  },
];

const supportOptionTypes = [
  {
    value: supportTypes.Chat.value,
    name: supportTypes.Chat.name,
  },
  {
    value: supportTypes.Email.value,
    name: supportTypes.Email.name,
  },
];

const departmentNames: Record<string, string> = {
  MANAGEMENT: 'مدیریت',
  SUPPORT: 'پشتیبانی فنی',
  FINANCE: 'مالی و اعتباری',
};

const categoryNames: Record<string, string> = {
  GENERAL: 'عمومی',
  TECHNICAL: 'فنی',
  FINANCIAL: 'مالی و اعتباری',
  FINANCE: 'مالی و اعتباری',
};

const priorityNames: Record<string, string> = {
  LOW: 'اولویت کم',
  Low: 'اولویت کم',
  MEDIUM: 'اولویت متوسط',
  Medium: 'اولویت متوسط',
  HIGH: 'اولویت بالا',
  High: 'اولویت بالا',
};

function ticketStatusStyle(status?: string) {
  if (status === 'CLOSED') return 'border-gray-200 bg-gray-100 text-gray-600';
  if (status === 'ANSWERED') return styles.answered;
  return styles.pending;
}

export default function MessageDetails({ className }: { className?: string }) {
  const data = useAtomValue(dataAtom);
  const setData = useSetAtom(dataAtom);
  const [priority, setPriority] = useState('');
  const messageId = useAtomValue(messageIdAtom);
  const storedTicket = useAtomValue(ticketInfoAtom);
  const setTicketStats = useSetAtom(ticketStatsAtom);
  const router = useRouter();
  const scrollOnMessagesUpdateRef = useRef(false);
  const conversationScrollRef = useRef<HTMLDivElement>(null);

  const selectedTicket =
    data?.find((t: any) => t.id === messageId) ||
    (storedTicket?.id === messageId ? storedTicket : undefined);
  const [agent, setAgent] = useState(
      (selectedTicket &&
          selectedTicket.department &&
          agents.find((a) => a.value === selectedTicket?.department)) ||
      null
  );
  const [contactStatus, setContactStatus] = useState(
      (selectedTicket &&
          selectedTicket.priority &&
          contactStatuses.find((c) => c.value === selectedTicket?.priority)) ||
      contactStatuses[0].value
  );

  const [messages, setMessages] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sendBtnLoading, setSendBtnLoading] = useState(false);
  const [closeTicketLoading, setCloseTicketLoading] = useState(false);
  const [changed, setChanged] = useState<boolean>(false);
  const [formResetValues, setFormResetValues] = useState<FormValues | null>(
    null
  );
  const _axios = useAxiosPrivate();
  const [showMessages, setShowMessages] = useState(false);
  const [state, copyToClipboard] = useCopyToClipboard();
  const [supportType, setSupportType] = useState<SupportType | string>(
      supportTypes.Chat.value
  );

  // Function to refresh ticket stats after closing a ticket
  const refreshTicketStats = async () => {
    try {
      const response = await _axios.get(`/ticket/stats`);
      if (response.data.status === 'SUCCESS') {
        setTicketStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  };

  // Handle closing a ticket
  const handleCloseTicket = async () => {
    if (!messageId) return;

    try {
      setCloseTicketLoading(true);
      const response = await _axios.put(`/ticket/${messageId}/close`);

      if (response.data.status === 'SUCCESS') {
        toast.success('تیکت با موفقیت بسته شد');
        // Update the ticket in the UI
        if (selectedTicket) {
          selectedTicket.status = "CLOSED";
          selectedTicket.statusStr = "بسته";
        }
        // Refresh ticket stats to update counts
        await refreshTicketStats();
        // Force re-render
        setChanged(!changed);
        // Optionally refresh the page or redirect
        // router.refresh();
      } else {
        throw new Error(response.data.message || 'خطا در بستن تیکت');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('خطا در بستن تیکت');
    } finally {
      setCloseTicketLoading(false);
    }
  };

  useEffect(() => {
    scrollOnMessagesUpdateRef.current = true;
  }, [messageId]);

  useEffect(() => {
    if (!showMessages || messages.length === 0 || !scrollOnMessagesUpdateRef.current) {
      return;
    }

    scrollOnMessagesUpdateRef.current = false;

    requestAnimationFrame(() => {
      const conversation = conversationScrollRef.current;
      conversation?.scrollTo({
        top: conversation.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages, showMessages]);

  useEffect(() => {
    const fetchTicketMessages = async () => {
      if (!messageId) return;
      try {
        const response = await _axios.get(`/ticket/${messageId}/messages`);
        if (response.data.status === 'SUCCESS') {
          setMessages(response.data.data);
          setShowMessages(true);
          // setTotalItems(response.data.pagination.totalElements);
        }
      } catch (error) {
        setShowMessages(false);
        console.error('Error fetching ticket data:', error);
        toast.error('خطا در دریافت تیکت‌ها');
      }
      return () => setShowMessages(false);
    };
    if (isUUID(messageId)) fetchTicketMessages();
  }, [messageId, changed, _axios]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const totalFiles = [...attachments, ...newFiles];
      if (totalFiles.length > MAX_ATTACHMENTS) {
        toast.error('شما فقط مجاز به ارسال ۳ فایل هستید!');
        return;
      }
      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} دارای حجمی بیشتر از ۸ مگابایت است.`);
          return;
        }
      }
      setAttachments(totalFiles);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // set default selected message when render complete
  useEffect(() => {
    // setFormWidth(width);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 500 milliseconds
    return () => clearTimeout(timer);
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    console.log(formData);
    setSendBtnLoading(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('messageContent', formData.message);
      attachments.forEach((file, index) => {
        formDataPayload.append(`attachments`, file);
      });

      const response = await _axios.post(
          `/ticket/${messageId}/messages`,
          formDataPayload
      );

      if (response.data.status === 'SUCCESS') {
        toast.success('پیام با موفقیت ارسال شد');
        setAttachments([]);
        setFormResetValues({ message: '' });
        setData((prev: any[]) =>
          prev.map((ticket: any) =>
            ticket.id === messageId
              ? {
                  ...ticket,
                  status: 'PENDING',
                  statusStr: 'در انتظار پاسخ',
                }
              : ticket
          )
        );
        scrollOnMessagesUpdateRef.current = true;
        setChanged((current) => !current);
      } else {
        throw new Error('Failed to send message: ', response?.data?.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام');
    } finally {
      setSendBtnLoading(false);
    }
  };
  const handleCopyToClipboard = (id: string) => {
    copyToClipboard(id as string);
    if (!state.error && state.value) {
      setIsCopied(() => true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000); // 3 seconds
    }
  };

  if (isLoading) {
    return (
        <div
            className={cn(
                '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
                className
            )}
        >
          <Spinner size="xl" />
        </div>
    );
  }

  if (!messages) {
    return (
        <div
            className={cn(
                '!grid h-full min-h-[128px] flex-grow place-content-center items-center justify-center',
                className
            )}
        >
          <Empty
              text="No conversations selected"
              textClassName="mt-4 text-base text-gray-500"
          />
        </div>
    );
  }

  return (
      <div
          className={cn(
              'relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-0 shadow-sm dark:bg-gray-50',
              className
          )}
      >
        <div>
          <header className="flex flex-col justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-6 2xl:flex-row 2xl:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-primary text-white shadow-sm">
                <PiChatCircleDots className="h-5 w-5" />
              </span>
              {selectedTicket && (
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Text tag="h4" className="font-bold text-gray-900">
                        {selectedTicket.subject}
                      </Text>
                      <Badge
                          variant="outline"
                          size="sm"
                          className={cn(
                            'w-auto min-w-min rounded-full px-2.5 py-1 text-[11px]',
                            ticketStatusStyle(selectedTicket.status)
                          )}
                      >
                        {selectedTicket?.statusStr || 'در انتظار پاسخ'}
                      </Badge>
                    </div>
                    <span className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                      <PiHash className="h-3.5 w-3.5" />
                      <span>{selectedTicket?.ticketRefId}</span>
                      <Tooltip
                          size="sm"
                          rounded="sm"
                          placement="top"
                          content={() => (isCopied ? 'کپی شده' : 'کپی شود')}
                      >
                    <button
                        type="button"
                        aria-label="کپی شماره تیکت"
                        onClick={() =>
                            handleCopyToClipboard(selectedTicket?.ticketRefId)
                        }
                        className="rounded-md p-1 transition-colors hover:bg-gray-200"
                    >
                      {isCopied ? (
                          <PiCheck className="h-4 w-4 text-green-dark" />
                      ) : (
                          <HiOutlineClipboardDocument className="h-4 w-4" />
                      )}
                    </button>
                  </Tooltip>
                </span>
                  </div>
              )}
            </div>

            {selectedTicket && (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-lg border border-gray-200 bg-gray-0 px-3 py-2">
                      {departmentNames[selectedTicket.department] ||
                        selectedTicket.departmentStr ||
                        'پشتیبانی'}
                    </span>
                    <span className="rounded-lg border border-gray-200 bg-gray-0 px-3 py-2">
                      {categoryNames[selectedTicket.category] ||
                        selectedTicket.categoryStr ||
                        'عمومی'}
                    </span>
                    <span className="rounded-lg border border-gray-200 bg-gray-0 px-3 py-2">
                      {priorityNames[selectedTicket.priority] ||
                        selectedTicket.priorityStr ||
                        'اولویت معمولی'}
                    </span>
                  </div>
                  {selectedTicket.status !== "CLOSED" && (
                      <Button
                          variant="outline"
                          color="danger"
                          type="button"
                          size="sm"
                          className="group flex items-center gap-1 rounded-lg"
                          isLoading={closeTicketLoading}
                          onClick={handleCloseTicket}
                      >
                        بستن تیکت
                        {!closeTicketLoading && (
                            <AiTwotoneCloseCircle
                                className="text-red-light transition-all group-hover:scale-110 group-active:scale-95"
                                size={20}
                            />
                        )}
                      </Button>
                  )}
                </div>
            )}
          </header>
          {showMessages ? (
              <>
                <div className={`${styles.conversation} [&_.simplebar-content]:py-5`}>
                  <SimpleBar 
                    scrollableNodeProps={{ ref: conversationScrollRef, tabIndex: 0, 'aria-label': 'پیام‌های تیکت' }}
                    className="min-h-[300px] max-h-[50vh] xl:h-[calc(100dvh-32rem)] xl:min-h-[360px] xl:max-h-[600px] [&_.simplebar-track.simplebar-vertical]:bottom-3 [&_.simplebar-track.simplebar-vertical]:top-3"
                    style={{
                      '--scrollbar-width': '8px',
                      '--scrollbar-thumb-bg': 'rgb(var(--gray-300))',
                      '--scrollbar-thumb-hover-bg': 'rgb(var(--gray-400))',
                      '--scrollbar-track-bg': 'rgb(var(--gray-100))',
                    } as React.CSSProperties}
                  >
                    <MessageBody messages={messages} />
                  </SimpleBar>
                </div>

                {selectedTicket && selectedTicket.status !== "CLOSED" && (
                  <section className="border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mb-3">
                      <div>
                        <Text tag="h4" className="font-bold text-gray-900">
                          پاسخ به تیکت
                        </Text>
                        <p className="mt-1 text-xs text-gray-500">
                          پاسخ شما در ادامه همین گفت‌وگو ثبت می‌شود.
                        </p>
                      </div>
                    </div>

                    <Form<FormValues>
                      onSubmit={onSubmit}
                      validationSchema={FormSchema}
                      resetValues={formResetValues}
                    >
                      {({ control, watch, formState: { errors } }) => (
                        <>
                          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                            <Controller
                              control={control}
                              name="message"
                              render={({ field: { onChange, value } }) => (
                                <QuillEditor
                                  value={value}
                                  onChange={onChange}
                                  className="border-0 bg-gray-0 [&>.ql-container]:border-0 [&>.ql-container_.ql-editor]:min-h-[90px] [&>.ql-container_.ql-editor]:max-h-[160px] [&>.ql-toolbar]:overflow-x-auto [&>.ql-toolbar]:border-0 [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-gray-100 [&>.ql-toolbar]:whitespace-nowrap"
                                />
                              )}
                            />
                          </div>
                          {errors.message?.message && (
                            <p className="mt-1.5 text-xs text-red-light">
                              {errors.message.message}
                            </p>
                          )}

                          {attachments.length > 0 && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {attachments.map((file, index) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-0 p-2.5"
                                >
                                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-primary-lighter text-primary">
                                    <PiPaperclipLight className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-medium text-gray-700">
                                      {file.name}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-gray-400">
                                      {(file.size / (1024 * 1024)).toLocaleString('fa-IR', {
                                        maximumFractionDigits: 1,
                                      })}{' '}
                                      مگابایت
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`حذف ${file.name}`}
                                    onClick={() => removeAttachment(index)}
                                    className="grid h-7 w-7 flex-none place-items-center rounded-lg text-gray-400 transition-colors hover:bg-red-lighter hover:text-red"
                                  >
                                    <PiXCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-lg"
                                onClick={() =>
                                  document
                                    .getElementById('ticket-reply-attachment-upload')
                                    ?.click()
                                }
                              >
                                <PiPaperclipLight className="h-4 w-4" />
                                افزودن فایل
                              </Button>
                              <input
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf,.docx,.xlsx,.txt,.zip,.rar"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="ticket-reply-attachment-upload"
                              />
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                <PiInfo className="h-3 w-3" />
                                {attachments.length.toLocaleString('fa-IR')} از ۳ فایل؛ هر فایل تا ۸ مگابایت
                              </span>
                            </div>
                            <Button
                              isLoading={sendBtnLoading}
                              type="submit"
                              size="sm"
                              color="primary"
                              disabled={!watch('message')?.trim() || sendBtnLoading}
                              className="gap-2 rounded-lg px-5"
                            >
                              {!sendBtnLoading && (
                                <PiPaperPlaneRightFill className="h-4 w-4 rotate-180" />
                              )}
                              ارسال پاسخ
                            </Button>
                          </div>
                        </>
                      )}
                    </Form>
                  </section>
                )}
              </>
          ) : (
              <div className="grid min-h-[430px] place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-lighter text-primary">
                    <PiChatCircleDots className="h-8 w-8" />
                  </span>
                  <Text tag="h4" className="mt-4 font-bold text-gray-800">
                    یک تیکت را انتخاب کنید
                  </Text>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    گفتگو و جزئیات درخواست انتخاب‌شده اینجا نمایش داده می‌شود.
                  </p>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

export function DotSeparator({ ...props }) {
  return (
      <svg
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="4"
          viewBox="0 0 4 4"
          fill="none"
          {...props}
      >
        <circle cx="2" cy="2" r="2" fill="#D9D9D9" />
      </svg>
  );
}
