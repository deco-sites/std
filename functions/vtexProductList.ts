import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import loader from "deco-sites/std/packs/vtex/loaders/intelligentSearch/productList.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { Product } from "../commerce/types.ts";

export interface Props {
  /** @description query to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
  //* @enumNames ["relevance", "greater discount", "arrivals", "name asc", "name desc", "most ordered", "price asc", "price desc"]
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
 * @title VTEX product list loader
 * @description Usefull for shelves and static galleries.
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Product[] | null,
  StateVTEX
> = withISFallback(async (
  req,
  ctx,
  props,
) => {
  const data = await loader(
    props,
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
});

export default loaderV0;
