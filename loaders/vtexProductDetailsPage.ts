import type { LiveConfig, LiveState } from "$live/types.ts";

import { HandlerContext } from "https://deno.land/x/fresh@1.1.3/server.ts";
import { ProductDetailsPage } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { toProductPage } from "../commerce/vtex/transform.ts";
import { Props } from "./vtexLegacyProductListingPage.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
async function productPageLoader(
  req: Request,
  ctx: HandlerContext<
    unknown,
    LiveConfig<Props, LiveState<{ configVTEX?: ConfigVTEX }>>
  >,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");
  const { configVTEX } = ctx.state.global;
  const vtex = createClient(configVTEX);

  // search products on VTEX. Feel free to change any of these parameters
  const {
    products: [product],
  } = await vtex.search.products({
    query: `sku:${skuId}`,
    page: 0,
    count: 1,
  });

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  return toProductPage(product, skuId?.toString(), {
    url,
    priceCurrency: vtex.currency(),
  });
}

export default productPageLoader;