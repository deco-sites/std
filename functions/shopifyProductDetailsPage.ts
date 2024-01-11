import type { DecoState as LiveState, LoaderFunction } from "deco/types.ts";

import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import { toProductPage } from "../commerce/shopify/transform.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title Shopify Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configShopify: ConfigShopify }>
> = async (
  _req,
  ctx,
) => {
  // @ts-ignore this should work.
  const { configShopify } = ctx.state.global;
  const shopify = createClient(configShopify);

  const slug = ctx.params.slug;
  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  // search products on Shopify. Feel free to change any of these parameters
  const data = await shopify.product(handle);

  if (!data?.product) {
    return {
      data: null,
      status: 404,
    };
  }

  const product = toProductPage(data.product, new URL(_req.url), maybeSkuId);

  return { data: product };
};

export default productPageLoader;
