import type { DecoState as LiveState, LoaderFunction } from "deco/types.ts";

import { ConfigOCC, createClient } from "../commerce/occ/client.ts";
import { toProductPage } from "../commerce/occ/transform.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title Oracle Commerce Cloud Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configOCC: ConfigOCC }>
> = async (_req, ctx) => {
  // @ts-ignore this should work.
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
    return {
      data: null,
      status: 404,
    };
  }

  // Convert the OCC product to schema.org format and return it
  return { data: toProductPage(product, productSkuInventoryStatus) };
};

export default productPageLoader;
