import loader, {
  Props,
} from "deco-sites/std/packs/vtex/loaders/legacy/productListingPage.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";

/**
 * @title VTEX Catalog - Product Listing Page (deprecated)
 * @description Useful for category, search, brand and collection pages.
 * @deprecated
 */
// @ts-ignore this should work.
const loaderV0: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVTEX
> = async (
  req,
  ctx,
  props,
) => {
  const data = await loader(
    {
      ...props,
      term: props.term || ctx.params["0"],
    },
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
