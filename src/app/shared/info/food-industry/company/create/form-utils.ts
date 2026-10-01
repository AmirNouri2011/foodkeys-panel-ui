// import { z } from 'zod';
//
// export const customFields = [
//   {
//     label: '',
//     value: '',
//   },
// ];
// export const locationShipping = [
//   {
//     name: '',
//     shippingCharge: '',
//   },
// ];
// export const productVariants = [
//   {
//     label: '',
//     value: '',
//   },
// ];
//
// export function defaultValues(product?: CreateProductInput) {
//   return {
//     title: product?.title ?? '',
//     companyName: product?.companyName ?? '',
//     sku: product?.sku ?? '',
//     type: product?.type ?? '',
//     categories: product?.categories ?? '',
//     description: product?.description ?? '',
//     price: product?.price ?? '',
//     costPrice: product?.costPrice ?? '',
//     retailPrice: product?.retailPrice ?? '',
//     salePrice: product?.salePrice ?? '',
//     inventoryTracking: product?.inventoryTracking ?? '',
//     currentStock: product?.currentStock ?? '',
//     lowStock: product?.lowStock ?? '',
//     productAvailability: product?.productAvailability ?? '',
//     tradeNumber: product?.tradeNumber ?? '',
//     manufacturerNumber: product?.manufacturerNumber ?? '',
//     brand: product?.brand ?? '',
//     upcEan: product?.upcEan ?? '',
//     // customFields:
//     //   product?.customFields.length === 0 ? customFields : product?.customFields,
//
//     freeShipping: product?.freeShipping ?? false,
//     shippingPrice: product?.shippingPrice ?? '',
//     locationBasedShipping: product?.locationBasedShipping ?? false,
//     locationShipping:
//       product?.locationShipping.length === 0
//         ? locationShipping
//         : product?.locationShipping,
//     pageTitle: product?.pageTitle ?? '',
//     metaDescription: product?.metaDescription ?? '',
//     metaKeywords: product?.metaKeywords ?? '',
//     productUrl: product?.productUrl ?? '',
//     isPurchaseSpecifyDate: product?.isPurchaseSpecifyDate ?? false,
//     isLimitDate: product?.isLimitDate ?? false,
//     dateFieldName: product?.dateFieldName ?? '',
//     productVariants:
//       product?.productVariants.length === 0
//         ? productVariants
//         : product?.productVariants,
//     tags: product?.tags ?? [],
//   };
// }
//
// export const productFormSchema = z.object({
//   title: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   companyName: z.string().min(3, { message: 'این فیلد اجباری می‌باشد' }),
//   sku: z.string().optional(),
//   type: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   categories: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   subcategory: z.number().min(1, { message: 'این فیلد اجباری است'}),
//   description: z.string().optional(),
//   price: z
//     .number()
//     .min(0, { message: 'این فیلد اجباری میباشد' })
//     .or(z.string().min(1, { message: 'این فیلد اجباری میباشد' })),
//   costPrice: z.number().optional().or(z.string().optional()),
//   retailPrice: z
//     .number()
//     .min(0, { message: 'این فیلد اجباری میباشد' })
//     .or(z.string().min(1, { message: 'این فیلد اجباری میباشد' })),
//   salePrice: z
//     .number()
//     .min(0, { message: 'این فیلد اجباری میباشد' })
//     .or(z.string().min(1, { message: 'این فیلد اجباری میباشد' })),
//   inventoryTracking: z.string().optional(),
//   currentStock: z.number().or(z.string()).optional(),
//   lowStock: z.number().or(z.string()).optional(),
//   productAvailability: z.string().optional(),
//   tradeNumber: z.number().or(z.string()).optional(),
//   manufacturerNumber: z.number().or(z.string()).optional(),
//   brand: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   upcEan: z.number().or(z.string()).optional(),
//   // customFields: z.array(
//   //   z.object({
//   //     label: z.string().optional(),
//   //     value: z.string().optional(),
//   //   })
//   // ),
//
//   freeShipping: z.boolean().optional(),
//   shippingPrice: z
//     .number()
//     .min(0, { message: 'این فیلد اجباری میباشد' })
//     .or(z.string().min(1, { message: 'این فیلد اجباری میباشد' })),
//   locationBasedShipping: z.boolean().optional(),
//   locationShipping: z.array(
//     z.object({
//       name: z.string().optional(),
//       shippingCharge: z.number().or(z.string()).optional(),
//     })
//   ),
//   pageTitle: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   metaDescription: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   metaKeywords: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   productUrl: z.string().min(1, { message: 'این فیلد اجباری میباشد' }),
//   isPurchaseSpecifyDate: z.boolean().optional(),
//   isLimitDate: z.boolean().optional(),
//   dateFieldName: z.string().optional(),
//   availableDate: z.date().min(new Date('1900-01-01')).optional(),
//   endDate: z.date().min(new Date('1900-01-02')).optional(),
//   productVariants: z.array(
//     z.object({
//       name: z.string().optional(),
//       value: z.string().optional(),
//     })
//   ),
//   tags: z.array(z.string()).optional(),
// });
//
// export type CreateProductInput = z.infer<typeof productFormSchema>;
//
// export const menuItems = [
//   {
//     label: 'خلاصه',
//     value: 'summary',
//   },
//   {
//     label: 'عکس و گالری',
//     value: 'images_gallery',
//   },
//   {
//     label: 'قیمت',
//     value: 'pricing_inventory',
//   },
//   {
//     label: 'شخصی سازی فیلد ها',
//     value: 'product_identifiers',
//   },
//   {
//     label: 'حمل و نقل ',
//     value: 'shipping_availability',
//   },
//   {
//     label: 'بازاریابی',
//     value: 'seo',
//   },
//   {
//     label: 'تنظیمات دیگر',
//     value: 'variant_options',
//   },
// ];
//
// // Category option
// export const categoryOption = [
//   {
//     value: 'fruits',
//     name: 'میوه',
//   },
//   {
//     value: 'grocery',
//     name: 'سبزیجات',
//   },
//   {
//     value: 'meat',
//     name: 'گوشت',
//   },
//   {
//     value: 'cat food',
//     name: 'غذای گربه',
//   },
// ];
//
// // Type option
// export const typeOption = [
//   {
//     value: 'digital company',
//     name: 'محصول دیجیتال',
//   },
//   {
//     value: 'physical company',
//     name: 'محصول فیزیکی',
//   },
// ];
//
// // Variant option
// export const variantOption = [
//   {
//     value: 'single',
//     name: 'تک',
//   },
//   {
//     value: 'multiple',
//     name: 'چندتایی',
//   },
// ];
import { z } from 'zod';
import { productsToForm } from './product-api';
import {
  optionalEmailArraySchema,
  optionalEmailSchema,
  optionalLandlineSchema,
  optionalMobilePhoneSchema,
  optionalDigitsSchema,
  optionalPostalCodeSchema,
  optionalWebsiteSchema,
  requiredLandlineSchema,
  requiredMobilePhoneSchema,
  requiredStringSchema,
  validationMessages,
} from '@/utils/form-validators';

