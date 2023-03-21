import type { LoaderFunction } from "$live/types.ts";
import type { LiveState } from "$live/types.ts";

import { toProduct } from "../commerce/vtex/transform.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import type { Product } from "../commerce/types.ts";
import { CrossSellingType } from "../commerce/vtex/types.ts";

const mapCrossSellingTypeToClientKey = (
  crossSellingType: CrossSellingType,
): keyof (ReturnType<typeof createClient>)["crossSelling"] => {
  switch (crossSellingType) {
    case "whosawalsosaw":
      return "whoSawAlsoSaw";
    case "whosawalsobought":
      return "whoSawAlsoBought";
    case "whoboughtalsobought":
      return "whoBoughtAlsoBought";
    case "showtogether":
      return "showTogether";
    default:
      return crossSellingType;
  }
};

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
  LiveState<{ configVTEX: ConfigVTEX | undefined }>
> = async (
  req,
  ctx,
  { crossSelling, count },
) => {
  const { configVTEX } = ctx.state.global;
  const vtex = createClient(configVTEX);
  const url = new URL(req.url);

  const pageType = await vtex.catalog_system.pageType({
    slug: `${ctx.params.slug}/p`,
  });

  // Page type doesn't exists or this is not product page
  if (!pageType || pageType.pageType !== "Product" || !pageType.id) {
    return {
      data: null,
    };
  }

  if (
    crossSelling === "" || crossSelling === null || crossSelling === undefined
  ) {
    return {
      data: null,
    };
  }

  const vtexRelatedProducts = await vtex.crossSelling
    [mapCrossSellingTypeToClientKey(crossSelling)]({
      productId: pageType.id,
    });

  const relatedProducts = vtexRelatedProducts.slice(0, count ?? Infinity).map((
    p,
  ) => toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() }));

  return {
    data: relatedProducts,
  };
};

export default legacyRelatedProductsLoader;
