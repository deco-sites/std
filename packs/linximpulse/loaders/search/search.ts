import { paths } from "../../utils/paths.ts";
import {
  Product as linximpulseProductType,
  SearchResponse,
  Sort,
} from "../../types.ts";
// import type { Product } from "deco-sites/std/commerce/types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { withDefaultParams } from "../../utils/search.ts";
import type { Context } from "deco-sites/std/packs/linximpulse/accounts/linximpulse.ts";

// TO DO: remove, development only
const requestHeaders = {
  origin: `https://www.ibyte.com.br`,
  referer: `https://www.ibyte.com.br/`,
};

export interface Props {
  /**
   * @description overides the query term
   */
  terms: string;

  /**
   * @title Product Ids
   */
  pids?: string;

  /**
   * @title Pagination number
   */
  page?: number;

  /**
   * @title Items per page
   * @description number of products per page to display
   */
  resultsPerPage?: number;

  /**
   * @title Sorting
   */
  sortBy?: Sort;

  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  showOnlyAvailable?: boolean;
}

const searchArgsOf = (props: Props) => {
  const showOnlyAvailable = props.showOnlyAvailable ?? false;
  const resultsPerPage = props.resultsPerPage ?? 12;
  const terms = props.terms ?? "";
  const page = props.page ?? 0;
  const sortBy = props.sortBy ?? "relevance";

  return {
    terms,
    page,
    resultsPerPage,
    sortBy,
    showOnlyAvailable,
  };
};

const loader = async (
  props: Props,
  _req: Request,
  ctx: Context,
): Promise<linximpulseProductType[] | null> => {
  const searchUrl = paths()?.search;
  const args = searchArgsOf(props);
  const params = withDefaultParams(args);
  const currentPageoffset = props.page ?? 1;
  const { configLinxImpulse } = ctx;
  const apiKeyParam = `apiKey=ibyte&`; // `apiKey=${configLinxImpulse?.apiKey}&`;
  const searchHeaders = new Headers(requestHeaders);

  console.log("configLinxImpulse?.apiKey", configLinxImpulse?.apiKey);
  console.log("searchHeaders", searchHeaders);

  const searchResults = await fetchAPI<SearchResponse>(
    `${searchUrl}?${apiKeyParam}${params}`,
    { withProxyCache: true, headers: requestHeaders },
  );

  console.log("searchResults", searchResults);

  const {
    products: linximpulseProducts,
    pagination: linximpulsePagination,
  } = searchResults;

  const nextPage = new URLSearchParams(params);
  const previousPage = new URLSearchParams(params);
  const hasNextPage = Boolean(linximpulsePagination?.next);
  const hasPreviousPage = Boolean(linximpulsePagination?.previous);

  if (hasNextPage) {
    nextPage.set("page", (currentPageoffset + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (currentPageoffset - 1).toString());
  }

  // TODO: change linximpulse product to a Product[] and add to return

  return linximpulseProducts;
};

export default loader;
