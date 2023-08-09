import { formatRange } from "deco-sites/std/utils/filters.ts";
import type {
  BreadcrumbList,
  Filter,
  FilterToggleValue,
  Navbar,
  Offer,
  Product,
  ProductDetailsPage,
  ProductGroup,
  PropertyValue,
  UnitPriceSpecification,
} from "deco-sites/std/commerce/types.ts";
import { DEFAULT_CATEGORY_SEPARATOR } from "deco-sites/std/commerce/utils.ts";

import { slugify } from "./slugify.ts";
import type {
  Category,
  Facet as FacetVTEX,
  FacetValueBoolean,
  FacetValueRange,
  Item as SkuVTEX,
  LegacyFacet,
  LegacyItem as LegacySkuVTEX,
  LegacyProduct as LegacyProductVTEX,
  Product as ProductVTEX,
  SelectedFacet,
  Seller as SellerVTEX,
} from "../types.ts";

const isLegacySku = (
  sku: LegacySkuVTEX | SkuVTEX,
): sku is LegacySkuVTEX =>
  typeof (sku as LegacySkuVTEX).variations?.[0] === "string";

const isLegacyProduct = (
  product: ProductVTEX | LegacyProductVTEX,
): product is LegacyProductVTEX => product.origin !== "intelligent-search";

const getProductGroupURL = (
  origin: string,
  { linkText }: { linkText: string },
) => new URL(`/${linkText}/p`, origin);

const getProductURL = (
  origin: string,
  product: { linkText: string },
  skuId?: string,
) => {
  const canonicalUrl = getProductGroupURL(origin, product);

  if (skuId) {
    canonicalUrl.searchParams.set("skuId", skuId);
  }

  return canonicalUrl;
};

const nonEmptyArray = <T>(array: T[] | null | undefined) =>
  Array.isArray(array) && array.length > 0 ? array : null;

const DEFAULT_IMAGE = {
  imageText: "image",
  imageUrl:
    "https://storecomponents.vtexassets.com/assets/faststore/images/image___117a6d3e229a96ad0e0d0876352566e2.svg",
};

interface ProductOptions {
  baseUrl: string;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
}

/** Returns first available sku */
const findFirstAvailable = (items: Array<LegacySkuVTEX | SkuVTEX>) =>
  items?.find((item) =>
    Boolean(
      item?.sellers?.find((s) => s.commertialOffer?.AvailableQuantity > 0),
    )
  );

export const pickSku = <T extends ProductVTEX | LegacyProductVTEX>(
  product: T,
  maybeSkuId?: string,
): T["items"][number] => {
  const skuId = maybeSkuId ??
    findFirstAvailable(product.items)?.itemId ??
    product.items[0]?.itemId;

  for (const item of product.items) {
    if (item.itemId === skuId) {
      return item;
    }
  }

  throw new Error(`Missing sku ${skuId} on product ${product.productName}`);
};

const toAccessoryOrSparePartFor = <T extends ProductVTEX | LegacyProductVTEX>(
  sku: T["items"][number],
  kitItems: T[],
  options: ProductOptions,
) => {
  const productBySkuId = kitItems.reduce((map, product) => {
    product.items.forEach((item) => map.set(item.itemId, product));

    return map;
  }, new Map<string, T>());

  return sku.kitItems?.map(({ itemId }) => {
    const product = productBySkuId.get(itemId);

    if (!product) {
      throw new Error(
        `Expected product for skuId ${itemId} but it was not returned by the search engine`,
      );
    }

    const sku = pickSku(product, itemId);

    return toProduct(product, sku, 0, options);
  });
};

export const toProductPage = <T extends ProductVTEX | LegacyProductVTEX>(
  product: T,
  sku: T["items"][number],
  kitItems: T[],
  options: ProductOptions,
): Omit<ProductDetailsPage, "seo"> => {
  const partialProduct = toProduct(product, sku, 0, options);
  // Get accessories in ProductPage only. I don't see where it's necessary outside this page for now
  const isAccessoryOrSparePartFor = toAccessoryOrSparePartFor(
    sku,
    kitItems,
    options,
  );

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product, options),
    product: { ...partialProduct, isAccessoryOrSparePartFor },
  };
};

export const inStock = (offer: Offer) =>
  offer.availability === "https://schema.org/InStock";

