import {
  Offer,
  Product,
  PropertyValue,
  UnitPriceSpecification,
} from "../types.ts";

import {
  ProductBaseVNDA,
  ProductGetResultVNDA,
  ProductVariationVNDA,
} from "./types.ts";

interface ProductOptions {
  url: URL;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
}

/**
 * @param url base url
 * @param slug product slug
 * @param skuId product variation sku
 * @returns
 */
const getProductURL = (
  url: URL,
  product: ProductBaseVNDA,
  skuId?: string,
  parentSlug?: string,
) => {
  const slug = parentSlug || `${product.slug}-${product.id}`;
  const params = new URLSearchParams();
  if (skuId) params.set("skuId", skuId);

  return new URL(
    `/${slug}/p?${params.toString()}`,
    url.origin,
  ).href;
};

export const toProduct = (
  product: ProductGetResultVNDA | ProductVariationVNDA,
  options: ProductOptions,
  level = 0,
  parentSlug?: string,
): Product => {
  const getVariants = () => {
    if (level !== 0) return [];

    const _product = product as ProductGetResultVNDA;

    return _product.variants.map((variant) => {
      const normalizedVariant = normalizeProductVariationVNDA(variant);
      const parentProductSlug = `${product.slug}-${product.id}`;
      return toProduct(normalizedVariant, options, 1, parentProductSlug);
    });
  };

  const getSku = () => {
    if (level !== 0) return product.id.toString();

    const _product = product as ProductVariationVNDA;
    return _product.sku;
  };

  const getProperties = () => {
    if (level === 0) return toPropertyValue(product as ProductGetResultVNDA);
    return toLeafPropertyValue(product as ProductVariationVNDA);
  };

  const { url, priceCurrency } = options;
  const productSku = getSku();
  const productUrl = getProductURL(url, product, productSku, parentSlug);

  return {
    "@type": "Product",
    productID: product.id.toString(),
    url: productUrl,
    name: product.name,
    description: product.description,
    sku: productSku,
    additionalProperty: getProperties(),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: product.id.toString(),
      hasVariant: getVariants(),
      url: productUrl,
      name: product.name,
      additionalProperty: getProperties(),
      model: product.reference,
    },
    image: [{
      "@type": "ImageObject" as const,
      alternateName: product.name ?? "",
      url: `https://${product.image_url}`,
    }],
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: priceCurrency,
      highPrice: product.sale_price,
      lowPrice: product.sale_price,
      offerCount: 1,
      offers: [toOffer(product)],
    },
  };
};

const toOffer = (product: ProductBaseVNDA): Offer => {
  const numberInstallments = product.installments as number[];
  const sumNumbers = () => numberInstallments.reduce((acc, i) => (acc + i), 0);
  const isInstallmentNumbersOnly = typeof product.installments === "number";
  const totalInstallments = isInstallmentNumbersOnly ? sumNumbers() : null;

  const installments = product.installments?.map(
    (installment, index): UnitPriceSpecification => {
      if (typeof installment === "number") {
        return {
          "@type": "UnitPriceSpecification" as const,
          priceType: "https://schema.org/SalePrice",
          priceComponentType: "https://schema.org/Installment",
          name: "INSTALLMENT",
          description: "INSTALLMENT",
          billingDuration: index,
          billingIncrement: installment,
          price: totalInstallments!,
        };
      }

      return {
        "@type": "UnitPriceSpecification" as const,
        priceType: "https://schema.org/SalePrice",
        priceComponentType: "https://schema.org/Installment",
        name: "INSTALLMENT",
        description: "INSTALLMENT",
        billingDuration: installment.number,
        billingIncrement: installment.price,
        price: installment.total,
      };
    },
  ) || [];

  return {
    "@type": "Offer",
    seller: "VNDA",
    inventoryLevel: { value: undefined },
    price: product.price,
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: product.price,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: product.sale_price,
      },
      ...installments,
    ],
    availability: product.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
};

const toPropertyValue = (product: ProductGetResultVNDA): PropertyValue[] => {
  return product.variants.flatMap(toLeafPropertyValue);
};

const toLeafPropertyValue = (
  maybeProduct: Record<string, ProductVariationVNDA> | ProductVariationVNDA,
): PropertyValue[] => {
  const product = normalizeProductVariationVNDA(maybeProduct);
  const keys = Object.keys(product.properties);
  const validKeys = keys.filter((key) => Boolean(product.properties[key]));

  return validKeys.map((key) => ({
    "@type": "PropertyValue",
    value: product.properties[key].value,
    name: product.properties[key].name,
    valueReference: "SPECIFICATION",
  }));
};

const normalizeProductVariationVNDA = (
  maybeProduct: Record<string, ProductVariationVNDA> | ProductVariationVNDA,
): ProductVariationVNDA => {
  const maybeProductKeys = Object.keys(maybeProduct);

  if (maybeProductKeys.length === 1) {
    const product = maybeProduct as Record<string, ProductVariationVNDA>;
    return product[maybeProductKeys[0]];
  }

  return maybeProduct as ProductVariationVNDA;
};
