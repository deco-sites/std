import { Suggestion } from "deco-sites/std/commerce/types.ts";
import { toProduct } from "deco-sites/std/packs/vtex/utils/transform.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "deco-sites/std/packs/vtex/utils/intelligentSearch.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { ProductSearchResult } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;
}

/**
 * @title VTEX Intelligent Search - Search Suggestions
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Suggestion | null> => {
  const { configVTEX: config } = ctx;
  const { url } = req;
  const { count, query } = props;
  const locale = config!.defaultLocale;
  const segment = getSegment(req);
  const search = paths(config!).api.io._v.api["intelligent-search"];

  const suggestions = () => {
    const params = new URLSearchParams({ query: query ?? "", locale });

    return fetchAPI<Suggestion>(
      `${search.search_suggestions}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const topSearches = () => {
    const params = new URLSearchParams({ locale });

    return fetchAPI<Suggestion>(
      `${search.top_searches}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const productSearch = () => {
    const facets = withDefaultFacets([], ctx);
    const params = withDefaultParams({ query, count: count ?? 4, locale }, ctx);

    return fetchAPI<ProductSearchResult>(
      `${search.product_search.facets(toPath(facets))}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    );
  };

  const [{ searches }, { products }] = await Promise.all([
    query ? suggestions() : topSearches(),
    productSearch(),
  ]);

  if (!searches || !productSearch) return null;

  const options = {
    baseUrl: url,
    priceCurrency: config!.defaultPriceCurrency,
  };

  setSegment(segment, ctx.response.headers);

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: products
      .map((p) => toProduct(p, p.items[0], 0, options)),
  };
};

export default loaders;
