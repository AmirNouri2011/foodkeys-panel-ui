import { API_BASE_URL } from '@/config/api.config';
import { GroupedProduct, groupProducts } from './product-groups';

export interface ProductCategoryDTO {
  name: string;
  imageId?: string;
  imageUrl?: string;
  items: { title: string; description: string }[];
}

export interface CategorizedProductDTO {
  id?: number;
  name: string;
  showProduct: boolean;
  outsourced: boolean;
  pictures: string[];
  categoryType: string;
  otherTypeName: string | null;
  uploadedFileIds: string[];
  removedFileIds: string[];
  categories: ProductCategoryDTO[];
}

const fileId = (image: any): string | undefined =>
  typeof image === 'string' ? image : image?.id || image?.fileId;

/** Hydrate both the new API and older flat records without losing parent IDs. */
export function productsToForm(products: any[] = [], outsourced = false): GroupedProduct[] {
  return products.flatMap((product, productIndex) => {
    if (!Array.isArray(product.categories)) {
      return [{ ...product, categoryType: String(product.categoryType ?? ''), outsourced }];
    }
    return product.categories.flatMap((category: ProductCategoryDTO, categoryIndex: number) => {
      const picture = category.imageId || category.imageUrl
        ? [{ id: category.imageId, filePath: category.imageUrl }]
        : [];
      const items = category.items?.length ? category.items : [{ title: '', description: '' }];
      return items.map(item => ({
        id: product.id ?? null,
        _categoryKey: `api:${product.id ?? productIndex}:${categoryIndex}`,
        _productPictures: product.pictures || [],
        otherTypeName: product.otherTypeName ?? null,
        uploadedFileIds: product.uploadedFileIds || [],
        removedFileIds: product.removedFileIds || [],
        categoryType: category.name || '',
        name: item.title || '',
        description: item.description || '',
        pictures: picture,
        showProduct: product.showProduct ?? true,
        outsourced,
      }));
    });
  });
}

/** Whitelist API fields; never send RHF IDs or UI metadata to the server. */
export function productsToApi(rows: GroupedProduct[] = [], outsourced = false): CategorizedProductDTO[] {
  const parents = new Map<number | string, GroupedProduct[]>();
  rows.forEach(row => {
    const key = row.id ?? row._categoryKey ?? `new:${row.categoryType?.trim() || ''}`;
    parents.set(key, [...(parents.get(key) || []), row]);
  });
  return Array.from(parents, ([id, products]) => ({
    ...(typeof id === 'number' ? { id } : {}),
    name: products[0].categoryType?.trim() || '',
    categoryType: products[0].categoryType?.trim() || '',
    otherTypeName: products[0].otherTypeName ?? null,
    showProduct: products[0].showProduct ?? true,
    outsourced,
    pictures: (products[0]._productPictures || []).map(fileId).filter((id): id is string => !!id),
    uploadedFileIds: [...new Set([
      ...products.flatMap(row => row.uploadedFileIds || []),
      ...groupProducts(products).flatMap(group => group.pictures.map(fileId)),
    ].filter((id): id is string => !!id))],
    removedFileIds: [...new Set(products.flatMap(row => row.removedFileIds || []))],
    categories: groupProducts(products).map(group => {
      const image = group.pictures[0];
      return {
        name: group.name.trim(),
        imageId: fileId(image),
        items: group.indices.map(index => ({
          title: products[index].name?.trim() || '',
          description: products[index].description || '',
        })),
      };
    }),
  }));
}

interface HttpResponse { status: number; data: any }
interface HttpClient {
  post(url: string, body: any, config?: any): Promise<HttpResponse>;
  put(url: string, body: any, config?: any): Promise<HttpResponse>;
}
export interface CompanyProductSaveProgress { companyId?: number; companyCreated?: boolean }

function checkResponse(response: HttpResponse) {
  if (response.status < 200 || response.status >= 300 ||
      (response.data?.status && response.data.status !== 'SUCCESS')) {
    throw new Error(response.data?.message || 'ذخیره اطلاعات انجام نشد');
  }
}

export function responseEntityId(response: HttpResponse): number | undefined {
  const data = response.data?.data ?? response.data;
  const value = typeof data === 'number' || typeof data === 'string' ? data : data?.id || data?.companyId;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

/** Send categorized products with the company for both creation and updates. */
export async function saveCompanyWithProducts(
  client: HttpClient,
  company: { products?: CategorizedProductDTO[]; outSourcedProducts?: CategorizedProductDTO[]; [key: string]: any },
  companyId: string | number | undefined,
  progress: CompanyProductSaveProgress,
) {
  const config = { headers: { 'Content-Type': 'application/json' } };
  const existingId = companyId ?? progress.companyId;
  if (existingId) {
    const response = await client.put(`${API_BASE_URL}/company/${existingId}`, { ...company, id: Number(existingId) }, config);
    checkResponse(response);
    return response;
  }
  if (progress.companyCreated) {
    throw new Error('شناسه شرکت ثبت‌شده در پاسخ سرور وجود ندارد؛ صفحه شرکت را دوباره باز کنید.');
  }

  const response = await client.post(`${API_BASE_URL}/company`, company, config);
  checkResponse(response);
  progress.companyCreated = true;
  const createdCompanyId = responseEntityId(response);
  progress.companyId = createdCompanyId;
  return response;
}
