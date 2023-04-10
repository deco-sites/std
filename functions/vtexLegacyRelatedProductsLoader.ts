import type { LoaderFunction } from "$live/types.ts";

import { withSegment } from "../commerce/vtex/withSegment.ts";
import { toProduct } from "../commerce/vtex/transform.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { CrossSellingType } from "../commerce/vtex/types.ts";
import type { Product } from "../commerce/types.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";

export interface Props {
  /**
   * @title Related Products
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling?: "" | CrossSellingType;
  /**
   * @description: number of related products
   */
  count?: number;
}

/**
 * @title VTEX Related Products Loader
 * @description Works on routes of type /:slug/p
 */
const legacyRelatedProductsLoader: LoaderFunction<
  Props,
  Product[] | null,
  StateVTEX
> = withSegment(async (
  req,
  ctx,
  { crossSelling, count },
) => {
  const { global: { configVTEX } } = ctx.state;
  const vtex = createClient(configVTEX);
  const url = new URL(req.url);

  const pageType = await vtex.catalog_system.portal.pageType({
    slug: `${ctx.params.slug}/p`,
  });

  // Page type doesn't exists or this is not product page
  if (!pageType || pageType.pageType !== "Product" || !pageType.id) {
    return {
      data: null,
    };
  }

  if (!crossSelling) {
    return {
      data: null,
    };
  }

  const vtexRelatedProducts = await vtex.catalog_system.products.crossSelling(
    { productId: pageType.id, type: crossSelling },
  );

  const relatedProducts = vtexRelatedProducts.slice(0, count ?? Infinity).map((
    p,
  ) => toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() }));

  return {
    data: relatedProducts,
  };
});

export default legacyRelatedProductsLoader;
