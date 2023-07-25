import {
  Filter,
  Offer,
  Product,
  ProductLeaf,
  PropertyValue,
  Seo,
  UnitPriceSpecification,
} from "deco-sites/std/commerce/types.ts";

import {
  ProductBase,
  ProductGetResult,
  ProductSearchResult,
  ProductVariation,
  SEO,
} from "../types.ts";

interface ProductOptions {
  url: URL;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
}

export function getProductCategoryTag(product: ProductGetResult) {
  return product.tags.filter(({ type }) => type === "categoria")[0];
}

export function getSEOFromTag(
  tag: Pick<SEO, "title" | "description">,
  req: Request,
): Seo {
  return {
    title: tag.title || "",
    description: tag.description || "",
    canonical: req.url,
  };
}

function getProductURL(
  url: URL,
  product: ProductBase,
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
  product: ProductBase,
): product is ProductGetResult {
  return "variants" in product;
}

function getVariants(product: ProductGetResult, options: ProductOptions) {
  return product.variants.map((variant) => {
    const normalizedVariant = normalizeProductVariationVNDA(variant);
    const { id, slug } = product;
    const productId = id.toString();
    return toProduct(normalizedVariant, options, { slug, productId });
  });
}

function getSku(product: ProductGetResult | ProductVariation) {
  if (isProductGetResultVNDA(product)) {
    const firstVariant = product.variants[0];
    if (!firstVariant) return product.id.toString();

    const normalizedVariant = normalizeProductVariationVNDA(firstVariant);
    return normalizedVariant.sku;
  }

  return product.sku;
}

function getProperties(product: ProductGetResult | ProductVariation) {
  if (isProductGetResultVNDA(product)) {
    return toPropertyValue(product);
  }

  return toLeafPropertyValue(product);
}

function toOffer(product: ProductBase): Offer {
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

function toPropertyValue(product: ProductGetResult): PropertyValue[] {
  return product.variants.flatMap(toLeafPropertyValue);
}

function toLeafPropertyValue(
  maybeProduct: Record<string, ProductVariation> | ProductVariation,
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
  variation: Record<string, ProductVariation> | ProductVariation,
): variation is ProductVariation {
  const variationKeys = Object.keys(variation);
  return variationKeys.length > 1;
}

function normalizeProductVariationVNDA(
  variation: Record<string, ProductVariation> | ProductVariation,
): ProductVariation {
  if (!isProductVariationVNDA(variation)) {
    const variationKeys = Object.keys(variation);
    return variation[variationKeys[0]];
  }

  return variation;
}

export function toProduct(
  product: ProductGetResult | ProductVariation,
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

function isFilterSelected(
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) {
  return Boolean(typeTagsInUse.find((inUse) =>
    inUse.key === filter.key &&
    inUse.value === filter.value
  ));
}

function addFilter(
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) {
  return [...typeTagsInUse, filter];
}

function removeFilter(
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) {
  return typeTagsInUse.filter((inUse) =>
    inUse.key !== filter.key &&
    inUse.value !== filter.value
  );
}

export function toFilters(
  aggregations: ProductSearchResult["aggregations"],
  typeTagsInUse: { key: string; value: string }[],
  cleanUrl: URL,
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
        const filter = { key: `type_tags[${typeKey}][]`, value: value.name };
        const isSelected = isFilterSelected(typeTagsInUse, filter);

        const nextFilters = isSelected
          ? removeFilter(typeTagsInUse, filter)
          : addFilter(typeTagsInUse, filter);

        const filterUrl = new URL(cleanUrl);
        nextFilters.forEach(({ key, value }) =>
          filterUrl.searchParams.append(key, value)
        );

        return {
          value: value.name,
          label: value.title,
          selected: isSelected,
          quantity: value.count,
          url: filterUrl.toString(),
        };
      }),
    };
  });

  return [
    priceRange,
    ...types,
  ];
}

export function typeTagExtractor(url: URL) {
  const keysToDestroy: string[] = [];
  const typeTags: { key: string; value: string }[] = [];
  const typeTagRegex = /\btype_tags\[(\S+)\]\[\]/;

  url.searchParams.forEach((value, key) => {
    const match = typeTagRegex.exec(key);

    if (match) {
      keysToDestroy.push(key);
      typeTags.push({ key, value });
    }
  });

  // it can't be done inside the forEach instruction above
  typeTags.forEach((tag) => url.searchParams.delete(tag.key));

  return {
    typeTags,
    cleanUrl: url,
  };
}
