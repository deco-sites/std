import loader from "deco-sites/std/packs/vtex/loaders/legacy/productList.ts";
import type { Product } from "../commerce/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";

interface CollectionProps {
  /** @description total number of items to display */
  count: number;
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   */
  collection: string[];
}

interface QueryProps {
  /** @description total number of items to display */
  count: number;
  /** @description query to use on search */
  query: string;
}

export type Props = CollectionProps | QueryProps;

// deno-lint-ignore no-explicit-any
const isCollectionProps = (props: any): props is CollectionProps =>
  Array.isArray(props.collection);

/**
 * @title VTEX legacy product list loader
 * @description Usefull for shelves and static galleries.
 * @deprecated
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
  const p = isCollectionProps(props)
    ? { collection: props.collection[0], count: props.count }
    : { term: props.query, count: props.count };

  const data = await loader(p, req, ctx.state);

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
