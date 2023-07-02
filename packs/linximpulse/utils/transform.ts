import type { Product } from "deco-sites/std/commerce/types.ts";

import { DEFAULT_CATEGORY_SEPARATOR } from "deco-sites/std/commerce/utils.ts";

import type { Product as ProductLinxImpulse } from "../types.ts";

export const toProduct = <P extends ProductLinxImpulse>(
  product: P,
): Product => {
  const {
    id,
    name,
    description,
    url,
    images,
    details,
    categories,
    skus,
  } = product;

  const isVariantOf = undefined;

  const categoriesString = categories.map((category) => category.name).join(
    DEFAULT_CATEGORY_SEPARATOR,
  );

  return {
    "@type": "Product",
    category: categoriesString,
    productID: id,
    url,
    name,
    description: description ?? "",
    brand: details?.brand ?? "",
    sku: skus[0].sku,
    gtin: skus[0].eanCode,
    releaseDate: "",
    additionalProperty: [],
    isVariantOf,
    image: Object.values(images).map((url) => ({
      "@type": "ImageObject" as const,
      alternateName: "",
      url,
    })),
    offers: {
      "@type": "AggregateOffer",
      highPrice: skus[0]?.oldPrice ?? null,
      lowPrice: skus[0]?.price ?? null,
      offerCount: 0,
      offers: [],
    },
  };
};
