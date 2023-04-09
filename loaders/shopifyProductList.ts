import type { LoaderContext } from "$live/types.ts";

import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProduct } from "../commerce/shopify/transform.ts";
import { Product } from "../commerce/types.ts";

export interface Props {
  /** @description search term to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
}

export default async function searchLoader(
  _req: Request,
  ctx: LoaderContext<Props, { configShopify: ConfigShopify }>,
): Promise<Product[] | null> {
  const props = ctx.state.$live;
  const { configShopify } = ctx.state;
  const shopify = createClient(configShopify);

  const count = props.count ?? 12;
  const query = props.query || "";

  // Fetch Shopify's API using deco's built-in Shopify Client
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