// Smallest Available Spot Price First
export const bestOfferFirst = (a: Offer, b: Offer) => {
  if (inStock(a) && !inStock(b)) {
    return -1;
  }

  if (!inStock(a) && inStock(b)) {
    return 1;
  }

  return a.price - b.price;
};

const getHighPriceIndex = (offers: Offer[]) => {
  let it = offers.length - 1;
  for (; it > 0 && !inStock(offers[it]); it--);
  return it;
};

const splitCategory = (firstCategory: string) =>
  firstCategory.split("/").filter(Boolean);

const toAdditionalPropertyCategories = <
  P extends LegacyProductVTEX | ProductVTEX,
>(product: P): Product["additionalProperty"] => {
  const categories = splitCategory(product.categories[0]);
  const categoryIds = splitCategory(product.categoriesIds[0]);

  return [
    ...categories.map((category, index) => ({
      "@type": "PropertyValue" as const,
      name: "category",
      propertyID: categoryIds[index],
      value: category,
    })),
  ];
};

const toAdditionalPropertyClusters = <
  P extends LegacyProductVTEX | ProductVTEX,
>(product: P): Product["additionalProperty"] => {
  const mapEntriesToIdName = ([id, name]: [string, unknown]) => ({
    id,
    name: name as string,
  });

  const allClusters = isLegacyProduct(product)
    ? Object.entries(product.productClusters).map(mapEntriesToIdName)
    : product.productClusters;

  const highlightsSet = isLegacyProduct(product)
    ? new Set(Object.keys(product.clusterHighlights))
    : new Set(product.clusterHighlights.map(({ id }) => id));

  return allClusters.map(({ id, name }) => ({
    "@type": "PropertyValue" as const,
    name: "cluster",
    value: name || "",
    propertyID: id,
    description: highlightsSet.has(id) ? "highlight" : undefined,
  }));
};

export const toProduct = <P extends LegacyProductVTEX | ProductVTEX>(
  product: P,
  sku: P["items"][number],
  level = 0, // prevent inifinte loop while self referencing the product
  options: ProductOptions,
): Product => {
  const { baseUrl, priceCurrency } = options;
  const {
    brand,
    brandId,
    brandImageUrl,
    productId,
    productReference,
    description,
    releaseDate,
    items,
  } = product;
  const { name, ean, itemId: skuId } = sku;

  const groupAdditionalProperty = isLegacyProduct(product)
    ? legacyToProductGroupAdditionalProperties(product)
    : toProductGroupAdditionalProperties(product);
  const specificationsAdditionalProperty = isLegacySku(sku)
    ? toAdditionalPropertiesLegacy(sku)
    : toAdditionalProperties(sku);
  const images = nonEmptyArray(sku.images) ?? [DEFAULT_IMAGE];
  const offers = (sku.sellers ?? []).map(toOffer).sort(bestOfferFirst);
  const highPriceIndex = getHighPriceIndex(offers);
  const lowPriceIndex = 0;

  const isVariantOf = level < 1
    ? {
      "@type": "ProductGroup",
      productGroupID: productId,
      hasVariant: items.map((sku) => toProduct(product, sku, 1, options)),
      url: getProductGroupURL(baseUrl, product).href,
      name: product.productName,
      additionalProperty: groupAdditionalProperty,
      model: productReference,
    } satisfies ProductGroup
    : undefined;

  // From schema.org: A category for the item. Greater signs or slashes can be used to informally indicate a category hierarchy
  const categoriesString = splitCategory(product.categories[0]).join(
    DEFAULT_CATEGORY_SEPARATOR,
  );

  const categoryAdditionalProperties = toAdditionalPropertyCategories(product);
  const clusterAdditionalProperties = toAdditionalPropertyClusters(product);

  const additionalProperty = specificationsAdditionalProperty.concat(
    categoryAdditionalProperties ?? [],
  ).concat(clusterAdditionalProperties ?? []);

  return {
    "@type": "Product",
    category: categoriesString,
    productID: skuId,
    url: getProductURL(baseUrl, product, sku.itemId).href,
    name,
    description,
    brand: {
      "@type": "Brand",
      "@id": brandId?.toString(),
      name: brand,
      logo: brandImageUrl,
    },
    sku: skuId,
    gtin: ean,
    releaseDate,
    additionalProperty,
    isVariantOf,
    image: images.map(({ imageUrl, imageText }) => ({
      "@type": "ImageObject" as const,
      alternateName: imageText ?? "",
      url: imageUrl,
    })),
    offers: offers.length > 0
      ? {
        "@type": "AggregateOffer",
        priceCurrency,
        highPrice: offers[highPriceIndex]?.price ?? null,
        lowPrice: offers[lowPriceIndex]?.price ?? null,
        offerCount: offers.length,
        offers,
      }
      : undefined,
  };
};

