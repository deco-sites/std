import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import { toProduct } from "deco-sites/std/packs/vtex/utils/transform.ts";
import { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import {
  getSegment,
  setSegment,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { toSegmentParams } from "deco-sites/std/packs/vtex/utils/legacy.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import type { CrossSellingType } from "deco-sites/std/packs/vtex/types.ts";
import type {
  LegacyProduct,
  PageType,
} from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

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
  slug: RequestURLParam;
}

/**
 * @title VTEX Related Products Loader
 * @description Works on routes of type /:slug/p
 */
async function loader(
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> {
  const { configVTEX: config } = ctx;
  const { url } = req;
  const {
    slug,
    crossSelling,
    count,
  } = props;
  const api = paths(config!).api.catalog_system.pub;
  const segment = getSegment(req);
  const params = toSegmentParams(segment);

  const pageType = await fetchAPI<PageType>(
    api.portal.pagetype.term(`${slug}/p`),
    { withProxyCache: true },
  );

  // Page type doesn't exists or this is not product page
  if (!pageType || pageType.pageType !== "Product" || !pageType.id) {
    return null;
  }

  if (!crossSelling) {
    return null;
  }

  const vtexRelatedProducts = await fetchAPI<LegacyProduct[]>(
    `${
      api.products.crossselling.type(crossSelling).productId(pageType.id)
    }?${params}`,
    { withProxyCache: true },
  );

  const options = {
    baseUrl: url,
    priceCurrency: config!.defaultPriceCurrency,
  };

  const relatedProducts = vtexRelatedProducts
    .slice(0, count ?? Infinity)
    .map((p) => toProduct(p, p.items[0], 0, options));

  setSegment(segment, ctx.response.headers);

  return relatedProducts;
}

export default loader;
