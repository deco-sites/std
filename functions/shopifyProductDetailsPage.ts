import type { LoaderFunction } from "$live/std/types.ts";
import type { LiveState } from "$live/types.ts";

import { toProductPage } from "../commerce/shopify/transform.ts";
import { ConfigShopify, createClient } from "../commerce/shopify/client.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title Shopify Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configshopify: ConfigShopify }>
> = async (
  _req,
  ctx,
) => {
  const { configshopify } = ctx.state.global;
  const shopify = createClient(configshopify);

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

  const product = toProductPage(data.product, maybeSkuId);

  return { data: product };
};

export default productPageLoader;
