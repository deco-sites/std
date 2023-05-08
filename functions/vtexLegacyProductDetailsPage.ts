import loader from "deco-sites/std/packs/vtex/loaders/legacy/productDetailsPage.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";

/**
 * @title VTEX product details page - legacy (deprecated)
 * @description Works on routes of type /:slug/p
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVTEX
> = async (
  req,
  ctx,
) => {
  const data = await loader(
    { slug: ctx.params.slug },
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
