import { SortOption } from "../types.ts";
import { fetchAPI } from "../../utils/fetchAPI.ts";
import { paramsToQueryString } from "./utils/queryBuilder.ts";

import {
  ConfigVNDA,
  ProductGetParams,
  ProductGetResultVNDA,
  ProductSearchParams,
  ProductSearchResultVNDA,
} from "./types.ts";

const DOMAIN_HEADER = "X-Shop-Host";
const BASE_URL_PROD = "https://api.vnda.com.br/api/v2/";
const BASE_URL_SANDBOX = "https://api.sandbox.vnda.com.br/api/v2/";

export const VNDA_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevância" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "lowest_price", label: "Menor preço" },
  { value: "highest_price", label: "Maior preço" },
];

export const createClient = (params: ConfigVNDA) => {
  const { domain, authToken, useSandbox } = params;
  const baseUrl = useSandbox ? BASE_URL_SANDBOX : BASE_URL_PROD;

  const fetcher = <T>(
    endpoint: string,
    method?: string,
    data?: Record<string, unknown>,
  ) => {
    return fetchAPI<T>(new URL(endpoint, baseUrl).href, {
      body: data ? JSON.stringify(data) : undefined,
      method: method || "GET",
      headers: {
        [DOMAIN_HEADER]: domain,
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  const getProduct = (params: ProductGetParams) => {
    const endpoint = `products/${params.id}`;
    return fetcher<ProductGetResultVNDA>(endpoint);
  };

  const searchProduct = (params: ProductSearchParams) => {
    const { type_tags, ...knownParams } = params;
    const typeTagsEntries = type_tags?.map((tag) => [tag.key, tag.value]) || [];

    const qs = paramsToQueryString({
      ...knownParams,
      ...Object.fromEntries(typeTagsEntries),
    });

    const endpoint = `products/search?${qs}`;
    return fetcher<ProductSearchResultVNDA>(endpoint);
  };

  return {
    product: {
      search: searchProduct,
      get: getProduct,
    },
  };
};
