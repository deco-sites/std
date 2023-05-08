import { createClient } from "../commerce/vnda/client.ts";
import { VNDA_SORT_OPTIONS } from "../commerce/vnda/client.ts";
import { ConfigVNDA, VNDASort } from "../commerce/vnda/types.ts";
import {
  toFilters,
  toProduct,
  typeTagExtractor,
} from "../commerce/vnda/transform.ts";
import type { LiveState } from "$live/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";

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
  const { cleanUrl, typeTags } = typeTagExtractor(url);
  const sort = url.searchParams.get("sort") as VNDASort;
  const page = Number(url.searchParams.get("page")) || 1;

  const term = ctx.params.slug || props.term || url.searchParams.get("q") ||
    undefined;

  const search = await client.product.search({
    term,
    sort,
    page,
    per_page: count,
    tags: props.tags,
    type_tags: typeTags,
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
      "@type": "ProductListingPage",
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
    },
  };
};

export default searchLoader;
