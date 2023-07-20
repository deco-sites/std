import { SortOption } from "../../commerce/types.ts";
import { fetchAPI, fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { paramsToQueryString } from "./utils/queryBuilder.ts";
import { Account as ConfigVNDA } from "./accounts/vnda.ts";
import {
  Banner,
  ProductGetParams,
  ProductGetResult,
  ProductSearchParams,
  ProductSearchResult,
  RelatedItemTag,
  SEO,
  TagsSearchParams,
} from "./types.ts";

const DOMAIN_HEADER = "X-Shop-Host";
const PAGINATION_HEADER = "x-pagination";
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
  const defaultHeaders = {
    [DOMAIN_HEADER]: domain,
    accept: "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  const fetcher = <T>(
    endpoint: string,
    method = "GET",
    data?: Record<string, unknown>,
  ) => {
    return fetchAPI<T>(new URL(endpoint, baseUrl), {
      body: data ? JSON.stringify(data) : undefined,
      method,
      withProxyCache: method === "GET",
      headers: defaultHeaders,
    });
  };

  const getProduct = async (params: ProductGetParams) => {
    try {
      const endpoint = `products/${params.id}`;
      return await fetcher<ProductGetResult>(endpoint);
    } catch {
      // the VNDA's API does not returns "ok" when a product is not found.
      // so this try/catch is needed to avoid crashes
      return null;
    }
  };

  const searchProduct = async (
    params: ProductSearchParams,
  ): Promise<ProductSearchResult> => {
    const { type_tags, ...knownParams } = params;
    const typeTagsEntries = type_tags?.map((tag) => [tag.key, tag.value]) ?? [];

    const qs = paramsToQueryString({
      ...knownParams,
      ...Object.fromEntries(typeTagsEntries),
    });

    const endpoint = `products/search?${qs}`;

    const response = await fetchSafe(new URL(endpoint, baseUrl), {
      withProxyCache: true,
      headers: defaultHeaders,
    });

    const data = await response.json();
    const pagination = response.headers.get(PAGINATION_HEADER);

    return {
      ...data,
      pagination: pagination ? JSON.parse(pagination) : {
        total_pages: 0,
        total_count: 0,
        current_page: params.page,
        prev_page: false,
        next_page: false,
      },
    };
  };

  const getDefaultBanner = () =>
    fetcher<Banner[]>(
      `/api/v2/banners?only_valid=true&tag=listagem-banner-principal`,
    );

  const getSEO = (type: "Product" | "Page" | "Tag") =>
  (
    resourceId: string,
  ) => {
    const qs = new URLSearchParams();
    qs.set("resource_type", type);
    if (type !== "Tag") qs.set("resource_id", resourceId);
    if (type === "Tag") qs.set(`code`, resourceId);
    qs.set("type", "category");

    return fetcher<SEO[]>(
      `/api/v2/seo_data?${qs.toString()}`,
    );
  };

  const getProductSEO = getSEO("Product");
  const getPageSEO = getSEO("Page");
  const getTagSEO = getSEO("Tag");

  const getTags = (name: string, params?: TagsSearchParams) => {
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      qs.set(key, value);
    });

    return fetcher<RelatedItemTag[]>(
      `/api/v2/tags/${name}?${qs.toString()}`,
    );
  };

  return {
    product: {
      search: searchProduct,
      get: getProduct,
    },
    banners: {
      default: getDefaultBanner,
    },
    seo: {
      product: getProductSEO,
      page: getPageSEO,
      tag: getTagSEO,
    },
    tags: getTags,
  };
};
