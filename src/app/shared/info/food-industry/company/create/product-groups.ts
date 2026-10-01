// Flat form rows are adapted to the categorized API at the submission boundary.
export interface GroupedProduct {
  id?: number | null;
  fieldId?: string;
  _categoryKey?: string;
  _productPictures?: any[];
  categoryType?: string;
  name?: string;
  description?: string;
  pictures?: any[];
  showProduct?: boolean;
  outsourced?: boolean;
}

export function groupProducts(products: GroupedProduct[] = []) {
  const groups = new Map<
    string,
    { key: string; name: string; indices: number[]; pictures: any[] }
  >();
  products.forEach((product, index) => {
    const key =
      product._categoryKey ||
      (product.categoryType?.trim()
        ? `category:${product.id ?? 'new'}:${product.categoryType.trim()}`
        : `product:${product.fieldId || product.id || index}`);
    const existing = groups.get(key);
    if (existing) existing.indices.push(index);
    else
      groups.set(key, {
        key,
        name: product.categoryType || '',
        indices: [index],
        pictures: product.pictures || [],
      });
  });
  return Array.from(groups.values());
}
