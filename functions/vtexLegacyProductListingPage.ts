import loader, {
  Props,
} from "deco-sites/std/packs/vtex/loaders/legacy/productListingPage.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";

/**
 * @title VTEX legacy product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 * @deprecated
 */
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
