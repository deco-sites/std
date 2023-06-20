import {
  Filter,
  ListItem,
  Offer,
  Product,
  PropertyValue,
  QuantitativeValue,
} from "deco-sites/std/commerce/types.ts";
import {
  LanguageTypes,
  PriceInterval,
  ProductBaseNuvemShop,
  ProductImage,
  ProductVariant,
} from "deco-sites/std/commerce/nuvemShop/types.ts";

export function toProduct(
  product: ProductBaseNuvemShop,
  baseUrl: URL,
  sku: string | null = null,
): Product {
  const {
    id,
    name,
    description,
    images,
    categories,
    brand,
    variants,
    canonical_url,
  } = product;

  const offers = variants.map((variant) => getOffer(variant));
  const prices = getLowestPromotionalPrice(offers);

  const nuvemUrl = new URL(canonical_url);
  const localUrl = new URL(nuvemUrl.pathname, baseUrl.origin);

  const productVariants = getVariants(product, localUrl.href);

  const schemaProduct: Product = {
    "@type": "Product",
    productID: id?.toString() || "",
    gtin: id?.toString() || "",
    name: getPreferredLanguage(name), // Assuming there's only one name
    // NuvemShop description is returned as HTML and special characters and
    // not working properly
    description: getPreferredLanguage(description).replace(
      /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g,
      "",
    ),
    url: `${localUrl.href}${sku ? `?sku=${sku}` : ""}`,
    // TODO: Check what to do here
    sku: productVariants[0].sku,
    additionalProperty: getProperties(product.variants, product.attributes),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: id?.toString() || "",
      hasVariant: productVariants,
      name: getPreferredLanguage(name),
      additionalProperty: getProperties(product.variants, product.attributes),
    },
    image: images.map((image: ProductImage) => ({
      "@type": "ImageObject",
      url: image.src,
    })),
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "BRL",
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
      value: getStockVariant(variant.stock),
    } as QuantitativeValue,
    price: variant.promotional_price || 0,
    availability: getStockVariant(variant.stock) > 0
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

function getStockVariant(stock: number | null | undefined): number {
  // NuvemShop returns null when the stock is equal to infinity, so when null
  // is returned i tem has a stock of infinity.
  if (stock === null) return 9999;
  else if (!stock) return 0;
  else return stock;
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

function getVariants(product: ProductBaseNuvemShop, url: string) {
  return product.variants.map((variant) => {
    const { values } = variant;
    const name = values.reduce(
      (name, value) => name + " " + getPreferredLanguage(value),
      ``,
    );
    const variantWithName = { ...variant, name: name.trim() };
    return productVariantToProduct(variantWithName, product, url);
  });
}

function productVariantToProduct(
  variant: ProductVariant,
  product: ProductBaseNuvemShop,
  url: string,
): Product {
  const { product_id, sku, promotional_price, price } = variant;
  const { name, description, images, categories, brand } = product;

  const schemaProduct: Product = {
    "@type": "Product",
    productID: product_id?.toString() || "",
    sku: "",
    name: getPreferredLanguage(name) + " " + variant.name,
    // NuvemShop description is returned as HTML and special characters and not working properly
    description: getPreferredLanguage(description).replace(
      /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g,
      "",
    ),
    image: images.map((image: ProductImage) => ({
      "@type": "ImageObject",
      url: image.src,
    })),
    category: getPreferredLanguage(categories[0]?.name || ""), // Assuming there's only one category
    brand: brand,
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "BRL",
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
    additionalProperty: getProperties([variant], product.attributes),
    url: `${url}?sku=${sku}`,
  };

  return schemaProduct;
}

function getProperties(
  productVariants: ProductVariant[],
  attributes: LanguageTypes[],
): PropertyValue[] {
  return productVariants.map(({ values }) => {
    return values.map((value, index) =>
      ({
        "@type": "PropertyValue",
        name: getPreferredLanguage(attributes[index]),
        value: getPreferredLanguage(value),
        valueReference: "SPECIFICATION",
      }) as const
    );
  }).flat();
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

function getFilterPriceIntervals(
  products: ProductBaseNuvemShop[],
): PriceInterval[] {
  const prices = products.flatMap((product) =>
    product.variants
      .filter((variant) => variant.price !== undefined)
      .map((variant) => variant.price!)
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const size = 3;
  const intervalSize = (maxPrice - minPrice) / size;

  return Array.from({ length: size }).map((_, index) => {
    const intervalMin = minPrice + index * intervalSize;
    const intervalMax = intervalMin + intervalSize;
    const quantity = products.filter((product) => {
      const productMinPrice = calculateProductMinPrice(product);
      return productMinPrice <= intervalMax && productMinPrice >= intervalMin;
    }).length;

    return {
      minPrice: intervalMin.toFixed(2),
      maxPrice: intervalMax.toFixed(2),
      quantity,
    };
  });
}

function calculateProductMinPrice(product: ProductBaseNuvemShop): number {
  const { variants } = product;

  const { minPrice } = variants.reduce(
    (acc, variant) => {
      const { price } = variant;
      if (price !== undefined) {
        return {
          minPrice: Math.min(acc.minPrice, price),
        };
      }
      return acc;
    },
    { minPrice: Number.MAX_SAFE_INTEGER },
  );

  return minPrice;
}

export function toFilters(
  products: ProductBaseNuvemShop[],
  maxPrice: number,
  minPrice: number,
  url: string,
): Filter[] {
  const priceRange = {
    "@type": "FilterRange" as const,
    label: "Preço",
    key: "price_range",
    values: {
      min: maxPrice,
      max: minPrice,
    },
  };

  const priceIntervals = getFilterPriceIntervals(products);

  const priceToggle = {
    "@type": "FilterToggle" as const,
    label: "Preço",
    key: "price_toggle",
    values: priceIntervals.map((
      { minPrice, maxPrice, quantity },
    ) => ({
      quantity: quantity,
      label: `R$${minPrice} - R$${maxPrice}`,
      value: `${minPrice}`,
      selected: isIntervalSelected(url, minPrice),
      url: getLink(url, minPrice, maxPrice),
    })),
    quantity: products.length,
  };

  return [priceRange, priceToggle];
}

const isIntervalSelected = (url: string, minPrice: string) => {
  const productUrl = new URL(url);
  return productUrl.searchParams.toString().includes(`min_price=${minPrice}`);
};

const getLink = (url: string, minPrice: string, maxPrice: string): string => {
  const productUrl = new URL(url);
  productUrl.searchParams.delete("min_price");
  productUrl.searchParams.delete("max_price");
  productUrl.searchParams.append("min_price", minPrice);
  productUrl.searchParams.append("max_price", maxPrice);

  return productUrl.href;
};

export const getBreadCrumbs = (
  product: ProductBaseNuvemShop,
): ListItem[] => {
  const nuvemUrl = new URL(product.canonical_url);
  const localUrl = new URL(nuvemUrl.pathname, nuvemUrl.origin);

  return [
    ...product.categories.map((category, index) => {
      const position = index + 1;

      return {
        "@type": "ListItem" as const,
        name: getPreferredLanguage(category.name),
        item: `/${getPreferredLanguage(category.name)}`,
        position,
      };
    }),
    {
      "@type": "ListItem",
      name: getPreferredLanguage(product.name),
      item: localUrl.href,
      position: product.categories.length + 1,
    },
  ];
};
