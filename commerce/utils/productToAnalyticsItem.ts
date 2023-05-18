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
  { product, breadcrumbList, price, listPrice, index, coupon }: {
    product: Product;
    breadcrumbList?: BreadcrumbList;
    price?: number;
    listPrice?: number;
  } & Pick<AnalyticsItem, "price" | "index" | "coupon">,
): AnalyticsItem => {
  const { name, productID, offers } = product;
  return {
    item_id: product.isVariantOf?.productGroupID ?? "",
    quantity: 1,
    price,
    discount: price && listPrice ? listPrice - price : 0,
    item_name: name || "",
    index,
    coupon,
    item_variant: productID,
    item_brand: product.brand,
    affiliation: offers?.offers[0].seller,
    ...(mapCategoriesToAnalyticsCategories(
      breadcrumbList?.itemListElement.map(({ name: _name }) => _name ?? "")
        .filter(Boolean) ??
        [],
    )),
  };
};
