import { LoaderContext } from "$live/types.ts";
import {
  ClientVTEX,
  ConfigVTEX,
  createClient,
} from "deco-sites/std/commerce/vtex/client.ts";
import { toProduct } from "deco-sites/std/commerce/vtex/transform.ts";
import { Slug } from "deco-sites/std/functions/slugFromParams.ts";
import type { Product } from "../commerce/types.ts";
import type { CrossSellingType } from "../commerce/vtex/types.ts";

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
  /**
   * @description the product slug
   */
  slug: Slug;
  /**
   * @description the VTEX Client that needs to be used.
   */
  vtexClient: ClientVTEX;
}

/**
 * @title VTEX Related Products Loader
 * @description Works on routes of type /:slug/p
 */
export default async function legacyRelatedProductsLoader(
  { vtexClient: _vtex, slug, crossSelling, count }: Props,
  req: Request,
  ctx: LoaderContext<{ configVTEX?: ConfigVTEX }>,
): Promise<Product[] | null> {
  const vtex = _vtex ?? createClient(ctx?.configVTEX);
  const url = new URL(req.url);
  const pageType = await vtex.catalog_system.portal.pageType({
    slug: `${slug}/p`,
  });

  // Page type doesn't exists or this is not product page
  if (!pageType || pageType.pageType !== "Product" || !pageType.id) {
    return null;
  }

  if (!crossSelling) {
    return null;
  }

  const vtexRelatedProducts = await vtex.catalog_system.products.crossSelling(
    { productId: pageType.id, type: crossSelling },
  );

  const relatedProducts = vtexRelatedProducts.slice(0, count ?? Infinity).map((
    p,
  ) => toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() }));

  return relatedProducts;
}
