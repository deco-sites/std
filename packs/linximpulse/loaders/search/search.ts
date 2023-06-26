import { paths } from "../utils/paths.ts";
import { SearchResponse, Sort } from "../types.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { withDefaultParams } from "../utils/search.ts";

// TO DO: remove, development only
const requestHeaders = {
    origin: `https://www.ibyte.com.br`,
    referer: `https://www.ibyte.com.br/`
}

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
  
    /**
     * @title Device id.
     */
    deviceId: string;
}

const searchArgsOf = (props: Props) => {
    const showOnlyAvailable = props.showOnlyAvailable;
    const resultsPerPage = props.resultsPerPage ?? 12;
    const terms = props.terms ?? "";
    const page = props.page ?? 1;
    const sortBy = props.sortBy;
  
    return {
      terms,
      page,
      resultsPerPage,
      sortBy,
      showOnlyAvailable
    };
};

const loader = async (props: Props): Promise<Product[] | null> => {
    const searchUrl = paths().search;
    const args = searchArgsOf(props);
    const params = withDefaultParams(...args);

    const productsResult = await Promise.all([
        fetchAPI<SearchResponse>(
            `${searchUrl}?${params}`,
            { withProxyCache: true, headers: requestHeaders },
        )
    ]);

    // TODO: need to check pagination since it only returns fist/last page
    // TODO: change linximpulse product to a Product[] and add to return

    return {} as Product[];
  };
);

export default loader;