const pictureSchema = z.object({
    id: z.string().optional(),
    fileName: z.string().optional(),
    filePath: z.string().optional()
});

const productSchema = z.object({
    id: z.number().nullable().optional(),
    _categoryKey: z.string().optional(),
    _productPictures: z.array(z.any()).optional(),
    name: z.string().trim().min(1, { message: validationMessages.productName }),
    categoryType: z.string().trim().min(1, { message: validationMessages.productCategory }),
    otherTypeName: z.string().optional(),
    description: z.string().optional(),
    pictures: z.any().optional().nullable(),
    uploadedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    outsourced: z.boolean().optional(),
    machineUsage: z.boolean().optional(),
    showProduct: z.boolean().optional(),
});

const locationSchema = z.object({
    officeLocation: z.string(),
    factoryLocation: z.string(),
    officePoBox: z.string(),
    factoryPoBox: z.string(),
    officeState: z.string(),
    officeCity: z.string(),
    factoryState: z.string(),
    factoryCity: z.string(),
    industrialCity: z.string(),
    country: z.string(),
});

const optionalTelSchema = z.object({
    telNumber: optionalLandlineSchema(),
    telType: z.string().optional(),
});

const requiredTelSchema = z.object({
    telNumber: requiredLandlineSchema(),
    telType: z.string().optional(),
});


const contactSchema = z.object({
    name: requiredStringSchema(),
    lastName: requiredStringSchema(),
    email: optionalEmailSchema(),
    phone: requiredMobilePhoneSchema(),
    // isCEO: z.boolean(),
    position: requiredStringSchema(),
});

