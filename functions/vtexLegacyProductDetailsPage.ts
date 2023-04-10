import type { LoaderFunction } from "$live/types.ts";

import { withSegment } from "../commerce/vtex/withSegment.ts";
import { toProductPage } from "../commerce/vtex/transform.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const legacyProductPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVTEX
> = withSegment(async (
  req,
  ctx,
) => {
  const { global: { configVTEX }, segment } = ctx.state;
  const vtex = createClient(configVTEX);

  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  // search products on VTEX. Feel free to change any of these parameters
  const [product] = await vtex.catalog_system.products.search({
    term: `${ctx.params.slug}/p`,
    segment,
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
});

export default legacyProductPageLoader;
