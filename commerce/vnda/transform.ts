import {
  Offer,
  Product,
  ProductLeaf,
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
  parentUrlData?: { slug: string; productId: string },
) => {
  const slug = parentUrlData?.slug || product.slug;
  const productId = parentUrlData?.productId || product.id;

  const params = new URLSearchParams();
  params.set("id", productId.toString());
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
  parentUrlData?: { slug: string; productId: string },
): Product => {
  const getVariants = () => {
    if (level !== 0) return [];

    const _product = product as ProductGetResultVNDA;

    return _product.variants.map((variant) => {
      const normalizedVariant = normalizeProductVariationVNDA(variant);
      const { id, slug } = product;
      const productId = id.toString();
      return toProduct(normalizedVariant, options, 1, { slug, productId });
    });
  };

  const getSku = () => {
    if (level === 0) {
      const _product = product as ProductGetResultVNDA;
      const firstVariant = _product.variants[0];
      if (!firstVariant) return product.id.toString();

      const normalizedVariant = normalizeProductVariationVNDA(firstVariant);
      return normalizedVariant.sku;
    }

    const _product = product as ProductVariationVNDA;
    return _product.sku;
  };

  const getProperties = () => {
    if (level === 0) return toPropertyValue(product as ProductGetResultVNDA);
    return toLeafPropertyValue(product as ProductVariationVNDA);
  };

  const { url, priceCurrency } = options;
  const productSku = getSku();
  const productUrl = getProductURL(url, product, productSku, parentUrlData);

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

/**
 * Não é possível pegar um produto pelo sku, então para que tudo
 * funcione normalmente, essa função simula o comportamento padrão
 * de outros ecommerces simplesmente copiando os dados da variação
 * para o nivel do produto pai.
 */
export const useVariant = (
  product: Product,
  variantSkuId?: string | null,
): Product => {
  const variantFilter = (variant: ProductLeaf) => variant.sku === variantSkuId;
  const chosenVariant = product.isVariantOf?.hasVariant.find(variantFilter);
  if (!chosenVariant) return product;

  return {
    ...product,
    productID: chosenVariant.productID,
    url: chosenVariant.url,
    sku: chosenVariant.sku,
    image: chosenVariant.image,
    offers: chosenVariant.offers,
  };
};
