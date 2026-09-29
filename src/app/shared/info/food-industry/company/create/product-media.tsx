// // import dynamic from 'next/dynamic';
// // import PencilIcon from '@/components/icons/pencil';
// // import { Textarea } from '@/components/ui/textarea';
// // import { useState } from 'react';
// // import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// // import FormGroup from '@/app/shared/form-group';
// // import cn from '@/utils/class-names';
// // import { ActionIcon, Button, Text } from 'rizzui';
// // import { HiXMark } from 'react-icons/hi2';
// // import ProductAvailability from './product-availability';
// // import ProductAccordion from './product-accordion';
// // import 'swiper/css';
// // import 'swiper/css/navigation';
// // import 'swiper/css/pagination';
// //
// // interface ProductMediaProps {
// //   className?: string;
// // }
// //
// // export default function ProductMedia({ className }: ProductMediaProps) {
// //   const {
// //     control,
// //     formState: { errors },
// //     register,
// //     watch,
// //     getValues,
// //   } = useFormContext();
// //
// //   const {
// //     fields: products,
// //     append: appendProduct,
// //     remove: removeProduct,
// //     update: updateProduct,
// //   } = useFieldArray({ control, name: 'products' });
// //
// //   const {
// //     fields: outSourcedProducts,
// //     append: appendOutSourcedProduct,
// //     remove: removeOutSourcedProduct,
// //     update: updateOutSourcedProduct,
// //   } = useFieldArray({ control, name: 'outSourcedProducts' });
// //
// //   const [modalState, setModalState] = useState({ isOpen: false, type: 0 });
// //   const watchedProductAvailability = watch('productAvailability', '2');
// //
// //   // Function to handle image selection/upload - would need to be implemented based on your backend
// //   const handleImageSelection = async (index, files) => {
// //     // This is a placeholder - implement your actual image upload logic here
// //     console.log("Uploading files for product index", index, files);
// //
// //     // Return some kind of identifiers for the uploaded files
// //     // In a real implementation, this would call your upload API and return the file IDs
// //     return files.map((file, i) => ({
// //       id: `temp-${Date.now()}-${i}`,
// //       name: file.name,
// //       filePath: URL.createObjectURL(file)
// //     }));
// //   };
// //
// //   return (
// //     <FormGroup
// //       title="مدیریت محصولات و خدمات"
// //       description="محصولات و خدمات شرکت خود را ثبت کنید"
// //       className={cn(className)}
// //     >
// //       <ProductAvailability />
// //
// //       {/* Preview Buttons */}
// //       {watchedProductAvailability === '1' ? (
// //         <>
// //           <Textarea label="عنوان محصولات (خدمات)" {...register('productTitles')} error={errors.productTitles?.message as string} rows={3} />
// //           <Textarea label="توضیحات محصولات (خدمات)" {...register('productsDescription')} error={errors.productsDescription?.message as string} rows={3} />
// //           <Textarea label="عنوان محصولات برون‌سپاری" {...register('outSourcedProductTitles')} error={errors.outSourcedProductTitles?.message as string} rows={3} />
// //         </>
// //       ) : (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
// //           {/* Fixed button 1 - Better padding and height control */}
// //           <div className="flex flex-col items-stretch p-8 bg-white rounded-lg shadow">
// //             <Button
// //               variant="outline"
// //               color="secondary"
// //               className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
// //               onClick={() => setModalState({ isOpen: true, type: 0 })}
// //             >
// //               <span className="block">محصولات و خدمات</span>
// //             </Button>
// //             <Text className="mt-4 text-sm text-gray-500 text-center">ثبت شده: {products.length}</Text>
// //           </div>
// //
// //           {/* Fixed button 2 - Better padding and height control */}
// //           <div className="flex flex-col items-stretch p-8 bg-white rounded-lg shadow">
// //             <Button
// //               variant="outline"
// //               color="secondary"
// //               className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
// //               onClick={() => setModalState({ isOpen: true, type: 1 })}
// //             >
// //               <span className="block">محصولات برون‌سپاری‌شده</span>
// //             </Button>
// //             <Text className="mt-4 text-sm text-gray-500 text-center">ثبت شده: {outSourcedProducts.length}</Text>
// //           </div>
// //         </div>
// //       )}
// //
// //       {/* Modal */}
// //       <Modal
// //         isOpen={modalState.isOpen}
// //         onClose={() => setModalState({ ...modalState, isOpen: false })}
// //         className="flex items-center justify-center p-4"
// //       >
// //         <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
// //           <div className="flex justify-between items-center border-b px-6 py-4">
// //             <Text className="text-lg font-semibold">{modalState.type === 1 ? 'محصولات برون‌سپاری‌شده' : 'محصولات و خدمات'}</Text>
// //             <ActionIcon size="lg" onClick={() => setModalState({ ...modalState, isOpen: false })}>
// //               <HiXMark className="h-6 w-6" />
// //             </ActionIcon>
// //           </div>
// //           <div className="px-6 py-5 overflow-auto flex-1">
// //             <ProductAccordion
// //               products={modalState.type === 1 ? outSourcedProducts : products}
// //               append={modalState.type === 1 ? appendOutSourcedProduct : appendProduct}
// //               remove={modalState.type === 1 ? removeOutSourcedProduct : removeProduct}
// //               update={modalState.type === 1 ? updateOutSourcedProduct : updateProduct}
// //               handleImageSelection={handleImageSelection}
// //               dataObjectName={modalState.type === 1 ? 'outSourcedProducts' : 'products'}
// //             />
// //           </div>
// //         </div>
// //       </Modal>
// //     </FormGroup>
// //   );
// // }
// //
// // // You'll need to implement or import Modal component if it's not already available
// // const Modal = ({ isOpen, onClose, children, className }) => {
// //   if (!isOpen) return null;
// //
// //   return (
// //     <div className="fixed inset-0 z-50 overflow-y-auto">
// //       <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
// //         <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose} />
// //         <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 ${className}`}>
// //           {children}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };
//
// import dynamic from 'next/dynamic';
// import PencilIcon from '@/components/icons/pencil';
// import { Textarea } from '@/components/ui/textarea';
// import { useState, useCallback, useEffect } from 'react';
// import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// import FormGroup from '@/app/shared/form-group';
// import cn from '@/utils/class-names';
// import { ActionIcon, Button, Text } from 'rizzui';
// import { HiXMark } from 'react-icons/hi2';
// import ProductAvailability from './product-availability';
// import ProductAccordion from './product-accordion';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import useFileUploadService from '@/hooks/useFileUploadService';
// import useProductService from '@/hooks/useProductService';
//
// interface ProductMediaProps {
//   className?: string;
// }
//
// export default function ProductMedia({ className }: ProductMediaProps) {
//   const {
//     control,
//     formState: { errors },
//     register,
//     watch,
//     getValues,
//     setValue,
//   } = useFormContext();
//
//   const fileUploadService = useFileUploadService();
//   const productService = useProductService();
//
//   const {
//     fields: products,
//     append: appendProduct,
//     remove: removeProduct,
//     update: updateProduct,
//   } = useFieldArray({ control, name: 'products', keyName: 'fieldId' });
//
//   const {
//     fields: outSourcedProducts,
//     append: appendOutSourcedProduct,
//     remove: removeOutSourcedProduct,
//     update: updateOutSourcedProduct,
//   } = useFieldArray({ control, name: 'outSourcedProducts', keyName: 'fieldId' });
//
//   const [modalState, setModalState] = useState({ isOpen: false, type: 0 });
//   const watchedProductAvailability = watch('productAvailability', '2');
//
//   // This is a helper function to handle file uploads
//   const handleImageSelection = useCallback(async (index, files) => {
//     try {
//       if (!files || files.length === 0) return [];
//
//       // Use the file upload service from our hook
//       const uploadPromises = Array.from(files).map(file => {
//         const formData = new FormData();
//         formData.append('files', file);
//         formData.append('fileServiceType', 'PRODUCT_PICTURE');
//         return fileUploadService.uploadFile(formData);
//       });
//
//       const results = await Promise.all(uploadPromises);
//
//       // Return file identifiers in a format your backend expects
//       return results.map(res => ({
//         id: res.data.id,
//         name: res.data.name,
//         filePath: res.data.filePath,
//         url: res.data.url || fileUploadService.getFileUrl(res.data.filePath)
//       }));
//     } catch (error) {
//       console.error('Error uploading product images:', error);
//       return [];
//     }
//   }, [fileUploadService]);
//
//   // // Show first panel automatically on initial load if no products exist
//   // useEffect(() => {
//   //   if (modalState.isOpen === false && watchedProductAvailability === '2' &&
//   //       products.length === 0 && outSourcedProducts.length === 0) {
//   //     setTimeout(() => {
//   //       setModalState({ isOpen: true, type: 0 });
//   //     }, 500);
//   //   }
//   // }, [products.length, outSourcedProducts.length, modalState.isOpen, watchedProductAvailability]);
//
//   return (
//       <FormGroup
//           title="مدیریت محصولات و خدمات"
//           description="محصولات و خدمات شرکت خود را ثبت کنید"
//           className={cn(className)}
//       >
//         <ProductAvailability />
//
//         {/* Products UI based on availability selection */}
//         {watchedProductAvailability === '1' ? (
//             <>
//               <Textarea
//                   label="عنوان محصولات (خدمات)"
//                   {...register('productTitles')}
//                   error={errors.productTitles?.message as string}
//                   rows={3}
//                   placeholder="محصولات یا خدمات اصلی شرکت را وارد کنید"
//               />
//               <Textarea
//                   label="توضیحات محصولات (خدمات)"
//                   {...register('productsDescription')}
//                   error={errors.productsDescription?.message as string}
//                   rows={3}
//                   placeholder="توضیحات تکمیلی در مورد محصولات یا خدمات"
//               />
//               <Textarea
//                   label="عنوان محصولات برون‌سپاری"
//                   {...register('outSourcedProductTitles')}
//                   error={errors.outSourcedProductTitles?.message as string}
//                   rows={3}
//                   placeholder="محصولات یا خدماتی که به صورت برون‌سپاری ارائه می‌کنید"
//               />
//             </>
//         ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
//               {/* Main Products Button */}
//               <div className="flex flex-col items-stretch rounded-lg border border-gray-200 bg-gray-0 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-300 dark:bg-gray-50">
//                 <Button
//                     variant="outline"
//                     color="primary"
//                     className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
//                     onClick={() => setModalState({ isOpen: true, type: 0 })}
//                 >
//                   <span className="block">محصولات و خدمات</span>
//                   <span className="mt-1 text-sm font-normal text-gray-500">مدیریت محصولات اصلی شرکت</span>
//                 </Button>
//                 <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-100">
//                   <Text className="text-sm text-gray-600 text-center">
//                     <span className="font-medium text-gray-800">{products.length}</span> محصول ثبت شده
//                   </Text>
//                   {products.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-2 justify-center">
//                         {products.slice(0, 3).map((product, index) => (
//                             <span key={index} className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
//                       {product.name}
//                     </span>
//                         ))}
//                         {products.length > 3 && (
//                             <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
//                       +{products.length - 3}
//                     </span>
//                         )}
//                       </div>
//                   )}
//                 </div>
//               </div>
//
//               {/* Outsourced Products Button */}
//               <div className="flex flex-col items-stretch rounded-lg border border-gray-200 bg-gray-0 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-300 dark:bg-gray-50">
//                 <Button
//                     variant="outline"
//                     color="secondary"
//                     className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
//                     onClick={() => setModalState({ isOpen: true, type: 1 })}
//                 >
//                   <span className="block">محصولات برون‌سپاری‌شده</span>
//                   <span className="mt-1 text-sm font-normal text-gray-500">محصولاتی که توسط دیگران تولید می‌شود</span>
//                 </Button>
//                 <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-100">
//                   <Text className="text-sm text-gray-600 text-center">
//                     <span className="font-medium text-gray-800">{outSourcedProducts.length}</span> محصول ثبت شده
//                   </Text>
//                   {outSourcedProducts.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-2 justify-center">
//                         {outSourcedProducts.slice(0, 3).map((product, index) => (
//                             <span key={index} className="inline-flex items-center rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-medium text-secondary-700">
//                       {product.name}
//                     </span>
//                         ))}
//                         {outSourcedProducts.length > 3 && (
//                             <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
//                       +{outSourcedProducts.length - 3}
//                     </span>
//                         )}
//                       </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//         )}
//
//         {/* Modal for Product Management */}
//         <Modal
//             isOpen={modalState.isOpen}
//             onClose={() => setModalState({ ...modalState, isOpen: false })}
//             className="flex items-center justify-center p-4"
//         >
//           <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-gray-0 shadow-xl dark:bg-gray-100">
//             <div className="flex justify-between items-center border-b px-6 py-4">
//               <Text className="text-lg font-semibold">
//                 {modalState.type === 1 ? 'محصولات برون‌سپاری‌شده' : 'محصولات و خدمات'}
//               </Text>
//               <ActionIcon
//                   size="lg"
//                   variant="text"
//                   onClick={() => setModalState({ ...modalState, isOpen: false })}
//                   className="hover:bg-gray-100 rounded-full"
//               >
//                 <HiXMark className="h-6 w-6" />
//               </ActionIcon>
//             </div>
//             <div className="px-6 py-5 overflow-auto flex-1">
//               <ProductAccordion
//                   products={modalState.type === 1 ? outSourcedProducts : products}
//                   append={modalState.type === 1 ? appendOutSourcedProduct : appendProduct}
//                   remove={modalState.type === 1 ? removeOutSourcedProduct : removeProduct}
//                   update={modalState.type === 1 ? updateOutSourcedProduct : updateProduct}
//                   handleImageSelection={handleImageSelection}
//                   dataObjectName={modalState.type === 1 ? 'outSourcedProducts' : 'products'}
//               />
//             </div>
//             <div className="px-6 py-4 border-t">
//               <div className="flex justify-end">
//                 <Button
//                     variant="outline"
//                     className="me-3"
//                     onClick={() => setModalState({ ...modalState, isOpen: false })}
//                 >
//                   بستن
//                 </Button>
//                 <Button
//                     variant="solid"
//                     color="primary"
//                     onClick={() => {
//                       // When closing the modal, process the products for submission
//                       if (modalState.type === 0) {
//                         // Process regular products for submission
//                         const processedProducts = productService.prepareProductsForSubmission(
//                             getValues('products') || [],
//                             []
//                         ).products;
//                         setValue('products', processedProducts);
//                       } else {
//                         // Process outsourced products for submission
//                         const processedProducts = productService.prepareProductsForSubmission(
//                             [],
//                             getValues('outSourcedProducts') || []
//                         ).outSourcedProducts;
//                         setValue('outSourcedProducts', processedProducts);
//                       }
//                       setModalState({ ...modalState, isOpen: false });
//                     }}
//                 >
//                   تایید و بازگشت
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Modal>
//       </FormGroup>
//   );
// }
//
// // Modal component implementation
// const Modal = ({ isOpen, onClose, children, className }) => {
//   if (!isOpen) return null;
//
//   return (
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
//           <div
//               className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
//               onClick={onClose}
//           />
//           <div className={`relative transform overflow-hidden rounded-lg bg-gray-0 text-left shadow-xl transition-all dark:bg-gray-100 sm:my-8 ${className}`}>
//             {children}
//           </div>
//         </div>
//       </div>
//   );
// };
import { STATIC_FILES_URL } from '@/config/api.config';
import dynamic from 'next/dynamic';
import PencilIcon from '@/components/icons/pencil';
import { Textarea } from '@/components/ui/textarea';
import { useState, useCallback, useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { ActionIcon, Button, Text } from 'rizzui';
import { HiXMark } from 'react-icons/hi2';
import ProductAvailability from './product-availability';
import ProductAccordion from './product-accordion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useFileUploadService from '@/hooks/useFileUploadService';
import useProductService from '@/hooks/useProductService';

interface ProductMediaProps {
  className?: string;
}

export default function ProductMedia({ className }: ProductMediaProps) {
  const {
    control,
    formState: { errors },
    register,
    watch,
    getValues,
    setValue,
  } = useFormContext();

  const fileUploadService = useFileUploadService();
  const productService = useProductService();

  const {
    fields: products,
    append: appendProduct,
    remove: removeProduct,
    update: updateProduct,
  } = useFieldArray({ control, name: 'products', keyName: 'fieldId' });

  const {
    fields: outSourcedProducts,
    append: appendOutSourcedProduct,
    remove: removeOutSourcedProduct,
    update: updateOutSourcedProduct,
  } = useFieldArray({ control, name: 'outSourcedProducts', keyName: 'fieldId' });

  const [modalState, setModalState] = useState({ isOpen: false, type: 0 });
  const watchedProductAvailability = watch('productAvailability', '2');

  // This is a helper function to handle file uploads
  const handleImageSelection = useCallback(async (index: number, files: File[]) => {
    try {
      if (!files || files.length === 0) return [];

      // Upload files one by one using the correct endpoint
      const uploadPromises = Array.from(files).map(file => {
        const formData = new FormData();
        formData.append('files', file); // Use 'file' instead of 'files'
        formData.append('fileServiceType', 'PRODUCT_PICTURE');
        return fileUploadService.uploadFile(formData);
      });

      const results = await Promise.all(uploadPromises);

      // Return file identifiers in the format expected by the backend
      return results.map(res => ({
        id: res.data.id,
        name: res.data.filename || res.data.name,
        filePath: res.data.filePath,
        fileId: res.data.id,
        url: res.data.url || `${STATIC_FILES_URL}${res.data.filePath}`
      }));
    } catch (error) {
      console.error('Error uploading product images:', error);
      // Show error message to user
      return [];
    }
  }, [fileUploadService]);

  return (
      <FormGroup
          title="مدیریت محصولات و خدمات"
          description="محصولات و خدمات شرکت خود را ثبت کنید"
          className={cn(className)}
      >
        <ProductAvailability />

        {/* Products UI based on availability selection */}
        {watchedProductAvailability === '1' ? (
            <>
              <Textarea
                  label="عنوان محصولات (خدمات)*"
                  {...register('productTitles')}
                  error={errors.productTitles?.message as string}
                  rows={3}
                  placeholder="محصولات یا خدمات اصلی شرکت را وارد کنید"
              />
              <Textarea
                  label="توضیحات محصولات (خدمات)*"
                  {...register('productsDescription')}
                  error={errors.productsDescription?.message as string}
                  rows={3}
                  placeholder="توضیحات تکمیلی در مورد محصولات یا خدمات"
              />
              <Textarea
                  label="عنوان محصولات برون‌سپاری"
                  {...register('outSourcedProductTitles')}
                  error={errors.outSourcedProductTitles?.message as string}
                  rows={3}
                  placeholder="محصولات یا خدماتی که به صورت برون‌سپاری ارائه می‌کنید"
              />
            </>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Main Products Button */}
              <div className="flex flex-col items-stretch rounded-lg border border-gray-200 bg-gray-0 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-300 dark:bg-gray-50">
                <Button
                    variant="outline"
                    color="primary"
                    className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
                    onClick={() => setModalState({ isOpen: true, type: 0 })}
                >
                  <span className="block">محصولات و خدمات</span>
                  <span className="mt-1 text-sm font-normal text-gray-500">مدیریت محصولات اصلی شرکت</span>
                </Button>
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-100">
                  <Text className="text-sm text-gray-600 text-center">
                    <span className="font-medium text-gray-800">{products.length}</span> محصول ثبت شده
                  </Text>
                  {products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 justify-center">
                        {products.slice(0, 3).map((product, index) => (
                            <span key={product.fieldId || index} className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {product.name}
                    </span>
                        ))}
                        {products.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      +{products.length - 3}
                    </span>
                        )}
                      </div>
                  )}
                </div>
              </div>

              {/* Outsourced Products Button */}
              <div className="flex flex-col items-stretch rounded-lg border border-gray-200 bg-gray-0 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-300 dark:bg-gray-50">
                <Button
                    variant="outline"
                    color="secondary"
                    className="w-full h-auto min-h-16 px-4 py-6 text-base font-medium text-center break-words flex flex-col items-center justify-center"
                    onClick={() => setModalState({ isOpen: true, type: 1 })}
                >
                  <span className="block">محصولات برون‌سپاری‌شده</span>
                  <span className="mt-1 text-sm font-normal text-gray-500">محصولاتی که توسط دیگران تولید می‌شود</span>
                </Button>
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-100">
                  <Text className="text-sm text-gray-600 text-center">
                    <span className="font-medium text-gray-800">{outSourcedProducts.length}</span> محصول ثبت شده
                  </Text>
                  {outSourcedProducts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 justify-center">
                        {outSourcedProducts.slice(0, 3).map((product, index) => (
                            <span key={product.fieldId || index} className="inline-flex items-center rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-medium text-secondary-700">
                      {product.name}
                    </span>
                        ))}
                        {outSourcedProducts.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      +{outSourcedProducts.length - 3}
                    </span>
                        )}
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Modal for Product Management */}
        <Modal
            isOpen={modalState.isOpen}
            onClose={() => setModalState({ ...modalState, isOpen: false })}
            className="flex items-center justify-center p-4"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-gray-0 shadow-xl dark:bg-gray-100">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <Text className="text-lg font-semibold">
                {modalState.type === 1 ? 'محصولات برون‌سپاری‌شده' : 'محصولات و خدمات'}
              </Text>
              <ActionIcon
                  size="lg"
                  variant="text"
                  onClick={() => setModalState({ ...modalState, isOpen: false })}
                  className="hover:bg-gray-100 rounded-full"
              >
                <HiXMark className="h-6 w-6" />
              </ActionIcon>
            </div>
            <div className="px-6 py-5 overflow-auto flex-1">
              <ProductAccordion
                  products={modalState.type === 1 ? outSourcedProducts : products}
                  append={modalState.type === 1 ? appendOutSourcedProduct : appendProduct}
                  remove={modalState.type === 1 ? removeOutSourcedProduct : removeProduct}
                  update={modalState.type === 1 ? updateOutSourcedProduct : updateProduct}
                  handleImageSelection={handleImageSelection}
                  dataObjectName={modalState.type === 1 ? 'outSourcedProducts' : 'products'}
              />
            </div>
            <div className="px-6 py-4 border-t">
              <div className="flex justify-end">
                <Button
                    variant="outline"
                    className="me-3"
                    onClick={() => setModalState({ ...modalState, isOpen: false })}
                >
                  بستن
                </Button>
                <Button
                    variant="solid"
                    color="primary"
                    onClick={() => {
                      // When closing the modal, process the products for submission
                      if (modalState.type === 0) {
                        // Process regular products for submission
                        const processedProducts = productService.prepareProductsForSubmission(
                            getValues('products') || [],
                            []
                        ).products;
                        setValue('products', processedProducts);
                      } else {
                        // Process outsourced products for submission
                        const processedProducts = productService.prepareProductsForSubmission(
                            [],
                            getValues('outSourcedProducts') || []
                        ).outSourcedProducts;
                        setValue('outSourcedProducts', processedProducts);
                      }
                      setModalState({ ...modalState, isOpen: false });
                    }}
                >
                  تایید و بازگشت
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </FormGroup>
  );
}

// Modal component implementation
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
              className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
              onClick={onClose}
          />
          <div className={`relative transform overflow-hidden rounded-lg bg-gray-0 text-left shadow-xl transition-all dark:bg-gray-100 sm:my-8 ${className}`}>
            {children}
          </div>
        </div>
      </div>
  );
};
