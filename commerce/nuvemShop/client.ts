import { Account } from "./types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import {
  ProductBaseNuvemShop,
  ProductSearchParams,
} from "deco-sites/std/commerce/nuvemShop/types.ts";

const BASE_URL = "https://api.nuvemshop.com.br/v1";

export const NUVEMSHOP_SORT_OPTIONS = [
  { value: "best-selling", label: "Relevância" },
  { value: "created-descending", label: "Mais recentes" },
  { value: "created-ascending", label: "Mais antigos" },
  { value: "price-ascending", label: "Menor preço" },
  { value: "price-descending", label: "Maior preço" },
  { value: "alpha-ascending", label: "A-Z" },
  { value: "alpha-descending", label: "Z-A" },
];

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
      // @ts-ignore value type 'never'
      return value.flatMap((v) => [key, v.toString()]);
    }
    // @ts-ignore value type 'never'
    return [key, value?.toString()];
  }).filter((v) => v.length);

  return new URLSearchParams(transformedValues);
};

export const createClient = (params: Account | undefined) => {
  if (!params) return;

  const fetcher = <T>(
    endpoint: string,
    method = "GET",
    data?: Record<string, unknown>,
  ) => {
    const { userAgent, accessToken, storeId } = params;

    try {
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
    } catch (error) {
      throw new Error(error);
    }
  };

  const getProductBySlug = async (slug: string) => {
    const endpoint = `products/?handle=${encodeURIComponent(slug)}`;
    const [product] = await fetcher<ProductBaseNuvemShop[]>(endpoint);
    return product;
  };

  const searchProduct = (
    params: ProductSearchParams,
  ) => {
    const qs = paramsToQueryString(params);

    const endpoint = `products?${qs}`;

    return fetcher<ProductBaseNuvemShop[]>(endpoint);
  };

  return {
    product: {
      search: searchProduct,
      getBySlug: getProductBySlug,
    },
  };
};
