import { fetchAPI } from "deco-sites/std/utils/fetchVTEX.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  pickSku,
  toProduct,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
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
import { withSegmentCookie } from "deco-sites/std/packs/vtex/utils/segment.ts";

export interface Props {
  /**
   * @title Related Products
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling: CrossSellingType;
  /**
   * @description: number of related products
   */
  count?: number;
  /**
   * @description the product slug
   */
  slug?: RequestURLParam;
  /**
   * @description ProductGroup ID
   */
  id?: string;
  /**
   * @description remove unavailable items from result. This may result in slower websites
   */
  hideUnavailableItems?: boolean;
}

/**
 * @title VTEX Related Products - Catalog
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
    hideUnavailableItems,
    crossSelling = "similars",
    count,
  } = props;
  const api = paths(config!).api.catalog_system.pub;
  const segment = getSegment(req);
  const params = toSegmentParams(segment);

  const getProductGroupID = async (props: { slug?: string; id?: string }) => {
    const { id, slug } = props;

    if (id) {
      return id;
    }

    if (slug) {
      const pageType = await fetchAPI<PageType>(
        api.portal.pagetype.term(`${slug}/p`),
        { withProxyCache: true },
      );

      // Page type doesn't exists or this is not product page
      if (pageType?.pageType === "Product") {
        return pageType.id;
      }
    }

    return null;
  };

  const productId = await getProductGroupID(props);

  if (!productId) {
    console.warn(`Could not find product for props: ${JSON.stringify(props)}`);

    return null;
  }

  const vtexRelatedProducts = await fetchAPI<LegacyProduct[]>(
    `${
      api.products.crossselling.type(crossSelling).productId(productId)
    }?${params}`,
    { withProxyCache: true, headers: withSegmentCookie(segment) },
  );

  const options = {
    baseUrl: url,
    priceCurrency: config!.defaultPriceCurrency,
  };

  const relatedProducts = vtexRelatedProducts
    .slice(0, count ?? Infinity)
    .map((p) => toProduct(p, pickSku(p), 0, options));

  setSegment(segment, ctx.response.headers);

  // Search API does not offer a way to filter out in stock products
  // This is a scape hatch
  if (hideUnavailableItems) {
    const inStock = (p: Product) =>
      p.offers?.offers.find((o) =>
        o.availability === "https://schema.org/InStock"
      );

    return relatedProducts.filter(inStock);
  }

  return relatedProducts;
}

export default loader;
