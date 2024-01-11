import loader from "deco-sites/std/packs/vtex/loaders/legacy/productList.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { Product } from "../commerce/types.ts";

export interface Props {
  /** @description total number of items to display */
  count: number;
  /** @description query to use on search */
  query?: string;
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   */
  collection?: string[];
}

/**
 * @title VTEX Legacy - Search Products (deprecated)
 * @description Useful for shelves and static galleries.
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Product[] | null,
  StateVTEX
> = async (
  req,
  ctx,
  props,
) => {
  const p = props.query
    ? { term: props.query, count: props.count }
    : { collection: props.collection?.[0], count: props.count };

  // @ts-ignore this should work.
  const data = await loader(p, req, ctx.state);

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
