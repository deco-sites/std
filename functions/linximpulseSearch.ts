import loader, {
  Props,
} from "deco-sites/std/packs/linximpulse/loaders/search/search.ts";
import type { Product } from "../commerce/types.ts";
import type { LoaderFunction } from "$live/types.ts";

/**
 * @title LinxImpulse - Search Products
 * @description Useful for shelves and static galleries.
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Product[] | null
> = async (
  req,
  ctx,
  props: Props,
) => {
  const data = await loader(
    props,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
