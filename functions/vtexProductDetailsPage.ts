import loader from "deco-sites/std/packs/vtex/loaders/intelligentSearch/productDetailsPage.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title VTEX product details page - Intelligent Search (deprecated)
 * @description Works on routes of type /:slug/p
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVTEX
> = withISFallback(async (
  req,
  ctx,
) => {
  const data = await loader(
    { slug: ctx.params.slug },
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
});

export default loaderV0;
