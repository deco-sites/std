import type { LiveState } from "$live/types.ts";

import { HandlerContext } from "https://deno.land/x/fresh@1.1.3/server.ts";
import { LiveConfig } from "$live/blocks/handler.ts";
import { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import {
  ConfigVTEX,
  createClient,
} from "deco-sites/std/commerce/vtex/client.ts";
import { toProductPage } from "deco-sites/std/commerce/vtex/transform.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
async function legacyProductPageLoader(
  req: Request,
  {
    state: { global },
    params,
  }: HandlerContext<
    unknown,
    LiveConfig<unknown, LiveState<{ configVTEX?: ConfigVTEX }>>
  >
): Promise<ProductDetailsPage | null> {
  const { configVTEX } = global;
  const vtex = createClient(configVTEX);
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  // search products on VTEX. Feel free to change any of these parameters
  const [product] = await vtex.catalog_system.products({
    term: `${params.slug}/p`,
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

export default legacyProductPageLoader;
