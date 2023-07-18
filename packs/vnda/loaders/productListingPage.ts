import { createClient } from "../client.ts";
import { VNDA_SORT_OPTIONS } from "../client.ts";
import { Context } from "../vndaAccount.ts";
import { VNDASort } from "../types.ts";
import {
  getSEOFromTag,
  toFilters,
  toProduct,
  typeTagExtractor,
} from "../utils/transform.ts";
import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";

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
  const sort = url.searchParams.get("sort") as VNDASort;
  const page = Number(url.searchParams.get("page")) || 1;

  const termOrSlug = props.term || props.slug;
  const term = termOrSlug || url.searchParams.get("q") ||
    undefined;

  const [search, categoryTags] = await Promise.all([
    client.product.search({
      term,
      sort,
      page,
      per_page: count,
      tags: props.tags,
      type_tags: typeTags,
    }),
    termOrSlug
      ? await client.tags({
        name: termOrSlug,
        type: "categoria",
      })
      : undefined,
  ]);

  const categoryTag = categoryTags
    ? categoryTags.find((tag) => tag.name.toLowerCase() === props.slug)
    : undefined;
  // TODO: get the tag of category to use with seo tag API.
  // const seoPromise = categoryTag ? client.seo.tag(categoryTag.name) : undefined;

  const products = search.results.map((product) => {
    return toProduct(product, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    });
  });

  const nextPage = new URLSearchParams(url.searchParams);
  nextPage.set("page", (page + 1).toString());

  const previousPage = new URLSearchParams(url.searchParams);
  previousPage.set("page", (page - 1).toString());

  return {
    "@type": "ProductListingPage",
    seo: categoryTag ? getSEOFromTag(categoryTag, req) : undefined,
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: toFilters(search.aggregations, typeTags, cleanUrl),
    products: products,
    pageInfo: {
      nextPage: `?${nextPage}`,
      previousPage: `?${previousPage}`,
      currentPage: page,
    },
    sortOptions: VNDA_SORT_OPTIONS,
  };
};

export default searchLoader;
