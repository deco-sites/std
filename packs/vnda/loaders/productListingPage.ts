import { createClient } from "../client.ts";
import { VNDA_SORT_OPTIONS } from "../client.ts";
import { Sort } from "../types.ts";
import {
  getSEOFromTag,
  toFilters,
  toProduct,
  typeTagExtractor,
} from "../utils/transform.ts";
import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import { Context } from "../accounts/vnda.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;
  /**
   * @description filter products by tag
   */
  tags?: string[];
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;

  /**
   * Slug for category pages
   */
  slug?: RequestURLParam;
}

/**
 * @title VNDA - Product Listing page
 * @description Useful for category, search, brand and collection pages.
 */
const searchLoader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  // get url from params
  const url = new URL(req.url);
  const { configVNDA } = ctx;

  if (!configVNDA) return null;

  const client = createClient(configVNDA);

  const count = props.count ?? 12;
  const { cleanUrl, typeTags } = typeTagExtractor(url);
  const sort = url.searchParams.get("sort") as Sort;
  const page = Number(url.searchParams.get("page")) || 1;

  const isSearchPage = url.pathname === "/busca";
  const qQueryString = url.searchParams.get("q");
  const term = props.term || props.slug || qQueryString ||
    undefined;

  const search = await client.product.search({
    term,
    sort,
    page,
    per_page: count,
    tags: props.tags,
    type_tags: typeTags,
    wildcard: true,
  });

  const categoryTagName = props.term || url.pathname.split("/").pop() || "";
  const [seo, categoryTag] = await Promise.all([
    client.seo.tag(categoryTagName),
    isSearchPage
      ? client.tag(categoryTagName).catch(() => undefined)
      : undefined,
  ]);

  const { results: searchResults, pagination } = search;
  const products = searchResults.map((product) =>
    toProduct(product, null, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    })
  );

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (pagination.next_page) {
    nextPage.set("page", (page + 1).toString());
  }

  if (pagination.prev_page) {
    previousPage.set("page", (page - 1).toString());
  }

  const hasSEO = !isSearchPage && (seo?.[0] || categoryTag);

  return {
    "@type": "ProductListingPage",
    seo: hasSEO
      ? getSEOFromTag({ ...categoryTag, ...seo?.[0] }, req)
      : undefined,
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: toFilters(search.aggregations, typeTags, cleanUrl),
    products: products,
    pageInfo: {
      nextPage: pagination.next_page ? `?${nextPage}` : undefined,
      previousPage: pagination.prev_page ? `?${previousPage}` : undefined,
      currentPage: page,
      records: pagination.total_count,
      recordPerPage: count,
    },
    sortOptions: VNDA_SORT_OPTIONS,
  };
};

export default searchLoader;
