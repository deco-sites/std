import type { LoaderFunction } from "$live/types.ts";

import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import { toProductPage } from "../commerce/vtex/transform.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * When there's no ?skuId querystring, we need to figure out the product id
 * from the pathname. For this, we use the pageType api
 */
const getProductID = async (
  slug: string,
  vtex: ReturnType<typeof createClient>,
) => {
  const page = await vtex.catalog_system.portal.pageType({ slug: `${slug}/p` });

  if (page.pageType !== "Product") {
    return null;
  }

  return page.id!;
};

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVTEX
> = withISFallback(async (
  req,
  ctx,
) => {
  const { global: { configVTEX }, segment } = ctx.state;
  const vtex = createClient(configVTEX);

  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");
  const productId = !skuId && await getProductID(ctx.params.slug, vtex);

  /**
   * Fetch the exact skuId. If no one was provided, try fetching the product
   * and return the first sku
   */
  const query = skuId
    ? `sku:${skuId}`
    : productId
    ? `product:${productId}`
    : null;

  // In case we dont have the skuId or the productId, 404
  if (!query) {
    return {
      data: null,
      status: 404,
    };
  }

  // search products on VTEX. Feel free to change any of these parameters
  const { products: [product] } = await vtex.search.products({
    query,
    page: 0,
    count: 1,
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

export default productPageLoader;
