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
   * @title Collection ID
   * @pattern \d*
   */
  collection?: string[];
}

/**
 * @title VTEX Intelligent Search - Search Products
 * @description Use it in Shelves and static Galleries.
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
  const p = props.query
    ? { query: props.query, count: props.count }
    : { collection: props.collection?.[0], count: props.count };

  const data = await loader(
    p,
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
});

export default loaderV0;
