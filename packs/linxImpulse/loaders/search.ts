import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type {
  SearchParams,
  SearchProductsResponse,
  SelectedFacet,
  Sort,
} from "deco-sites/std/packs/linxImpulse/types.ts";
import {
  filtersFromURL,
  mergeFacets,
  toFilter,
  toProduct,
  toRequestHeader,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import { HttpError } from "deco-sites/std/utils/HttpError.ts";

const sortOptions = [
  { value: "relevance", "label": "Relevância" },
  { value: "ascPrice", "label": "Menor preço" },
  { value: "descPrice", "label": "Maior preço" },
  { value: "descDate", "label": "Lançamentos" },
  { value: "descSold", "label": "Maior venda" },
  { value: "descReview", "label": "Maior avaliação" },
  { value: "descDiscount", "label": "Maiores descontos" },
];

const searchArgsOf = (props: Props, url: URL) => {
  const hideUnavailableItems = Boolean(props.hideUnavailableItems);
  const count = props.count ?? 12;
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const sort = props.sort ?? url.searchParams.get("sort") as Sort ??
    sortOptions[0].value;
  const pageParam = Number(url.searchParams.get("page"));
  const currentPage = pageParam !== 0 ? pageParam ?? props.page ?? 1 : 1;
  const selectedFacets = mergeFacets(
    props.selectedFacets ?? [],
    filtersFromURL(url),
  );

  return {
    query,
    sort,
    count,
    hideUnavailableItems,
    page: currentPage,
    selectedFacets,
  };
};

export const withDefaultParams = ({
  query = "",
  page = 0,
  count = 12,
  sort = "relevance",
  hideUnavailableItems,
  selectedFacets = [],
}: Partial<SearchParams>) => {
  const params = new URLSearchParams({
    terms: query,
    page: `${page}`,
    resultsPerPage: `${count}`,
    sortBy: sort,
    showOnlyAvailable: `${hideUnavailableItems}`,
  });

  selectedFacets.map(({ value }) => {
    params.append("filter", value);
  });

  return params;
};

export interface Props {
  /**
   * @description overides the query term
   */
  query?: string;

  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;

  /**
   * @title Sorting
   * @default relevance
   */
  sort?: Sort;

  /**
   * @title Selected Facets
   * @description Override selected facets from url
   */
  selectedFacets?: SelectedFacet[];

  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;

  /**
   * @title Starting page query parameter.
   * @description Set the starting page. Default to 1.
   */
  page?: number;
}

/**
 * @title Linx Impulse - Product Listing page
 * @description Returns data ready for search pages like category, brand pages
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  const { url: baseUrl } = req;
  const { configLinxImpulse: config } = ctx;
  const url = new URL(baseUrl);
  const linxImpulse = paths(config!);
  const requestHeaders = toRequestHeader(config!);
  const { selectedFacets, page, ...args } = searchArgsOf(props, url);
  const params = withDefaultParams({ ...args, page, selectedFacets });

  try {
    const searchData = await fetchAPI<SearchProductsResponse>(
      `${linxImpulse.search.params(params)}`,
      { headers: requestHeaders },
    );

    const products = searchData.products.map((product) =>
      toProduct(product, product.skus[0], 0, { baseUrl })
    );
    const filters = searchData.filters.map(toFilter(selectedFacets, url));
    const hasNextPage = Boolean(searchData.pagination.next);
    const hasPreviousPage = Boolean(searchData.pagination.prev);
    const nextPage = new URLSearchParams(url.searchParams);
    const previousPage = new URLSearchParams(url.searchParams);

    if (hasNextPage) {
      nextPage.set("page", (page + 1).toString());
    }

    if (hasPreviousPage) {
      previousPage.set("page", (page - 1).toString());
    }

    return {
      "@type": "ProductListingPage",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [{
          "@type": "ListItem" as const,
          name: searchData.queries.original!,
          item: "#",
          position: 1,
        }],
        numberOfItems: 1,
      },
      filters,
      products,
      pageInfo: {
        nextPage: hasNextPage ? `?${nextPage}` : undefined,
        previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
        currentPage: page - 1,
        records: searchData.size,
        recordPerPage: props.count,
      },
      sortOptions,
      seo: null,
    };
  } catch (err) {
    if (err instanceof HttpError && err.status >= 500) {
      throw err;
    }
    return null;
  }
};

export default loader;
