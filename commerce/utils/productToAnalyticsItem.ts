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
  { product, breadcrumbList, price, listPrice, coupon }: {
    product: Product;
    breadcrumbList?: BreadcrumbList;
    price?: number;
    listPrice?: number;
  } & Pick<AnalyticsItem, "price" | "coupon">,
): AnalyticsItem => {
  const { offers } = product;

  const itemId = `${product.isVariantOf?.productGroupID}_${product.sku}`;
  const itemVariant = product.additionalProperty
    ?.filter((
      { valueReference },
    ) => valueReference === "SPECIFICATION")
    .map(({ value }) => value)
    .join(",");
  const index = Math.max(
    product.isVariantOf?.hasVariant.findIndex((v) => v.url === product.url) ||
      0,
    0,
  );

  return {
    item_id: itemId,
    quantity: 1,
    price,
    discount: Number((price && listPrice ? listPrice - price : 0).toFixed(2)),
    item_name: product.isVariantOf?.name || "",
    index,
    coupon,
    item_variant: itemVariant,
    item_brand: product.brand,
    affiliation: offers?.offers[0].seller,
    ...(mapCategoriesToAnalyticsCategories(
      breadcrumbList?.itemListElement.map(({ name: _name }) => _name ?? "")
        .filter(Boolean) ??
        [],
    )),
  };
};