const galleryContactSchema = z.object({
    title: requiredStringSchema(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    emails: optionalEmailSchema(),
    phoneNumbers: optionalMobilePhoneSchema(),
    description: z.string().optional(),
    // isCEO: z.boolean(),
    position: z.string().optional(),
    showMobile: z.boolean().optional().default(true),
    showEmail: z.boolean().optional().default(true),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryCertificateSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryProductSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const gallerySliderSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryCatalogSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryDocumentSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryVideoSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const galleryOfficeEnvironmentSchema = z.object({
    title: requiredStringSchema(),
    description: z.string().optional(),
    uploadedFileId: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    removedFileIds: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    priority: z.union([z.number(), z.string()]).optional()
});

const gallerySchema = z.object({
    // contacts: z.array(galleryContactSchema).superRefine((val, ctx) => {
    //   if (new Set(val).size === val.length)
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: `اولویت نباید تکراری باشد`,
    //     });
    // }),
    contacts: z.array(galleryContactSchema).optional(),
    certificates: z.array(galleryCertificateSchema).optional(),
    products: z.array(galleryProductSchema).optional(),
    sliders: z.array(gallerySliderSchema).optional(),
    catalogs: z.array(galleryCatalogSchema).optional(),
    videos: z.array(galleryVideoSchema).optional(),
    documents: z.array(galleryDocumentSchema).optional(),
    officeEnvironments: z.array(galleryOfficeEnvironmentSchema).optional(),
});

// const certificateSchema = z
// .object({
//   name: z.string().optional(),
//   description: z.string().optional(),
//   priority: z.number().optional(),
// })
// .array()
// .refine((certificates) => {
//   const priorities = certificates
//     .filter((item) => item.priority !== undefined)
//     .map((item) => item.priority);
//   return new Set(priorities).size === priorities.length; // Check for unique priorities
// }, {
//   message: "Each certificate must have a unique priority.",
// });

// // Schema for validating contacts
// const contactSchema = z
// .object({
//   name: z.string(),
//   lastName: z.string(),
//   email: z.string(),
//   phone: z.string(),
//   priority: z.number().optional(),
//   position: z.string(),
// })
// .array()
// .refine((contacts) => {
//   const priorities = contacts
//     .filter((item) => item.priority !== undefined)
//     .map((item) => item.priority);
//   return new Set(priorities).size === priorities.length; // Check for unique priorities
// }, {
//   message: "Each contact must have a unique priority.",
// });


const subcategorySchema = z.object({
    name: z.string(),
    value: z.number(),
});

const companyTypeSchema = z.object({
    name: z.string(),
    value: z.string(),
});
const companyBrandSchema = z.object({
    name: z.string().trim(),
    nameEn: z.string().trim(),
    brandImage: z.string().trim().optional()
}).superRefine((brand, ctx) => {
    if (!brand.name && (brand.nameEn || brand.brandImage)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['name'],
            message: 'نام تجاری را وارد کنید',
        });
    }
});

const requiredSubcategorySchema = z
    .union([subcategorySchema, z.null()])
    .refine((value) => value !== null, {
        message: validationMessages.required,
    });

const requiredCompanyTypeSchema = z
    .union([companyTypeSchema, z.null()])
    .refine((value) => value !== null, {
        message: validationMessages.required,
    });

const requiredEstablishYearSchema = z
    .string()
    .trim()
    .min(1, { message: validationMessages.required })
    .regex(/^\d{4}$/, { message: 'سال تأسیس باید یک عدد ۴ رقمی باشد' });

export const companyFormSchema = z.object({
    brands: z.array(companyBrandSchema).max(50, {
        message: 'حداکثر ۵۰ نام تجاری قابل ثبت است',
    }).optional(),
    ceo: requiredStringSchema(),
    ceoPhoneNumber: optionalMobilePhoneSchema(),
    companyName: requiredStringSchema(),
    companyNameEn: requiredStringSchema(),
    companyStakeHolders: z.string().optional(),
    specialLineNumber: optionalDigitsSchema(),
    owner: z.string().optional(),
    answerName: z.string().optional(),
    history: z.string().optional(),
    visit: z.number().optional(),
    buildingArea: z.string().optional(),
    landArea: z.string().optional(),
    holding: z.string().optional(),
    description: z.string().optional(),
    advertisingSlogan: z.string().optional(),
    employeesCount: optionalDigitsSchema(),
    companyType: requiredCompanyTypeSchema,
    companyTypeOther: z.string().optional(),
    // backgroundImage: z.array(z.instanceof(File)).optional(),
    logo: z.string().optional(),
    // logo: z.instanceof(File).refine((file) => file?.size <= 20 * 1024 * 1024, {
    //     message: 'حداکثر حجم فایل باید ۲۰ مگابایت باشد',
    // }).nullable().optional(),
    subjectOfActivity: z.string().optional(),
    establishDate: requiredEstablishYearSchema,
    rawMaterialsOrigin: z.string().optional(),
    keyWords: z.string().optional(),
    tags: z.string().optional(),
    companyKeyWords: z.array(z.string()).optional(),
    companyTags: z.array(z.string()).optional(),
    products: z.array(productSchema).optional(),
    outSourcedProducts: z.array(productSchema).optional(),
    primaryBrand: requiredStringSchema(),
    mainBrandEn: requiredStringSchema(),
    companyBrands: z.array(z.string()).optional(),
    location: locationSchema.optional(),
    factoryTels: z.array(requiredTelSchema).min(1, {
        message: validationMessages.required,
    }).max(3, {
        message: 'حداکثر ۳ تلفن کارخانه قابل ثبت است',
    }),
    factoryFaxes: z.array(optionalTelSchema).max(3, {
        message: 'حداکثر ۳ فکس کارخانه قابل ثبت است',
    }).optional(),
    officeTels: z.array(requiredTelSchema).min(1, {
        message: validationMessages.required,
    }).max(3, {
        message: 'حداکثر ۳ تلفن دفتر مرکزی قابل ثبت است',
    }),
    officeFaxes: z.array(optionalTelSchema).max(3, {
        message: 'حداکثر ۳ فکس دفتر مرکزی قابل ثبت است',
    }).optional(),
    telegramId: z.string().optional(),
    telegramPhoneNo: optionalMobilePhoneSchema(),
    smsNumber: optionalDigitsSchema(),
    hotlineNumber: optionalLandlineSchema(),
    whatsAppId: z.string().optional(),
    whatsAppPhoneNo: optionalMobilePhoneSchema(),
    instagramId: z.string().optional(),
    linkedInId: z.string().optional(),
    eitaaPhoneNo: optionalMobilePhoneSchema(),
    rubikaPhoneNo: optionalMobilePhoneSchema(),
    skypeId: z.string().optional(),
    website: optionalWebsiteSchema(),
    contacts: z.array(contactSchema).max(10, {
        message: 'حداکثر ۱۰ مخاطب قابل ثبت است',
    }).optional(),
    emails: optionalEmailArraySchema().refine(
        (emails) => !emails || emails.length <= 3,
        { message: 'حداکثر ۳ ایمیل قابل ثبت است' }
    ),
    productAvailability: z.string().optional(),
    subcategory: requiredSubcategorySchema,
    productTitles: z.string().optional(),
    outSourcedProductTitles: z.string().optional(),
    productsDescription: z.string().optional(),
    outSourcedProductsDescription: z.string().optional(),
    currentLogo: z.string().optional(),
    currentBackgroundImages: z.array(z.string()).optional(),
    factoryCity: requiredStringSchema(),
    factoryState: requiredStringSchema(),
    industrialCity: requiredStringSchema(),
    factoryPoBox: optionalPostalCodeSchema(),
    officePoBox: optionalPostalCodeSchema(),
    factoryLocation: requiredStringSchema(),
    officeLocation: z.string().optional(),
    officeCity: z.string().optional(),
    officeState: z.string().optional(),
    gallery: gallerySchema.optional(),
    fullAddress: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    factoryLongitude: z.number().optional(),
    factoryLatitude: z.number().optional(),
    officeLongitude: z.number().optional(),
    officeLatitude: z.number().optional(),
    acceptInternViaPortal: z.boolean().nullable().optional(),
    timelyInfoUpdate: z.boolean().nullable().optional(),
    sendRelatedNewsToPortal: z.boolean().nullable().optional(),
    acceptStudentGroupVisit: z.boolean().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.productAvailability === '1') {
        if (!data.productTitles?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['productTitles'],
                message: validationMessages.required,
            });
        }
        if (!data.productsDescription?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['productsDescription'],
                message: validationMessages.required,
            });
        }
    }

    if (data.productAvailability === '2' && !data.products?.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['products'],
            message: 'ثبت حداقل یک محصول یا خدمت الزامی است',
        });
    }
    if (data.productAvailability === '2') {
        (['outSourcedProducts'] as const).forEach(field => {
            data[field]?.forEach((product, index) => {
                if (!Array.isArray(product.pictures) || !product.pictures.length) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [field, index, 'pictures'],
                        message: 'یک تصویر برای دسته‌بندی انتخاب کنید',
                    });
                }
            });
        });
    }
});

