import { RequestProxy } from "../../utils/request.proxy.ts";
import { paramsToQueryString } from "../../utils/queryBuilder.ts";

import {
  ProductFilterResultsParams,
  ProductSearchResultVNDA,
  VNDARequest,
} from "../../types.ts";

interface ProductSearchParams extends ProductFilterResultsParams {
  term?: string;
  wildcard?: boolean;
}

const ProductSearch: VNDARequest<
  ProductSearchResultVNDA,
  ProductSearchParams
> = (fetcher) => {
  return (params) => {
    const qs = paramsToQueryString(params);
    const endpoint = `products/search?${qs}`;
    return fetcher(endpoint);
  };
};

export default RequestProxy(ProductSearch);
