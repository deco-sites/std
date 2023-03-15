import type { LiveState } from "$live/types.ts";

import { HandlerContext } from "$fresh/server.ts";
import {
  ConfigShopify,
  createClient,
} from "deco-sites/std/commerce/shopify/client.ts";
import { toProduct } from "deco-sites/std/commerce/shopify/transform.ts";
import { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import { LiveConfig } from "$live/blocks/handler.ts";

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
 * @title Product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 */
async function searchLoader(
  req: Request,
  {
    state: { global, $live: props },
  }: HandlerContext<
    unknown,
    LiveConfig<Props, LiveState<{ configShopify?: ConfigShopify }>>
  >
): Promise<ProductListingPage> {
  const url = new URL(req.url);
  const { configShopify } = global;
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
    toProduct(p, p.variants.nodes[0])
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
  };
}

export default searchLoader;
