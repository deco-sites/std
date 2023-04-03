import { AnalyticsItem, BreadcrumbList, Product } from "../types.ts";

export const mapCategoriesToAnalyticsCategories = (
  categories: string[],
): Record<`item_category${number | ""}`, string> => {
  return categories.slice(0, 5).reduce(
    (result, category, index) => {
      result[`item_category${index === 0 ? "" : index + 1}`] = category;
      return result;
    },
    {} as Record<`item_category${number | ""}`, string>,
  );
};

export const mapProductToAnalyticsItem = (
  { product, breadcrumbList, price, listPrice }: {
    product: Product;
    breadcrumbList?: BreadcrumbList;
    price?: number;
    listPrice?: number;
  },
): AnalyticsItem => {
  const { name, productID } = product;
  return {
    item_id: product.isVariantOf?.productGroupID ?? "",
    quantity: 1,
    price,
    discount: price && listPrice ? listPrice - price : 0,
    item_name: name,
    item_variant: productID,
    ...(mapCategoriesToAnalyticsCategories(
      breadcrumbList?.itemListElement.map(({ name: _name }) => _name ?? "")
        .filter(Boolean) ??
        [],
    )),
  };
};
