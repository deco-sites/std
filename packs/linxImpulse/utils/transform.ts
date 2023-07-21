import type {
  Product,
  ProductGroup,
  PropertyValue,
  UnitPriceSpecification,
} from "deco-sites/std/commerce/types.ts";

import { DEFAULT_CATEGORY_SEPARATOR } from "deco-sites/std/commerce/utils.ts";

import type {
  ProductLinxImpulse,
  ProductLinxImpulseRecommendations,
  Sku,
} from "deco-sites/std/packs/linxImpulse/types.ts";

interface ProductOptions {
  baseUrl: string;
}

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
  sku: ProductLinxImpulse["skus"][number]["properties"],
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
  const { eanCode, oldPrice, price, details: skuDetails, stock } = sku;

  const skuId = skuDetails.skuSellers.sku;

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
      billingIncrement: Number((price / (number)).toFixed(3).slice(0, -1)),
      price,
    }));
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
      hasVariant: skus.map((sku) =>
        toProduct(product, sku.properties, 1, options)
      ),
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
    brand: details?.brand as string ?? "",
    sku: skuId,
    gtin: eanCode,
    releaseDate: "",
    additionalProperty,
    isVariantOf,
    image: Object.values(images).map((url) => ({
      "@type": "ImageObject" as const,
      alternateName: "",
      url: `${new URL(url, baseUrl)}`,
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
          seller: skuDetails.skuSellers.sellerId,
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
