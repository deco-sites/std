import { Account } from "$live/blocks/account.ts";
import { fetchAPI } from "../../utils/fetchAPI.ts";
import {
  Category,
  CrossSellingArgs,
  CrossSellingType,
  FacetSearchResult,
  LegacyFacets,
  LegacyProduct,
  LegacySort,
  PageType,
  ProductSearchResult,
  SearchArgs,
  Segment,
  SelectedFacet,
  Suggestion,
} from "./types.ts";
import { getCacheBurstKey, withSegment } from "./utils/segment.ts";

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

export interface ConfigVTEX extends Account {
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

  const search = async <T>({
    query = "",
    page,
    count,
    sort = "",
    selectedFacets = [],
    type,
    fuzzy = "auto",
    locale = defaultLocale,
    segment,
  }: SearchArgs): Promise<T> => {
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      count: count.toString(),
      query,
      sort,
      fuzzy,
      locale,
      segment: segment ? await getCacheBurstKey(segment) : "",
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
      {
        headers: segment && withSegment(segment),
      },
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
    { term, segment, ...params }: {
      term?: string;
      segment?: Partial<Segment>;
    } & LegacyParams,
  ) => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/products/search/${term ?? ""}`,
        baseUrl,
      ),
      params,
    );

    if (segment?.utm_campaign) {
      url.searchParams.set("utm_campaign", segment.utm_campaign);
    }
    if (segment?.utm_source) {
      url.searchParams.set("utm_source", segment.utm_source);
    }
    if (segment?.utmi_campaign) {
      url.searchParams.set("utmi_campaign", segment.utmi_campaign);
    }

    return fetchAPI<LegacyProduct[]>(url.href);
  };

  const legacyFacets = async (
    { term, ...params }:
      & { term: string }
      & LegacyParams,
  ): Promise<LegacyFacets> => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/facets/search/${term ?? ""}`,
        baseUrl,
      ),
      params,
    );

    try {
      return await fetchAPI<LegacyFacets>(url.href);
    } catch (error) {
      // When askign for a route that doesn't exist a.k.a is not a category, catalog will return a 400 status code.
      // In these cases, just return empty facets intead of throwing an error
      if (error instanceof HttpError && error.status === 400) {
        return {
          Departments: [],
          Brands: [],
          SpecificationFilters: {},
        };
      }

      throw error;
    }
  };

  const pageType = ({ slug }: { slug: string }) =>
    fetchAPI<PageType>(
      new URL(`./api/catalog_system/pub/portal/pagetype/${slug}`, baseUrl).href,
    );

  const categoryTree = ({ categoryLevels }: { categoryLevels: number }) => {
    return fetchAPI<Category[]>(
      new URL(
        `./api/catalog_system/pub/category/tree/${categoryLevels}`,
        baseUrl,
      ).href,
    );
  };

  const crossSelling = (
    type: CrossSellingType,
    { productId }: CrossSellingArgs,
  ): Promise<LegacyProduct[]> =>
    fetchAPI(
      new URL(
        `./api/catalog_system/pub/products/crossselling/${type}/${productId}`,
        baseUrl,
      ).href,
    );

  const whoSawAlsoSaw = (params: CrossSellingArgs) =>
    crossSelling("whosawalsosaw", params);

  const whoSawAlsoBought = (params: CrossSellingArgs) =>
    crossSelling("whosawalsobought", params);

  const whoBoughtAlsoBought = (params: CrossSellingArgs) =>
    crossSelling("whoboughtalsobought", params);

  const showTogether = (params: CrossSellingArgs) =>
    crossSelling("showtogether", params);

  const accessories = (params: CrossSellingArgs) =>
    crossSelling("accessories", params);

  const similars = (params: CrossSellingArgs) =>
    crossSelling("similars", params);

  const suggestions = (params: CrossSellingArgs) =>
    crossSelling("similars", params);

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
      categoryTree,
      crossSelling: {
        whoSawAlsoSaw,
        whoSawAlsoBought,
        whoBoughtAlsoBought,
        showTogether,
        accessories,
        similars,
        suggestions,
      },
    },
  };
};
