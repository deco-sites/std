import loader, {
  Props,
} from "deco-sites/std/packs/vtex/loaders/intelligentSearch/productListingPage.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

/**
 * @title VTEX Intelligent Search - Product Listing page (deprecated)
 * @description Useful for category, search, brand and collection pages.
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
