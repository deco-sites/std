import type { DecoState as LiveState, LoaderFunction } from "deco/types.ts";

import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProduct } from "../commerce/shopify/transform.ts";
import type { Product } from "../commerce/types.ts";

export interface Props {
  /** @description search term to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
}

/**
 * @title Shopify - Search Products
 * @description Useful for shelves and static galleries.
 */
const searchLoader: LoaderFunction<
  Props,
  Product[] | null,
  LiveState<{ configShopify: ConfigShopify }>
> = async (
  _req,
  ctx,
  props,
) => {
  // @ts-ignore this should work.
  const { configShopify } = ctx.state.global;
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
    toProduct(p, p.variants.nodes[0], new URL(_req.url))
  );

  return {
    data: products ?? [],
  };
};

export default searchLoader;