const toBreadcrumbList = (
  product: ProductVTEX | LegacyProductVTEX,
  { baseUrl }: ProductOptions,
): BreadcrumbList => {
  const { categories, productName } = product;
  const names = categories[0]?.split("/").filter(Boolean);
  const segments = names.map(slugify);

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...names.map((name, index) => {
        const position = index + 1;

        return {
          "@type": "ListItem" as const,
          name,
          item:
            new URL(`/${segments.slice(0, position).join("/")}`, baseUrl).href,
          position,
        };
      }),
      {
        "@type": "ListItem",
        name: productName,
        item: getProductGroupURL(baseUrl, product).href,
        position: categories.length + 1,
      },
    ],
    numberOfItems: categories.length + 1,
  };
};

const legacyToProductGroupAdditionalProperties = (
  product: LegacyProductVTEX,
) =>
  product.allSpecifications?.flatMap((name) => {
    const values = (product as unknown as Record<string, string[]>)[name];

    return values.map((value) =>
      ({
        "@type": "PropertyValue",
        name,
        value,
        valueReference: "SPECIFICATION",
      }) as const
    );
  }) ?? [];

const toProductGroupAdditionalProperties = ({ properties = [] }: ProductVTEX) =>
  properties.flatMap(({ name, values }) =>
    values.map((value) =>
      ({
        "@type": "PropertyValue",
        name,
        value,
        valueReference: "PROPERTY" as string,
      }) as const
    )
  );

const toAdditionalProperties = (
  sku: SkuVTEX,
): PropertyValue[] =>
  sku.variations?.flatMap(({ name, values }) =>
    values.map((value) =>
      ({
        "@type": "PropertyValue",
        name,
        value,
        valueReference: "SPECIFICATION",
      }) as const
    )
  ) ?? [];

const toAdditionalPropertiesLegacy = (sku: LegacySkuVTEX): PropertyValue[] => {
  const { variations = [], attachments = [] } = sku;

  const specificationProperties = variations.flatMap((variation) =>
    sku[variation].map((value) =>
      ({
        "@type": "PropertyValue",
        name: variation,
        value,
        valueReference: "SPECIFICATION",
      }) as const
    )
  );

  const attachmentProperties = attachments.map((attachment) =>
    ({
      "@type": "PropertyValue",
      propertyID: `${attachment.id}`,
      name: attachment.name,
      value: attachment.domainValues,
      required: attachment.required,
      valueReference: "ATTACHMENT",
    }) as const
  );

  return [...specificationProperties, ...attachmentProperties];
};

const toOffer = ({
  commertialOffer: offer,
  sellerId,
}: SellerVTEX): Offer => ({
  "@type": "Offer",
  price: offer.spotPrice ?? offer.Price,
  seller: sellerId,
  priceValidUntil: offer.PriceValidUntil,
  inventoryLevel: { value: offer.AvailableQuantity },
  priceSpecification: [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: offer.ListPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: offer.Price,
    },
    ...offer.Installments.map((installment): UnitPriceSpecification => ({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: installment.PaymentSystemName,
      description: installment.Name,
      billingDuration: installment.NumberOfInstallments,
      billingIncrement: installment.Value,
      price: installment.TotalValuePlusInterestRate,
    })),
  ],
  availability: offer.AvailableQuantity > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock",
});

