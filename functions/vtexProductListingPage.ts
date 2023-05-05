import loader, {
  Props,
} from "deco-sites/std/packs/vtex/loaders/intelligentSearch/productListingPage.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";

/**
 * @title VTEX product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  ProductListingPage | null,
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
