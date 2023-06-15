import {
  Filter,
  Offer,
  Product,
  PropertyValue,
  QuantitativeValue,
} from "deco-sites/std/commerce/types.ts";
import {
  LanguageTypes,
  NuvemShopSort,
  ProductBaseNuvemShop,
  ProductImage,
  ProductVariant,
} from "deco-sites/std/commerce/nuvemShop/types.ts";

export function toProduct(
  product: ProductBaseNuvemShop,
): Product {
  const {
    id,
    name,
    description,
    images,
    categories,
    brand,
    variants,
    ...remainingAttibutes
  } = product;

  const offers = variants.map((variant) => getOffer(variant));
  const prices = getLowestPromotionalPrice(offers);

  const schemaProduct: Product = {
    "@type": "Product",
    productID: id?.toString() || "",
    name: getPreferredLanguage(name), // Assuming there's only one name
    description: getPreferredLanguage(description), // Assuming there's only one description
    sku: "",
    additionalProperty: getProperties(remainingAttibutes),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: id?.toString() || "",
      hasVariant: getVariants(product),
      name: getPreferredLanguage(name),
      additionalProperty: getProperties(remainingAttibutes),
    },
    image: images.map((image: ProductImage) => ({
      "@type": "ImageObject",
      url: image.src,
    })),
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "USD",
      highPrice: prices.price,
      lowPrice: prices.promotionalPrice,
      offerCount: variants.length,
      offers,
    },
    brand: brand,
    category: getPreferredLanguage(categories[0]?.name || ""), // Assuming there's only one category
  };

  return schemaProduct;
}

function getOffer(variant: ProductVariant): Offer {
  return {
    "@type": "Offer",
    seller: "NuvemShop",
    inventoryLevel: {
      value: variant.stock ? parseInt(variant.stock) : 0,
    } as QuantitativeValue,
    price: variant.promotional_price || 0,
    availability: variant.stock_management
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: variant.price || 0,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: variant.promotional_price || 0,
      },
    ],
  };
}

function getPreferredLanguage(
  item: LanguageTypes,
): string {
  if (!item || !item || typeof item !== "object") return "";

  if (item.en) {
    return item.en;
  } else if (item.pt) {
    return item.pt;
  } else if (item.es) {
    return item.es;
  } else {
    return "";
  }
}

function getVariants(product: ProductBaseNuvemShop) {
  return product.variants.map((variant) => {
    const { values } = variant;
    const name = values.reduce(
      (name, value) => name + " " + getPreferredLanguage(value),
      ``,
    );
    const variantWithName = { ...variant, name: name.trim() };
    return productVariantToProduct(variantWithName, product);
  });
}

function productVariantToProduct(
  variant: ProductVariant,
  { name, description, images, categories, brand }: ProductBaseNuvemShop,
): Product {
  const { product_id, sku, promotional_price, price } = variant;
  // Map the basic properties
  const schemaProduct: Product = {
    "@type": "Product",
    productID: product_id?.toString() || "",
    sku: sku?.toString() || "",
    name: getPreferredLanguage(name) + " " + variant.name,
    description: getPreferredLanguage(description),
    image: images.map((image: ProductImage) => ({
      "@type": "ImageObject",
      url: image.src,
    })),
    category: getPreferredLanguage(categories[0]?.name || ""), // Assuming there's only one category
    brand: brand,
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "USD",
      highPrice: price || 0,
      lowPrice: promotional_price || 0,
      offerCount: 1,
      offers: [getOffer(variant)],
    },
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: product_id?.toString() || "",
      hasVariant: [],
      name: getPreferredLanguage(name),
      additionalProperty: [],
    },
  };

  return schemaProduct;
}

function getProperties(product: {
  handle: string[];
  published: boolean;
  free_shipping: boolean;
  video_url: string;
  seo_title: string;
  seo_description: string;
  attributes: string[];
  tags: string;
  created_at: Date;
  updated_at: Date;
  requires_shipping: boolean;
}): PropertyValue[] {
  const properties = Object.entries(product);

  return properties.filter(([_, value]) => value).map(([key, value]) => ({
    "@type": "PropertyValue",
    value: typeof value === "object"
      ? getPreferredLanguage(value as LanguageTypes)
      : value?.toString(),
    name: key,
    valueReference: "SPECIFICATION",
  }));
}

function getLowestPromotionalPrice(
  offers: Offer[],
): { promotionalPrice: number; price: number } {
  const initialPrices = { promotionalPrice: Infinity, price: 0 };

  return offers.reduce((lowestPrices, offer) => {
    const { price, promotionalPrice } = offer.priceSpecification.reduce(
      (prices, priceSpec) => {
        if (
          priceSpec.priceType === "https://schema.org/ListPrice" &&
          priceSpec.price && priceSpec.price < prices.price
        ) {
          prices.price = priceSpec.price;
        }
        if (
          priceSpec.priceType === "https://schema.org/SalePrice" &&
          priceSpec.price && priceSpec.price < prices.promotionalPrice
        ) {
          prices.promotionalPrice = priceSpec.price;
        }
        return prices;
      },
      {
        price: lowestPrices.price,
        promotionalPrice: lowestPrices.promotionalPrice,
      },
    );

    return {
      price: (price < lowestPrices.price || lowestPrices.price === 0)
        ? price
        : lowestPrices.price,
      promotionalPrice: (promotionalPrice < lowestPrices.promotionalPrice)
        ? promotionalPrice
        : lowestPrices.promotionalPrice,
    };
  }, initialPrices);
}

export function toFilters(
  maxPrice: number,
  minPrice: number,
  sort: NuvemShopSort,
): Filter[] {
  const priceRange = {
    "@type": "FilterRange" as const,
    label: "Valor",
    key: "price_range",
    values: {
      min: maxPrice,
      max: minPrice,
    },
  };

  const sortFilter = {
    "@type": "FilterRange" as const,
    label: "Sort",
    key: "sort_by",
    values: {
      min: getIndexSort(sort),
      max: getIndexSort(sort),
    },
  };

  return [
    priceRange,
    sortFilter,
  ];
}

const getIndexSort = (sort: NuvemShopSort): number => {
  const sortOptions: NuvemShopSort[] = [
    "user",
    "price-ascending, cost-ascending",
    "price-descending, cost-descending",
    "alpha-ascending, name-ascending",
    "alpha-descending, name-descending",
    "created-at-ascending",
    "created-at-descending",
    "best-selling",
  ];

  return sortOptions.indexOf(sort);
};
