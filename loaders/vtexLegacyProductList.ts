import type { LiveState } from "$live/types.ts";

import { HandlerContext } from "$fresh/server.ts";
import { LiveConfig } from "$live/blocks/handler.ts";
import {
  ConfigVTEX,
  createClient,
} from "deco-sites/std/commerce/vtex/client.ts";
import { toProduct } from "deco-sites/std/commerce/vtex/transform.ts";
import type { Product } from "../commerce/types.ts";
import type { LegacySort } from "../commerce/vtex/types.ts";

export interface Props {
  /** @description query to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
  //  TODO: Allow writting enum names
  // * @enumNames ["relevance", "greater discount", "arrivals", "name asc", "name desc", "most ordered", "price asc", "price desc"]
  /**
   * @description search sort parameter
   */
  sort?:
    | ""
    | "price:desc"
    | "price:asc"
    | "orders:desc"
    | "name:desc"
    | "name:asc"
    | "release:desc"
    | "discount:desc";

  // TODO: pattern property isn't being handled by RJSF
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   */
  collection?: string[];
}

/**
 * @title Legacy product list loader
 * @description Usefull for shelves and static galleries.
 */
async function legacyProductPageLoader(
  req: Request,
  ctx: HandlerContext<
    unknown,
    LiveConfig<Props, LiveState<{ configVTEX?: ConfigVTEX }>>
  >
): Promise<Product[]> {
  const props = ctx.state.$live;
  const { configVTEX } = ctx.state.global;
  const vtex = createClient(configVTEX);
  const url = new URL(req.url);

  const count = props.count ?? 12;
  const query = props.query || "";
  const O = props.sort || "";
  const searchParams = new URLSearchParams();

  if (props.collection) {
    const fq = props.collection
      .map((productClusterId) => `productClusterIds:${productClusterId}`)
      .join(",");
    searchParams.append("fq", fq);
  }

  // search products on VTEX. Feel free to change any of these parameters
  const vtexProducts = await vtex.catalog_system.products({
    fq: searchParams.get("fq") ?? "",
    term: query,
    _from: 0,
    _to: Math.max(count - 1, 0),
    O: O as LegacySort,
  });

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() })
  );

  return products;
}

export default legacyProductPageLoader;
