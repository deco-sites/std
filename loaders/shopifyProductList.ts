import { HandlerContext } from "$fresh/server.ts";
import type { LiveConfig, LiveState } from "$live/types.ts";

import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProduct } from "../commerce/shopify/transform.ts";
import { Product } from "../commerce/types.ts";

export interface Props {
  /** @description search term to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
}

/**
 * @title Product list loader
 * @description Usefull for shelves and static galleries.
 */
async function searchLoader(
  _req: Request,
  {
    state: { global, $live: props },
  }: HandlerContext<
    unknown,
    LiveConfig<Props, LiveState<{ configShopify?: ConfigShopify }>>
  >,
): Promise<Product[]> {
  const { configShopify } = global;
  const shopify = createClient(configShopify);

  const count = props.count ?? 12;
  const query = props.query || "";

  // search products on Shopify. Feel free to change any of these parameters
  const data = await shopify.products({
    first: count,
    query,
  });

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = data?.products.nodes.map((p) =>
    toProduct(p, p.variants.nodes[0])
  );

  return products ?? [];
}

export default searchLoader;
