import type { LiveState } from "$live/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import { createClient } from "../commerce/vnda/client.ts";
import type { ProductListingPage } from "../commerce/types.ts";
import { ConfigVNDA, VNDASort } from "../commerce/vnda/types.ts";
import { VNDA_SORT_OPTIONS } from "../commerce/vnda/constants.ts";

import {
  filtersFromSearchParams,
  toFilters,
  toProduct,
} from "../commerce/vnda/transform.ts";

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
}

/**
 * @title Product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 */
const searchLoader: LoaderFunction<
  Props,
  ProductListingPage | null,
  LiveState<{ configVNDA: ConfigVNDA }>
> = async (
  req,
  ctx,
  props,
) => {
  const url = new URL(req.url);
  const { configVNDA } = ctx.state.global;
  const client = createClient(configVNDA);

  const count = props.count ?? 12;
  const term = props.term || url.searchParams.get("q") || "";
  const page = Number(url.searchParams.get("page")) || 0;
  const sort = url.searchParams.get("sort") as VNDASort;
  const filtersInUse = filtersFromSearchParams(url.searchParams);

  const filters = filtersInUse.reduce((filters, filter) => {
    // deno-lint-ignore no-explicit-any
    const newFilters = { ...filters } as any;
    newFilters[filter.key] = filter.value;
    return newFilters;
  }, {});

  const search = await client.product.search({
    ...filters,
    term,
    sort,
    page,
    per_page: count,
    tags: props.tags,
  });

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
    data: {
      // TODO: Find out what's the right breadcrumb on vnda
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      filters: toFilters(search.aggregations, filtersInUse),
      products: products,
      pageInfo: {
        nextPage: `?${nextPage}`,
        previousPage: `?${previousPage}`,
        currentPage: page,
      },
      sortOptions: VNDA_SORT_OPTIONS,
    },
  };
};

export default searchLoader;
