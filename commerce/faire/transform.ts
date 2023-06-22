import type { Product, UnitPriceSpecification } from "../types.ts";

import { FaireSearchResult } from "./types.ts";

export const toProduct = (
  productTile: FaireSearchResult["product_tiles"][number],
): Product => {
  const product = productTile.product;
  const bestImage = productTile.best_image;
  const minOptionRetailPrice = productTile.min_option_retail_price;

  const priceSpec: UnitPriceSpecification[] = [{
    "@type": "UnitPriceSpecification",
    priceType: "https://schema.org/SalePrice",
    price: Number(minOptionRetailPrice.amount_cents / 100),
  }];
  const url =
    `https://www.faire.com/search?brand=${product.brand_token}&product=${product.token}&q=from+deco&signUp=product`;

  const price = minOptionRetailPrice.amount_cents / 100;

  return {
    "@type": "Product",
    productID: product.token,
    "name": product.name,
    "brand": product.brand_token,
    "description": product.description,
    "sku": product.taxonomy_type.token,
    "category": product.taxonomy_type.name,
    url,
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: product.token,
      hasVariant: [],
      url,
      name: product.name,
      additionalProperty: [],
    },
    image: [{
      "@type": "ImageObject",
      alternateName: product.name,
      url: bestImage.url,
    }],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      highPrice: price,
      lowPrice: Number(price),
      offerCount: 1,
      offers: [{
        "@type": "Offer",
        price: Number(price),
        availability: true
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        inventoryLevel: { value: 1000 },
        priceSpecification: priceSpec,
      }],
    },
  };
};
