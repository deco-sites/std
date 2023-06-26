import { SortOption } from "../types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { paramsToQueryString } from "./utils/queryBuilder.ts";
import { Account as ConfigVNDA } from "../../packs/vnda/vndaAccount.ts";
import {
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
    method = "GET",
    data?: Record<string, unknown>,
  ) => {
    return fetchAPI<T>(new URL(endpoint, baseUrl), {
      body: data ? JSON.stringify(data) : undefined,
      method,
      withProxyCache: method === "GET",
      headers: {
        [DOMAIN_HEADER]: domain,
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  const getProduct = async (params: ProductGetParams) => {
    try {
      const endpoint = `products/${params.id}`;
      return await fetcher<ProductGetResultVNDA>(endpoint);
    } catch {
      // the VNDA's API does not returns "ok" when a product is not found.
      // so this try/catch is needed to avoid crashes
      return null;
    }
  };

  const searchProduct = (params: ProductSearchParams) => {
    const { type_tags, ...knownParams } = params;
    const typeTagsEntries = type_tags?.map((tag) => [tag.key, tag.value]) ?? [];

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
