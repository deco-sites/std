import type { LoaderFunction } from "$live/types.ts";
import type { LiveState } from "$live/types.ts";

import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import { toProductPage } from "../commerce/vtex/transform.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configVTEX: ConfigVTEX | undefined }>
> = withISFallback(async (
  req,
  ctx,
) => {
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");
  const { configVTEX } = ctx.state.global;
  const vtex = createClient(configVTEX);

  // search products on VTEX. Feel free to change any of these parameters
  const { products: [product] } = await vtex.search.products({
    query: `sku:${skuId}`,
    page: 0,
    count: 1,
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

export default productPageLoader;
