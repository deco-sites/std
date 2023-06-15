import { ConfigNuvemShop } from "./types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import {
  ProductBaseNuvemShop,
  ProductSearchParams,
} from "deco-sites/std/commerce/nuvemShop/types.ts";

const BASE_URL = "https://api.nuvemshop.com.br/v1";

const paramsToQueryString = (
  params: ProductSearchParams | { key: string; value: string }[],
) => {
  const keys = Object.keys(params) as Array<keyof typeof params>;

  const transformedValues = keys.map((_key) => {
    const value = params[_key];
    const key = Array.isArray(value) ? `${_key}[]` : _key;

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => [key, v.toString()]);
    }

    return [key, value?.toString()];
  }).filter((v) => v.length);

  return new URLSearchParams(transformedValues);
};

export const NUVEMSHOP_SORT_OPTIONS = [
  { value: "best-selling", label: "Relevância" },
  { value: "created-at-ascending", label: "Mais recentes" },
  { value: "created-at-descending", label: "Mais antigos" },
  { value: "price-ascending, cost-ascending", label: "Menor preço" },
  { value: "price-descending, cost-descending", label: "Maior preço" },
];

export const createClient = (params: ConfigNuvemShop | undefined) => {
  if (!params) return;

  const fetcher = <T>(
    endpoint: string,
    method = "GET",
    data?: Record<string, unknown>,
  ) => {
    const { userAgent, accessToken, storeId } = params;

    return fetchAPI<T>(
      new URL(`${BASE_URL}/${storeId}/${endpoint}`, BASE_URL),
      {
        body: data ? JSON.stringify(data) : undefined,
        method,
        headers: {
          "accept": "application/json",
          "Authentication": `bearer ${accessToken}`,
          "user-agent": userAgent,
          "content-type": "application/json",
        },
      },
    );
  };

  const getProduct = async (productId: number) => {
    try {
      const endpoint = `products/${productId}`;
      return await fetcher<ProductBaseNuvemShop>(endpoint);
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

    const endpoint = `products?${qs}`;
    return fetcher<ProductBaseNuvemShop[]>(endpoint);
  };

  return {
    product: {
      search: searchProduct,
      get: getProduct,
    },
  };
};
