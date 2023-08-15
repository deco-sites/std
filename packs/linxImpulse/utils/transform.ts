import type {
  Filter,
  FilterToggleValue,
  Product,
  ProductGroup,
  PropertyValue,
  UnitPriceSpecification,
} from "deco-sites/std/commerce/types.ts";
import type {
  ContinuousValueFacetLinxImpulse,
  DiscreteValueFacetLinxImpulse,
  FacetLinxImpulse,
  ProductLinxImpulse,
  ProductLinxImpulseRecommendations,
  ProductOptions,
  SelectedFacet,
  Sku,
} from "deco-sites/std/packs/linxImpulse/types.ts";
import { DEFAULT_CATEGORY_SEPARATOR } from "deco-sites/std/commerce/utils.ts";
import { formatPrice } from "deco-sites/std/packs/linxImpulse/utils/format.ts";
import { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

const toProductGroupAdditionalProperties = ({ details }: ProductLinxImpulse) =>
  Object.keys(details).flatMap((property) => {
    const propertyArray = details[property] as string[];

    if (Array.isArray(propertyArray)) {
      return propertyArray.map((value) =>
        ({
          "@type": "PropertyValue",
          name: property,
          value: value,
          valueReference: "PROPERTY" as string,
        }) as const
      );
    }
  });

const toAdditionalPropertyCategories = <
  P extends ProductLinxImpulse,
>(product: P): Product["additionalProperty"] => {
  return [
    ...product.categories.map((category) => ({
      "@type": "PropertyValue" as const,
      name: "category",
      propertyID: "",
      value: category.name,
    })),
  ];
};

const toAdditionalPropertyClusters = ({ details }: ProductLinxImpulse) => {
  const clusterHighlights = details["clusterHighlights"] as string[];
  if (clusterHighlights) {
    return Object.entries(clusterHighlights).map(([clusterId, value]) =>
      ({
        "@type": "PropertyValue" as const,
        name: "cluster",
        value: value,
        propertyID: clusterId,
        description: "highlight",
      }) as const
    );
  }
  return [];
};

export const toProduct = <P extends ProductLinxImpulse>(
  product: P,
  sku: ProductLinxImpulse["skus"][number],
  level = 0,
  options: ProductOptions,
): Product => {
  const { baseUrl } = options;
  const {
    id: productID,
    name,
    description,
    images,
    details,
    categories,
    skus,
    status,
    installment,
  } = product;
  const { sku: skuId, properties } = sku;
  const { eanCode, oldPrice, price, details: skuDetails, stock } = properties;

  const categoriesString = categories.map((category) => category.name).join(
    DEFAULT_CATEGORY_SEPARATOR,
  );

  const getProductURL = (
    origin: string,
    product: ProductLinxImpulse,
    skuId?: string,
  ) => {
    const parsedUrl = new URL(product.url, origin);
    const parsedPathName = parsedUrl.pathname;
    const canonicalUrl = new URL(parsedPathName, origin);

    if (skuId) {
      canonicalUrl.searchParams.set("skuId", skuId);
    }

    return canonicalUrl;
  };

  const getPriceSpecification = () => {
    const installments = Array.from(
      { length: installment.count },
      (_, index) => index + 1,
    );

    return installments.map((number) => ({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: "Installment",
      description: number === 1 ? "à vista" : `${number} vezes sem juros`,
      billingDuration: number,
      billingIncrement: Number((price / number).toFixed(3).slice(0, -1)),
      price,
    }));
  };

  const getProductImageURL = (
    url: string,
  ) => {
    const protocol = url.startsWith("http") ? "" : "https://";
    const imageUrl = new URL(`${protocol}${url}`);
    return imageUrl;
  };

  const groupAdditionalProperty = toProductGroupAdditionalProperties(product)
    .filter((property) => property);

  const additionalPropertyCategories = toAdditionalPropertyCategories(product);
  const additionalPropertyClusters = toAdditionalPropertyClusters(product);

  const additionalProperty = additionalPropertyCategories?.concat(
    additionalPropertyClusters ?? [],
  );

  const isVariantOf = level < 1
    ? {
      "@type": "ProductGroup",
      productGroupID: productID,
      hasVariant: skus.map((sku) => toProduct(product, sku, 1, options)),
      url: getProductURL(baseUrl, product).href,
      name: name,
      additionalProperty: groupAdditionalProperty as PropertyValue[],
      model: details?.productReference as string,
    } satisfies ProductGroup
    : undefined;

  return {
    "@type": "Product",
    category: categoriesString,
    productID: skuId,
    url: getProductURL(baseUrl, product, skuId).href,
    name,
    description: description ?? "",
    brand: {
      "@type": "Brand",
      name: typeof details?.brand === "string" ? details.brand : "",
    },
    sku: skuId,
    gtin: eanCode,
    releaseDate: "",
    additionalProperty,
    isVariantOf,
    image: Object.values(images).map((url) => ({
      "@type": "ImageObject" as const,
      alternateName: "",
      url: getProductImageURL(url).href,
    })),
    offers: {
      "@type": "AggregateOffer",
      highPrice: oldPrice ?? null,
      lowPrice: price ?? null,
      offerCount: 0,
      offers: [
        {
          "@type": "Offer",
          price,
          seller: skuDetails.skuSellers?.sellerId,
          inventoryLevel: {
            value: stock,
          },
          priceSpecification:
            getPriceSpecification() as UnitPriceSpecification[],
          availability: `https://schema.org/${
            status === "available" ? "InStock" : "OutOfStock"
          }`,
        },
      ],
    },
  };
};

interface SearchTermQuery {
  queries: {
    query: string;
  }[];
}

export const toSearchTerm = ({ queries }: SearchTermQuery) => {
  return [
    ...queries.map(({ query }) => ({
      term: query,
    })),
  ];
};

export const toProductLinxImpulse = (
  product: ProductLinxImpulseRecommendations,
  sku: Sku,
) => {
  return {
    ...product,
    skus: [
      {
        sku: sku.sku,
        properties: sku,
      },
    ],
  };
};

export const filtersFromURL = (url: URL) => {
  const selectedFacets: SelectedFacet[] = [];

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

export const filtersToSearchParams = (
  selectedFacets: SelectedFacet[],
  url: URL,
) => {
  const searchParams = new URLSearchParams(url.searchParams);

  for (const [key] of searchParams.entries()) {
    if (key.startsWith("filter")) {
      searchParams.delete(key);
    }
  }
  searchParams.delete("page");

  for (const { key, value } of selectedFacets) {
    searchParams.append(`filter.${key}`, value);
  }

  return searchParams;
};

const facetToToggle = (
  selectedFacets: SelectedFacet[],
  filterId: number,
  url: URL,
) =>
(
  item: ContinuousValueFacetLinxImpulse | DiscreteValueFacetLinxImpulse,
): FilterToggleValue => {
  const isPrice = "unityId" in item;
  const value = isPrice
    ? `c:${filterId}:${item.unityId}:${item.min.value}:${item.max.value}`
    : `d:${filterId}:${item.id}`;
  const label = isPrice
    ? `${formatPrice(item.min.value)} - ${formatPrice(item.max.value)}`
    : item.label;
  const key = `${filterId}`;
  const facet = { key, value };
  const filters = item.selected
    ? selectedFacets.filter((f) => f.key !== key || f.value !== value)
    : [...selectedFacets, facet];

  return {
    value,
    quantity: item.size,
    selected: Boolean(item.selected),
    url: `?${filtersToSearchParams(filters, url)}`,
    label,
  };
};

export const toFilter = (
  filters: SelectedFacet[],
  url: URL,
) =>
({ id, attribute, values }: FacetLinxImpulse): Filter => ({
  "@type": "FilterToggle",
  key: `${id}`,
  label: attribute,
  quantity: values.length,
  values: values.filter((f) => f.size).map(facetToToggle(filters, id, url)),
});

export const toFiltersLinxImpulse = () => ({ value }: SelectedFacet) =>
  `filter=${value}`;
export const toRequestHeader = ({ url }: Account) =>
  url
    ? {
      origin: url,
      referer: url,
    }
    : undefined;
