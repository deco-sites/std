import {
  Filter,
  Offer,
  Product,
  ProductLeaf,
  PropertyValue,
  UnitPriceSpecification,
} from "../types.ts";

import {
  ProductBaseVNDA,
  ProductGetResultVNDA,
  ProductSearchResultVNDA,
  ProductVariationVNDA,
} from "./types.ts";

interface ProductOptions {
  url: URL;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
}

function getProductURL(
  url: URL,
  product: ProductBaseVNDA,
  skuId?: string,
  parentUrlData?: { slug: string; productId: string },
) {
  const slug = parentUrlData?.slug || product.slug;
  const productId = parentUrlData?.productId || product.id;

  const params = new URLSearchParams();
  params.set("id", productId.toString());
  if (skuId) params.set("skuId", skuId);

  return new URL(
    `/${slug}/p?${params.toString()}`,
    url.origin,
  ).href;
}

function isProductGetResultVNDA(
  product: ProductBaseVNDA,
): product is ProductGetResultVNDA {
  return "variants" in product;
}

function getVariants(product: ProductGetResultVNDA, options: ProductOptions) {
  return product.variants.map((variant) => {
    const normalizedVariant = normalizeProductVariationVNDA(variant);
    const { id, slug } = product;
    const productId = id.toString();
    return toProduct(normalizedVariant, options, { slug, productId });
  });
}

function getSku(product: ProductGetResultVNDA | ProductVariationVNDA) {
  if (isProductGetResultVNDA(product)) {
    const firstVariant = product.variants[0];
    if (!firstVariant) return product.id.toString();

    const normalizedVariant = normalizeProductVariationVNDA(firstVariant);
    return normalizedVariant.sku;
  }

  return product.sku;
}

function getProperties(product: ProductGetResultVNDA | ProductVariationVNDA) {
  if (isProductGetResultVNDA(product)) {
    return toPropertyValue(product);
  }

  return toLeafPropertyValue(product);
}

function toOffer(product: ProductBaseVNDA): Offer {
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
}

function toPropertyValue(product: ProductGetResultVNDA): PropertyValue[] {
  return product.variants.flatMap(toLeafPropertyValue);
}

function toLeafPropertyValue(
  maybeProduct: Record<string, ProductVariationVNDA> | ProductVariationVNDA,
): PropertyValue[] {
  const product = normalizeProductVariationVNDA(maybeProduct);
  const keys = Object.keys(product.properties);
  const validKeys = keys.filter((key) => Boolean(product.properties[key]));

  return validKeys.map((key) => ({
    "@type": "PropertyValue",
    value: product.properties[key].value,
    name: product.properties[key].name,
    valueReference: "SPECIFICATION",
  }));
}

function isProductVariationVNDA(
  variation: Record<string, ProductVariationVNDA> | ProductVariationVNDA,
): variation is ProductVariationVNDA {
  const variationKeys = Object.keys(variation);
  return variationKeys.length > 1;
}

function normalizeProductVariationVNDA(
  variation: Record<string, ProductVariationVNDA> | ProductVariationVNDA,
): ProductVariationVNDA {
  if (!isProductVariationVNDA(variation)) {
    const variationKeys = Object.keys(variation);
    return variation[variationKeys[0]];
  }

  return variation;
}

export function toProduct(
  product: ProductGetResultVNDA | ProductVariationVNDA,
  options: ProductOptions,
  parentUrlData?: { slug: string; productId: string },
): Product {
  const { url, priceCurrency } = options;
  const productSku = getSku(product);
  const productUrl = getProductURL(url, product, productSku, parentUrlData);

  return {
    "@type": "Product",
    productID: product.id.toString(),
    url: productUrl,
    name: product.name,
    description: product.description,
    sku: productSku,
    additionalProperty: getProperties(product),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: product.id.toString(),
      hasVariant: isProductGetResultVNDA(product)
        ? getVariants(product, options)
        : [],
      url: productUrl,
      name: product.name,
      additionalProperty: getProperties(product),
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
}

/**
 * It's not possible to get a product by sku, so this function
 * simulates the default behavior of other e-commerces platforms
 * by simply copying the variation data to the parent product level.
 */
export function useVariant(
  product: Product,
  variantSkuId?: string | null,
): Product {
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
}

export function toFilters(
  aggregations: ProductSearchResultVNDA["aggregations"],
  filtersInUse: { key: string; value: string }[],
): Filter[] {
  const priceRange = {
    "@type": "FilterRange" as const,
    label: "Valor",
    key: "price_range",
    values: {
      min: aggregations.min_price,
      max: aggregations.max_price,
    },
  };

  const types = Object.keys(aggregations.types).map((typeKey) => {
    const typeValues = aggregations.types[typeKey];

    return {
      "@type": "FilterToggle" as const,
      key: "type",
      label: typeKey,
      quantity: 0,
      values: typeValues.map((value) => {
        const isSelected = filtersInUse.find((filter) =>
          filter.value === value.name &&
          filter.key === typeKey
        );

        const nextFiltersInUse = !isSelected
          ? [
            ...filtersInUse,
            { key: typeKey, value: value.name },
          ]
          : filtersInUse.filter((filter) =>
            !(filter.value === value.name &&
              filter.key === typeKey)
          );

        return {
          selected: Boolean(isSelected),
          value: value.name,
          label: value.title,
          quantity: value.count,
          url: `/s?${filtersToSearchParams(nextFiltersInUse).toString()}`,
        };
      }),
    };
  });

  return [
    priceRange,
    ...types,
  ];
}

export function filtersToSearchParams(
  selectedTypes: { key: string; value: string }[],
) {
  const searchParams = new URLSearchParams();

  for (const { key, value } of selectedTypes) {
    searchParams.append(key, value);
  }

  return searchParams;
}

export function filtersFromSearchParams(params: URLSearchParams) {
  const selectedTypes: { key: string; value: string }[] = [];
  params.forEach((value, name) => selectedTypes.push({ key: name, value }));
  return selectedTypes;
}
