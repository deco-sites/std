import type { LoaderFunction } from "$live/types.ts";

import type { Product } from "../commerce/types.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { CrossSellingType, StateVTEX } from "../commerce/vtex/types.ts";
import { withSegment } from "../commerce/vtex/withSegment.ts";
import loader from "../loaders/vtexLegacyRelatedProductsLoader.ts";
export interface Props {
  /**
   * @title Related Products
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling?: CrossSellingType;
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

  return {
    data: await loader({
      vtexClient: vtex,
      slug: ctx.params.slug,
      crossSelling,
      count,
    }, {
      configVTEX,
      reqUrl: req.url,
    }),
  };
});

export default legacyRelatedProductsLoader;
