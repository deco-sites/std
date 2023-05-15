import type {
  BreadcrumbList,
  Filter,
  Navbar,
  Offer,
  Product,
  ProductDetailsPage,
  ProductGroup,
  PropertyValue,
  UnitPriceSpecification,
} from "deco-sites/std/commerce/types.ts";

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

export const pickSku = <T extends ProductVTEX | LegacyProductVTEX>(
  product: T,
  maybeSkuId: string | undefined,
): T["items"][number] => {
  const skuId = maybeSkuId ?? product.items[0]?.itemId;

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
): ProductDetailsPage => {
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
  const offers = sku.sellers.map(toOffer).sort(bestOfferFirst);
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
  const categoriesString = splitCategory(product.categories[0]).join(">");

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
    brand,
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

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...categories.reverse().map((categoryPath, index) => {
        const splitted = categoryPath.split("/").filter(Boolean);
        const name = splitted[splitted.length - 1];
        const item = splitted.map(slugify).join("/");

        return {
          "@type": "ListItem" as const,
          name,
          item: new URL(`/${item}`, baseUrl).href,
          position: index + 1,
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
  selectedFacets: { key: string; value: string }[],
) => {
  const searchParams = new URLSearchParams();

  for (const { key, value } of selectedFacets) {
    searchParams.append(`filter.${key}`, value);
  }

  return searchParams;
};

export const filtersFromSearchParams = (params: URLSearchParams) => {
  const selectedFacets: { key: string; value: string }[] = [];

  params.forEach((value, name) => {
    const [filter, key] = name.split(".");

    if (filter === "filter" && typeof key === "string") {
      selectedFacets.push({ key, value });
    }
  });

  return selectedFacets;
};

export const toFilter = (
  facet: FacetVTEX,
  selectedFacets: { key: string; value: string }[],
): Filter | null => {
  if (facet.hidden) {
    return null;
  }

  /**
   * Example of facet for price
   */
  // {
  //   values: [
  //     {
  //       quantity: 27,
  //       name: "",
  //       key: "price",
  //       selected: false,
  //       range: { from: 330, to: 350 }
  //     },
  //     {
  //       quantity: 24,
  //       name: "",
  //       key: "price",
  //       selected: false,
  //       range: { from: 299, to: 330 }
  //     },
  //     {
  //       quantity: 8,
  //       name: "",
  //       key: "price",
  //       selected: false,
  //       range: { from: 350, to: 389 }
  //     }
  //   ],
  //   type: "PRICERANGE",
  //   name: "Preço",
  //   hidden: false,
  //   key: "price",
  //   quantity: 3
  // }

  if (facet.type === "PRICERANGE" || false) {
    console.log(facet);
    /**
     * If the store wants to display a range UI, this should be changed
     * to return `"@type": "FilterRange"`.
     */

    return {
      "@type": "FilterToggle",
      key: facet.key,
      label: facet.name,
      quantity: facet.quantity,
      values: (facet.values as FacetValueRange[]).map((
        { quantity, selected, range },
      ) => {
        // TODO: Figure out how to to send new facet
        const filters: { key: string; value: string }[] = [];
        // const newFacet = { key: facet.key, };
        // const filters = selected
        //   ? selectedFacets.filter((facet) =>
        //     facet.key !== newFacet.key && facet.value !== newFacet.value
        //   )
        //   : [...selectedFacets, newFacet];

        return {
          quantity,
          selected,
          range,
          url: `?${filtersToSearchParams(filters).toString()}`,
          // TODO: Figure out how to not pass this
          label: "",
          value: "",
        };
      }),
    };
  }

  return {
    "@type": "FilterToggle",
    key: facet.key,
    label: facet.name,
    quantity: facet.quantity,
    values: (facet.values as FacetValueBoolean[]).map((
      { quantity, name, value, selected },
    ) => {
      const newFacet = { key: facet.key, value };
      const filters = selected
        ? selectedFacets.filter((facet) =>
          facet.key !== newFacet.key && facet.value !== newFacet.value
        )
        : [...selectedFacets, newFacet];

      return {
        value,
        quantity,
        selected,
        url: `?${filtersToSearchParams(filters).toString()}`,
        label: name,
      };
    }),
  };
};

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
