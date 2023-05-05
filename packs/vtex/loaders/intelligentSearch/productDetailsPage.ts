import {
  pickSku,
  toProductPage,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import {
  withDefaultFacets,
  withDefaultParams,
} from "deco-sites/std/packs/vtex/utils/intelligentSearch.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type {
  PageType,
  Product,
  ProductSearchResult,
} from "deco-sites/std/packs/vtex/types.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * When there's no ?skuId querystring, we need to figure out the product id
 * from the pathname. For this, we use the pageType api
 */
const getProductID = async (slug: string, ctx: Context) => {
  const vtex = paths(ctx.configVTEX!);
  const page = await fetchAPI<PageType>(
    vtex.api.catalog_system.pub.portal.pagetype.term(
      `${slug}/p`,
    ),
    { withProxyCache: true },
  );

  if (page.pageType !== "Product") {
    return null;
  }

  return page.id!;
};

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> => {
  const { configVTEX: config } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const vtex = paths(config!);
  const segment = getSegment(req);

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId");
  const productId = !skuId && await getProductID(slug, ctx);

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
    return null;
  }

  const search = vtex.api.io._v.api["intelligent-search"].product_search;
  const facets = withDefaultFacets([], ctx);
  const params = withDefaultParams({ query, count: 1 }, ctx);

  const { products: [product] } = await fetchAPI<ProductSearchResult>(
    `${search.facets(facets)}?${params}`,
    {
      withProxyCache: true,
      headers: withSegmentCookie(segment),
    },
  );

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: Product[] = [];
  if (sku.isKit && sku.kitItems) {
    const params = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
    }, ctx);

    const result = await fetchAPI<ProductSearchResult>(
      `${search.facets(facets)}?${params}`,
      {
        withProxyCache: true,
        headers: withSegmentCookie(segment),
      },
    );

    kitItems = result.products;
  }

  setSegment(segment, ctx.response.headers);

  return toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: config!.defaultPriceCurrency,
  });
};

export default loader;
