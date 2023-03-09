import { LiveConfig, LiveState } from "$live/types.ts";
import { HandlerContext } from "https://deno.land/x/fresh@1.1.3/server.ts";
import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProductPage } from "../commerce/shopify/transform.ts";
import { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title Shopify Product Page Loader
 * @description Works on routes of type /:slug/p
 */
async function productPageLoader(
  _req: Request,
  ctx: HandlerContext<
    unknown,
    LiveConfig<unknown, LiveState<{ configShopify?: ConfigShopify }>>
  >
): Promise<ProductDetailsPage> {
  const { configShopify } = ctx.state.global;
  const shopify = createClient(configShopify);

  const slug = ctx.params.slug;
  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  // search products on Shopify. Feel free to change any of these parameters
  const data = await shopify.product(handle);

  if (!data?.product) {
    throw new Error(
      `shopifyProductDetailsPage: product ${maybeSkuId} not found`
    );
  }

  return toProductPage(data.product, maybeSkuId);
}

export default productPageLoader;
