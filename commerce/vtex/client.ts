import { fetchAPI } from "../../utils/fetchAPI.ts";
import {
  Category,
  CrossSellingArgs,
  FacetSearchResult,
  LegacyFacets,
  LegacyProduct,
  LegacySort,
  OrderForm,
  PageType,
  ProductSearchResult,
  SearchArgs,
  Segment,
  SelectedFacet,
  SimulationOrderForm,
  Suggestion,
  WishlistItem,
} from "./types.ts";
import { SEGMENT_COOKIE_NAME, serialize } from "./utils/segment.ts";
import type { Account } from "$live/blocks/account.ts";

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

/**
 * Due to a lack of knowledge to configure Cloudflare properly to vary with cookies,
 * this code adds a key at URL Params to burst the Cloudflare cache
 */
export const getCacheBurstKey = async (segment: Partial<Segment>) => {
  const serial = serialize(segment);

  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(serial),
  );

  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
};

export const withSegmentCookie = (
  segment: Partial<Segment>,
  headers: Headers = new Headers(),
) => {
  headers.set("cookie", `${SEGMENT_COOKIE_NAME}=${serialize(segment)}`);

  return headers;
};

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
}: Partial<ConfigVTEX> = {}) => {
  const decoAPIUrl =
    `https://vtex-search-proxy.global.ssl.fastly.net/v2/${account}/`;
  const vtexAPIUrl = `https://${account}.vtexcommercestable.com.br`;
  const withCache = window.location?.origin
    ? window.location.origin
    : decoAPIUrl;
  const withoutCache = window.location?.origin
    ? window.location.origin
    : vtexAPIUrl;

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
        withCache,
      ),
      {
        headers: segment && withSegmentCookie(segment),
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
        withCache,
      ),
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
        withCache,
      ),
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

  const legacyProductSearch = (
    { term, segment, ...params }: {
      term?: string;
      segment?: Partial<Segment>;
    } & LegacyParams,
  ) => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/products/search/${term ?? ""}`,
        withCache,
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

    return fetchAPI<LegacyProduct[]>(url);
  };

  const legacyFacetSearch = (
    { term, ...params }:
      & { term: string }
      & LegacyParams,
  ) => {
    const url = withLegacyParams(
      new URL(
        `./api/catalog_system/pub/facets/search/${term ?? ""}`,
        withCache,
      ),
      params,
    );

    return fetchAPI<LegacyFacets>(url);
  };

  const pageType = ({ slug }: { slug: string }) =>
    fetchAPI<PageType>(
      new URL(`./api/catalog_system/pub/portal/pagetype/${slug}`, withCache),
    );

  const categoryTree = ({ categoryLevels }: { categoryLevels: number }) => {
    return fetchAPI<Category[]>(
      new URL(
        `./api/catalog_system/pub/category/tree/${categoryLevels}`,
        withCache,
      ),
    );
  };

  const crossSelling = (
    { productId, type }: CrossSellingArgs,
  ): Promise<LegacyProduct[]> =>
    fetchAPI(
      new URL(
        `./api/catalog_system/pub/products/crossselling/${type}/${productId}`,
        withCache,
      ),
    );

  const graphqlGET = <T>({ operationName, variables, query }: {
    operationName?: string;
    variables: Record<string, unknown>;
    query: string;
  }) => {
    const url = new URL(`./api/io/_v/private/graphql/v1`, withCache);

    url.searchParams.set("query", query);
    url.searchParams.set("variables", JSON.stringify(variables));
    operationName &&
      url.searchParams.set("operationName", operationName);

    return fetchAPI<{ data: T; errors: unknown[] }>(url);
  };

  const graphqlPOST = <T>({ operationName, variables, query }: {
    operationName?: string;
    variables: Record<string, unknown>;
    query: string;
  }) => {
    const url = new URL(`./api/io/_v/private/graphql/v1`, withoutCache);

    return fetchAPI<{ data: T; errors: unknown[] }>(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        operationName: operationName ?? "",
        variables,
        query,
      }),
    });
  };

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
      products: {
        search: legacyProductSearch,
        crossSelling,
      },
      facets: {
        search: legacyFacetSearch,
      },
      portal: {
        pageType,
      },
      categoryTree,
    },
    wishlist: {
      get: ({ email }: { email: string }) =>
        graphqlPOST<{ viewList: { name?: string; data: WishlistItem[] } }>({
          variables: {
            name: "Wishlist",
            shopperId: email,
          },
          query:
            `query GetWithlist($shopperId: String!, $name: String!, $from: Int, $to: Int) { viewList(shopperId: $shopperId, name: $name, from: $from, to: $to) @context(provider: "vtex.wish-list@1.x") { name data { id productId sku title } } }`,
        }),
      items: {
        add: ({ email, item }: {
          email: string;
          item: Partial<Omit<WishlistItem, "id">>;
        }) =>
          graphqlPOST<{ addToList: boolean }>({
            variables: {
              name: "Wishlist",
              shopperId: email,
              listItem: item,
            },
            query:
              `mutation AddToWishlist($listItem: ListItemInputType!, $shopperId: String!, $name: String!, $public: Boolean) { addToList(listItem: $listItem, shopperId: $shopperId, name: $name, public: $public) @context(provider: "vtex.wish-list@1.x") }`,
          }),
        remove: ({ id, email }: { id: string; email: string }) =>
          graphqlPOST<{ removeFromList: boolean }>({
            variables: {
              name: "Wishlist",
              shopperId: email,
              id,
            },
            query:
              `mutation RemoveFromList($id: ID!, $shopperId: String!, $name: String) { removeFromList(id: $id, shopperId: $shopperId, name: $name) @context(provider: "vtex.wish-list@1.x") }`,
          }),
      },
    },
    io: {
      _v: {
        private: {
          graphql: {
            v1: {
              get: graphqlGET,
              post: graphqlPOST,
            },
          },
        },
      },
    },
    checkout: {
      changeToAnonymousUser: (orderFormId: string) => ({
        /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId- */
        get: () =>
          fetchAPI<OrderForm>(
            new URL(
              `./api/checkout/changeToAnonymousUser/${orderFormId}`,
              withoutCache,
            ),
          ),
      }),
      pub: {
        orderForms: ({
          simulation: {
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation */
            post: (data: {
              items: Array<{
                id: number;
                quantity: number;
                seller: string;
              }>;
              postalCode: string;
              country: string;
            }) =>
              fetchAPI<SimulationOrderForm>(
                new URL(
                  `./api/checkout/pub/orderForms/simulation`,
                  withoutCache,
                ),
                {
                  method: "POST",
                  body: JSON.stringify(data),
                },
              ),
          },
        }),
        orderForm: (orderFormId: string) => ({
          installments: {
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm/-orderFormId-/installments */
            get: ({ paymentSystem }: { paymentSystem: number }) => {
              const url = new URL(
                `./api/checkout/pub/orderForm/${orderFormId}/installments`,
                withoutCache,
              );

              url.searchParams.set("paymentSystem", `${paymentSystem}`);

              return fetchAPI<OrderForm>(url);
            },
          },
          profile: {
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#patch-/api/checkout/pub/orderForm/-orderFormId-/profile */
            patch: (
              { ignoreProfileData }: { ignoreProfileData: boolean },
            ) =>
              fetchAPI<OrderForm>(
                new URL(
                  `./api/checkout/pub/orderForm/${orderFormId}/profile`,
                  withoutCache,
                ),
                {
                  method: "PATCH",
                  body: JSON.stringify({ ignoreProfileData }),
                  headers: {
                    "content-type": "application/json",
                  },
                },
              ),
          },
          coupons: {
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons */
            post: (
              { text }: { text: string },
            ) =>
              fetchAPI<OrderForm>(
                new URL(
                  `./api/checkout/pub/orderForm/${orderFormId}/coupons`,
                  withoutCache,
                ),
                {
                  method: "POST",
                  body: JSON.stringify({ text }),
                  headers: {
                    "content-type": "application/json",
                  },
                },
              ),
          },
          post: () =>
            fetchAPI<OrderForm>(
              new URL(`./api/checkout/pub/orderForm`, withoutCache),
              {
                method: "POST",
              },
            ),
          items: ({
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update */
            update: {
              post: ({
                orderItems,
                allowedOutdatedData = ["paymentData"],
              }: {
                orderItems: Array<{
                  quantity: number;
                  index: number;
                }>;
                allowedOutdatedData?: Array<"paymentData">;
              }) => {
                const url = new URL(
                  `./api/checkout/pub/orderForm/${orderFormId}/items/update`,
                  withoutCache,
                );

                if (allowedOutdatedData) {
                  for (const it of allowedOutdatedData) {
                    url.searchParams.append("allowedOutdatedData", it);
                  }
                }

                return fetchAPI<OrderForm>(url, {
                  method: "POST",
                  body: JSON.stringify({ orderItems }),
                  headers: {
                    "content-type": "application/json",
                  },
                });
              },
            },
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items */
            post: ({
              orderItems,
              allowedOutdatedData = ["paymentData"],
            }: {
              orderItems: Array<{
                quantity: number;
                seller: string;
                id: string;
                index?: number;
                price?: number;
              }>;
              allowedOutdatedData?: Array<"paymentData">;
            }) => {
              const url = new URL(
                `./api/checkout/pub/orderForm/${orderFormId}/items`,
                withoutCache,
              );

              if (allowedOutdatedData) {
                for (const it of allowedOutdatedData) {
                  url.searchParams.append("allowedOutdatedData", it);
                }
              }

              return fetchAPI<OrderForm>(url, {
                method: "POST",
                body: JSON.stringify({ orderItems }),
                headers: {
                  "content-type": "application/json",
                },
              });
            },
            /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/removeAll */
            removeAll: {
              post: () =>
                fetchAPI<OrderForm>(
                  new URL(
                    `./api/checkout/pub/orderForm/${orderFormId}/items/removeAll`,
                    withoutCache,
                  ),
                  { method: "POST" },
                ),
            },
            price: ({
              /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#put-/api/checkout/pub/orderForm/-orderFormId-/items/-itemIndex-/price */
              put: ({ itemIndex, price }: {
                itemIndex: number;
                price: number;
              }) =>
                fetchAPI<OrderForm>(
                  new URL(
                    `./api/checkout/pub/orderForm/${orderFormId}/items/${itemIndex}/price`,
                    withoutCache,
                  ),
                  {
                    method: "PUT",
                    body: JSON.stringify({ price }),
                    headers: {
                      "content-type": "application/json",
                    },
                  },
                ),
            }),
          }),
        }),
      },
    },
  };
};
