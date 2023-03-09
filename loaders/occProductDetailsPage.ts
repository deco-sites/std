import { HandlerContext } from "$fresh/server.ts";
import type { LiveConfig, LiveState } from "$live/types.ts";
import { ConfigOCC, createClient } from "../commerce/occ/client.ts";
import { toProductPage } from "../commerce/occ/transform.ts";
import { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title Oracle Commerce Cloud Product Page Loader
 * @description Works on routes of type /:slug/p
 */
async function productPageLoader(
  _req: Request,
  ctx: HandlerContext<
    unknown,
    LiveConfig<unknown, LiveState<{ configOCC: ConfigOCC }>>
  >
): Promise<ProductDetailsPage> {
  const { configOCC } = ctx.state.global;
  const occ = createClient(configOCC);

  // search products on Oracle. Feel free to change any of these parameters
  const skuId = ctx.params.slug;

  const { data } = await occ.search.productBySlug(skuId);
  const { id } = data.page.product;

  const { productSkuInventoryStatus } = await occ.search.stockStatus(id);

  const product = data.page.product;

  // Product not found, return the 404 status code
  if (!data) {
    throw new Error(`occProductPageLoader: product ${id} not found`);
  }

  // Convert the OCC product to schema.org format and return it
  return toProductPage(product, productSkuInventoryStatus);
}

export default productPageLoader;
