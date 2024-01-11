import type { DecoState as LiveState, LoaderFunction } from "deco/types.ts";

import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProduct } from "../commerce/shopify/transform.ts";
import type { ProductListingPage } from "../commerce/types.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  query?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
}

/**
 * @title Shopify - Product Listing page
 * @description Returns data ready for search pages like category,brand pages
 */
const searchLoader: LoaderFunction<
  Props,
  ProductListingPage | null,
  LiveState<{ configShopify: ConfigShopify }>
> = async (
  req,
  ctx,
  props,
) => {
  const url = new URL(req.url);
  // @ts-ignore this should work.
  const { configShopify } = ctx.state.global;
  const shopify = createClient(configShopify);

  const count = props.count ?? 12;
  const query = props.query || url.searchParams.get("q") || "";
  const page = Number(url.searchParams.get("page")) ?? 0;

  // search products on Shopify. Feel free to change any of these parameters
  const data = await shopify.products({
    first: count,
    query: query,
  });

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = data?.products.nodes.map((p) =>
    toProduct(p, p.variants.nodes[0], new URL(req.url))
  );

  const hasNextPage = Boolean(data?.products.pageInfo.hasNextPage ?? false);
  const hasPreviousPage = false;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    data: {
      "@type": "ProductListingPage",
      // TODO: Find out what's the right breadcrumb on shopify
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      filters: [],
      products: products ?? [],
      pageInfo: {
        nextPage: hasNextPage ? nextPage.toString() : undefined,
        previousPage: hasPreviousPage ? previousPage.toString() : undefined,
        currentPage: page,
      },
      sortOptions: [],
    },
  };
};

export default searchLoader;