export type CreateCompanyInput = z.infer<typeof companyFormSchema>;

export function defaultValues(company?: CreateCompanyInput | null) {
    return {
        brands: company?.companyBrands ?? [],
        companyName: company?.companyName ?? '',
        companyNameEn: company?.companyNameEn ?? '',
        companyStakeHolders: company?.companyStakeHolders ?? "",
        ceo: company?.ceo ?? '',
        ceoPhoneNumber: company?.ceoPhoneNumber ?? '',
        owner: company?.owner ?? '',
        answerName: company?.answerName ?? '',
        history: company?.history ?? '',
        buildingArea: String(company?.buildingArea ?? ''),
        landArea: String(company?.landArea ?? ''),
        holding: company?.holding ?? '',
        description: company?.description ?? '',
        advertisingSlogan: company?.advertisingSlogan ?? '',
        employeesCount: company?.employeesCount ?? '',
        companyType: company?.companyType ?? null,
        companyTypeOther: company?.companyTypeOther ?? '',
        // backgroundImage: company?.backgroundImage ?? '',
        // logo: company?.logo ?? '',
        subjectOfActivity: company?.subjectOfActivity ?? '',
        establishDate: company?.establishDate
            ? String(company.establishDate).match(/\d{4}/)?.[0] ?? ''
            : '',
        rawMaterialsOrigin: company?.rawMaterialsOrigin ?? '',
        keyWords: company?.keyWords ?? '',
        tags: company?.tags ?? '',
        companyKeyWords: company?.companyKeyWords ?? [],
        companyTags: company?.companyTags ?? [],
        products: productsToForm(company?.products ?? []),
        outSourcedProducts: productsToForm(company?.outSourcedProducts ?? [], true),
        primaryBrand: company?.primaryBrand ?? '',
        mainBrandEn: company?.mainBrandEn ?? '',
        factoryCity: company?.location?.factoryCity ?? '',
        factoryState: company?.location?.factoryState ?? '',
        industrialCity: company?.location?.industrialCity ?? '',
        factoryPoBox: company?.location?.factoryPoBox ?? '',
        officePoBox: company?.location?.officePoBox ?? '',
        factoryLocation: company?.location?.factoryLocation ?? '',
        officeLocation: company?.location?.officeLocation ?? '',
        officeCity: company?.location?.officeCity ?? '',
        officeState: company?.location?.officeState ?? '',
        factoryTels: company?.factoryTels ?? [],
        factoryFaxes: company?.factoryFaxes ?? [],
        officeTels: company?.officeTels ?? [],
        officeFaxes: company?.officeFaxes ?? [],
        telegramId: company?.telegramId ?? '',
        telegramPhoneNo: company?.telegramPhoneNo ?? '',
        smsNumber: company?.smsNumber ?? '',
        hotlineNumber: company?.hotlineNumber ?? '',
        specialLineNumber: company?.specialLineNumber ?? '',
        whatsAppId: company?.whatsAppId ?? '',
        whatsAppPhoneNo: company?.whatsAppPhoneNo ?? '',
        instagramId: company?.instagramId ?? '',
        linkedInId: company?.linkedInId ?? '',
        eitaaPhoneNo: company?.eitaaPhoneNo ?? '',
        rubikaPhoneNo: company?.rubikaPhoneNo ?? '',
        skypeId: company?.skypeId ?? '',
        website: company?.website ?? '',
        contacts: company?.contacts ?? [],
        emails: company?.emails ?? [],
        productAvailability: company?.productAvailability ?? '2',
        subcategory: company?.subcategory ?? null,
        productTitles: company?.productTitles ?? "",
        outSourcedProductTitles: company?.outSourcedProductTitles ?? "",
        productsDescription: company?.productsDescription ?? "",
        outSourcedProductsDescription: company?.outSourcedProductsDescription ?? "",
        currentLogo: company?.logo ?? "",
        currentBackgroundImages: company?.currentBackgroundImages ?? [],
        gallery: company?.gallery ?? {
            contacts: [],
            certificates: [],
            products: [],
            slider: [],
            catalog: {},
            videos: [],
            documents: [],
            officeEnvironments: [],
        },
        factoryLongitude: company?.factoryLongitude,
        factoryLatitude: company?.factoryLatitude,
        officeLongitude: company?.officeLongitude,
        officeLatitude: company?.officeLatitude,
        factoryFullAddress: company?.factoryFullAddress ?? '',
        officeFullAddress: company?.officeFullAddress ?? '',
        officeCommonName: company?.officeCommonName ?? '',
        factoryCommonName: company?.factoryCommonName ?? '',
        manualLatitude: '',
        manualLongitude: '',
        acceptInternViaPortal: company?.acceptInternViaPortal ?? null,
        timelyInfoUpdate: company?.timelyInfoUpdate ?? null,
        sendRelatedNewsToPortal: company?.sendRelatedNewsToPortal ?? null,
        acceptStudentGroupVisit: company?.acceptStudentGroupVisit ?? null,
    };
}

