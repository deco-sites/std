import { fetchAPI } from "../../utils/fetchAPI.ts";
import {
  FacetSearchResult,
  LegacyFacets,
  LegacyProduct,
  LegacySort,
  PageType,
  ProductSearchResult,
  SearchArgs,
  SelectedFacet,
  Suggestion,
} from "./types.ts";

const POLICY_KEY = "trade-policy";
const REGION_KEY = "region-id";
const CHANNEL_KEYS = new Set([POLICY_KEY, REGION_KEY]);

interface LegacyParams {
  ft?: string;
  fq?: string;
  _from?: number;
  _to?: number;
  O?: LegacySort;
  map?: string;
}

export interface ConfigVTEX {
  /**
   * @description VTEX Account name. For more info, read here: https://help.vtex.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @description Locale used for VTEX Intelligent Search client.
   */
  defaultLocale: string;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;

  /**
   * @description VTEX sales channel. This will be the default sales channel your site. For more info, read here: https://help.vtex.com/tutorial/how-trade-policies-work--6Xef8PZiFm40kg2STrMkMV
   */
  defaultSalesChannel: string;
  defaultRegionId?: string;
  defaultHideUnnavailableItems?: boolean;
}

export type ClientVTEX = ReturnType<typeof createClient>;

export const createClient = ({
  account = "bravtexfashionstore", //"decopartnerbr",
  defaultSalesChannel = "1",
  defaultRegionId = "",
  defaultPriceCurrency = "USD",
  defaultLocale = "en-US",
  defaultHideUnnavailableItems = false,
  baseUrl = `https://vtex-search-proxy.global.ssl.fastly.net/v2/${account}/`,
}: Partial<ConfigVTEX> & { baseUrl?: string } = {}) => {
  const addDefaultFacets = (
    facets: SelectedFacet[],
  ) => {
    const withDefaltFacets = facets.filter(({ key }) => !CHANNEL_KEYS.has(key));

    const policyFacet = facets.find(({ key }) => key === POLICY_KEY) ??
      { key: POLICY_KEY, value: defaultSalesChannel };

    const regionFacet = facets.find(({ key }) => key === REGION_KEY) ??
      { key: REGION_KEY, value: defaultRegionId };

    if (policyFacet !== null) {
      withDefaltFacets.push(policyFacet);
    }

    if (regionFacet !== null) {
      withDefaltFacets.push(regionFacet);
    }

    return withDefaltFacets;
  };

  const search = <T>({
    query = "",
    page,
    count,
    sort = "",
    selectedFacets = [],
    type,
    fuzzy = "auto",
    locale = defaultLocale,
  }: SearchArgs): Promise<T> => {
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      count: count.toString(),
      query,
      sort,
      fuzzy,
      locale,
    });

    if (defaultHideUnnavailableItems !== undefined) {
      params.append(
        "hideUnavailableItems",
        defaultHideUnnavailableItems.toString(),
      );
    }

    const pathname = addDefaultFacets(selectedFacets)
      .map(({ key, value }) => `${key}/${value}`)
      .join("/");

    return fetchAPI(
      new URL(
        `./api/io/_v/api/intelligent-search/${type}/${pathname}?${params.toString()}`,
        baseUrl,
      ).href,
    );
  };

  const products = (args: Omit<SearchArgs, "type">) =>
    search<ProductSearchResult>({ ...args, type: "product_search" });

  const suggestedTerms = (
    { query, locale = defaultLocale }: Pick<SearchArgs, "query" | "locale">,
  ): Promise<Suggestion> => {
    const params = new URLSearchParams({
      query: query?.toString() ?? "",
      locale,
    });

    return fetchAPI(
      new URL(
        `./api/io/_v/api/intelligent-search/search_suggestions?${params.toString()}`,
        baseUrl,
      ).href,
    );
  };

  const topSearches = (
    { locale = defaultLocale }: Pick<SearchArgs, "locale">,
  ): Promise<Suggestion> => {
    const params = new URLSearchParams({
      locale,
    });

    return fetchAPI(
      new URL(
        `./api/io/_v/api/intelligent-search/top_searches?${params.toString()}`,
        baseUrl,
      ).href,
    );
  };

  const facets = (args: Omit<SearchArgs, "type">) =>
    search<FacetSearchResult>({ ...args, type: "facets" });

  const withLegacyParams = (
    url: URL,
    params: LegacyParams,
  ) => {
    for (const key of Object.keys(params)) {
      const value = params[key as keyof LegacyParams]?.toString();

      if (value) {
        url.searchParams.set(key, value);
      }
    }

    return url;
  };

  const legacyProducts = (
    { term, ...params }: {
      term?: string;
    } & LegacyParams,
  ) => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/products/search/${term ?? ""}`,
        baseUrl,
      ),
      params,
    );

    return fetchAPI<LegacyProduct[]>(url.href);
  };

  const legacyFacets = (
    { term, ...params }:
      & { term: string }
      & LegacyParams,
  ) => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/facets/search/${term ?? ""}`,
        baseUrl,
      ),
      params,
    );

    return fetchAPI<LegacyFacets>(url.href);
  };

  const pageType = ({ slug }: { slug: string }) =>
    fetchAPI<PageType>(
      new URL(`./api/catalog_system/pub/portal/pagetype/${slug}`, baseUrl).href,
    );

  return {
    currency: () => defaultPriceCurrency,
    locale: () => defaultLocale,
    search: {
      facets,
      products,
      suggestedTerms,
      topSearches,
    },
    catalog_system: {
      products: legacyProducts,
      facets: legacyFacets,
      pageType,
    },
  };
};
