import type { LoaderFunction } from "$live/types.ts";
import type { LiveState } from "$live/types.ts";

import { toProductPage } from "../commerce/vtex/transform.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const legacyProductPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configvtex: ConfigVTEX | undefined }>
> = async (
  req,
  ctx,
) => {
  const { configvtex } = ctx.state.global;
  const vtex = createClient(configvtex);
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  // search products on VTEX. Feel free to change any of these parameters
  const [product] = await vtex.catalog_system.products({
    term: `${ctx.params.slug}/p`,
  });

  // Product not found, return the 404 status code
  if (!product) {
    return {
      data: null,
      status: 404,
    };
  }

  return {
    data: toProductPage(product, skuId?.toString(), {
      url,
      priceCurrency: vtex.currency(),
    }),
  };
};

export default legacyProductPageLoader;
