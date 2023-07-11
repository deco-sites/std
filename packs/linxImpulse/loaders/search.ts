import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type {
  SearchParams,
  SearchProductsResponse,
  Sort,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

const sortOptions = [
  { value: "relevance", "label": "Relevância" },
  { value: "pid", "label": "Id de produto" },
  { value: "ascPrice", "label": "Menor preço" },
  { value: "descPrice", "label": "Maior preço" },
  { value: "descDate", "label": "Lançamentos" },
  { value: "ascSold", "label": "Menor venda" },
  { value: "descSold", "label": "Maior venda" },
  { value: "descReview", "label": "Maior avaliação" },
  { value: "ascReview", "label": "Menor avaliação" },
  { value: "descDiscount", "label": "Maiores descontos" },
];

const searchArgsOf = (props: Props, url: URL) => {
  const hideUnavailableItems = Boolean(props.hideUnavailableItems);
  const count = props.count ?? 12;
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const sort = props.sort ?? url.searchParams.get("sort") as Sort ??
    sortOptions[0].value;
  const currentPageoffset = props.page ?? 1;
  const page = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) - (currentPageoffset)
    : currentPageoffset;

  return {
    query,
    sort,
    count,
    hideUnavailableItems,
    page,
  };
};

export const withDefaultParams = ({
  query = "",
  page = 1,
  count = 12,
  sort = "relevance",
  hideUnavailableItems,
}: Partial<SearchParams>) =>
  new URLSearchParams({
    terms: query,
    page: `${page}`,
    resultsPerPage: `${count}`,
    sortBy: sort,
    showOnlyAvailable: `${hideUnavailableItems}`,
  });

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
   */
  sort?: Sort;

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
  const linximpulse = createClient();

  const { page, ...args } = searchArgsOf(props, url);
  const params = withDefaultParams({ ...args, page });

  const searchData = await linximpulse.search(params) as SearchProductsResponse;

  const products = searchData.products.map((product) =>
    toProduct(product, product.skus[0].properties, 0, { baseUrl })
  );

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
    filters: [],
    products,
    pageInfo: {
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage: page - 1,
      records: searchData.size,
      recordPerPage: props.count,
    },
    sortOptions,
    seo: {
      title: "",
      description: "",
      canonical: "",
    },
  };
};

export default loader;