export const legacyFacetToFilter = (
  name: string,
  facets: LegacyFacet[],
  url: URL,
  map: string,
  behavior: "dynamic" | "static",
): Filter | null => {
  const mapSegments = map.split(",");
  const pathSegments = url.pathname
    .replace(/^\//, "")
    .split("/")
    .slice(0, mapSegments.length);
  const mapSet = new Set(mapSegments);
  const pathSet = new Set(pathSegments);

  const getLink = (facet: LegacyFacet, selected: boolean) => {
    // Do not allow removing root facet to avoid going back to home page
    if (mapSegments.length === 1) {
      return `${url.pathname}${url.search}`;
    }

    const index = pathSegments.findIndex((s) => s === facet.Value);
    const newMap = selected
      ? [...mapSegments.filter((_, i) => i !== index)]
      : [...mapSegments, facet.Map];
    const newPath = selected
      ? [...pathSegments.filter((_, i) => i !== index)]
      : [...pathSegments, facet.Value];

    const link = new URL(`/${newPath.join("/")}`, url);
    link.searchParams.set("map", newMap.join(","));
    if (behavior === "static") {
      link.searchParams.set("fmap", url.searchParams.get("fmap") || map);
    }

    return `${link.pathname}${link.search}`;
  };

  return {
    "@type": "FilterToggle",
    quantity: facets.length,
    label: name,
    key: name,
    values: facets.map((facet) => {
      const selected = mapSet.has(facet.Map) && pathSet.has(facet.Value);

      return ({
        value: facet.Value,
        quantity: facet.Quantity,
        url: getLink(facet, selected),
        label: facet.Name,
        selected,
      });
    }),
  };
};

export const filtersToSearchParams = (
  selectedFacets: SelectedFacet[],
) => {
  const searchParams = new URLSearchParams();

  for (const { key, value } of selectedFacets) {
    searchParams.append(`filter.${key}`, value);
  }

  return searchParams;
};

/**
 * Transform ?map urls into selected facets. This happens when a store is migrating
 * to Deco and also migrating from VTEX Legacy to VTEX Intelligent Search.
 */
export const legacyFacetsFromURL = (url: URL) => {
  const mapSegments = url.searchParams.get("map")?.split(",") ?? [];
  const pathSegments = url.pathname.split("/").slice(1); // Remove first slash
  const length = Math.min(mapSegments.length, pathSegments.length);

  const selectedFacets: SelectedFacet[] = [];
  for (let it = 0; it < length; it++) {
    selectedFacets.push({ key: mapSegments[it], value: pathSegments[it] });
  }

  return selectedFacets;
};

export const filtersFromURL = (url: URL) => {
  const selectedFacets: SelectedFacet[] = legacyFacetsFromURL(url);

  url.searchParams.forEach((value, name) => {
    const [filter, key] = name.split(".");

    if (filter === "filter" && typeof key === "string") {
      selectedFacets.push({ key, value });
    }
  });

  return selectedFacets;
};

export const mergeFacets = (
  f1: SelectedFacet[],
  f2: SelectedFacet[],
): SelectedFacet[] => {
  const facetKey = (facet: SelectedFacet) =>
    `key:${facet.key}-value:${facet.value}`;
  const merged = new Map<string, SelectedFacet>();

  for (const f of f1) {
    merged.set(facetKey(f), f);
  }
  for (const f of f2) {
    merged.set(facetKey(f), f);
  }

  return [...merged.values()];
};

const isValueRange = (
  facet: FacetValueRange | FacetValueBoolean,
): facet is FacetValueRange =>
  // deno-lint-ignore no-explicit-any
  Boolean((facet as any).range);

const facetToToggle =
  (selectedFacets: SelectedFacet[], key: string, query?: string) =>
  (item: FacetValueRange | FacetValueBoolean): FilterToggleValue => {
    const { quantity, selected } = item;
    const isRange = isValueRange(item);

    const value = isRange
      ? formatRange(item.range.from, item.range.to)
      : item.value;
    const label = isRange ? value : item.name;
    const facet = { key, value };

    const filters = selected
      ? selectedFacets.filter((f) => f.key !== key || f.value !== value)
      : [...selectedFacets, facet];

    return {
      value,
      quantity,
      selected,
      url: `?${filtersToSearchParams(filters)}${query ? "&q=" + query : ""}`,
      label,
    };
  };

export const toFilter =
  (selectedFacets: SelectedFacet[], query?: string) =>
  ({ key, name, quantity, values }: FacetVTEX): Filter => ({
    "@type": "FilterToggle",
    key,
    label: name,
    quantity: quantity,
    values: values.map(facetToToggle(selectedFacets, key, query)),
  });

function nodeToNavbar(node: Category): Navbar {
  const url = new URL(node.url, "https://example.com");

  return {
    href: `${url.pathname}${url.search}`,
    label: node.name,
    children: node.children.map(nodeToNavbar),
  };
}

export const categoryTreeToNavbar = (tree: Category[]): Navbar[] =>
  tree.map(nodeToNavbar);
