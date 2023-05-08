import { toProduct } from "deco-sites/std/packs/vtex/utils/transform.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import {
  withDefaultFacets,
  withDefaultParams,
} from "deco-sites/std/packs/vtex/utils/intelligentSearch.ts";
import type {
  ProductID,
  ProductSearchResult,
} from "deco-sites/std/packs/vtex/types.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Sort } from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface CollectionList {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @title Collection ID (e.g.: 139)
   * @pattern \d*
   */
  collection: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display */
  count: number;
}

export interface QueryList {
  /** @description query to use on search */
  query: string;
  /**
   * @description search sort parameter
   */
  sort?: Sort;
  /** @description total number of items to display */
  count: number;
}

export interface ProductIDList {
  /**
   * @description SKU ids to retrieve
   */
  ids: ProductID[];
}

// TODO: Change & to |. Somehow RJS bugs when using |
export type Props =
  & Partial<CollectionList>
  & Partial<QueryList>
  & Partial<ProductIDList>;

// deno-lint-ignore no-explicit-any
const isCollectionList = (p: any): p is CollectionList =>
  typeof p.collection === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isQueryList = (p: any): p is QueryList =>
  typeof p.query === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isProductIDList = (p: any): p is ProductIDList => Array.isArray(p.ids);

const fromProps = (props: Props) => {
  if (isProductIDList(props)) {
    return {
      query: `sku:${props.ids.join(";")}`,
      count: props.ids.length || 12,
      sort: "",
      selectedFacets: [],
    } as const;
  }

  if (isQueryList(props)) {
    return {
      query: props.query || "",
      count: props.count || 12,
      sort: props.sort || "",
      selectedFacets: [],
    } as const;
  }

  if (isCollectionList(props)) {
    return {
      query: "",
      count: props.count || 12,
      sort: props.sort || "",
      selectedFacets: [{ key: "productClusterIds", value: props.collection }],
    } as const;
  }

  throw new Error(`Unknown props: ${JSON.stringify(props)}`);
};

/**
 * @title VTEX product list - Intelligent Search
 * @description Usefull for shelves and galleries.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => {
  const { configVTEX: config } = ctx;
  const { url } = req;
  const vtex = paths(config!);
  const segment = getSegment(req);

  const { selectedFacets, ...args } = fromProps(props);
  const params = withDefaultParams(args, ctx);
  const facets = withDefaultFacets(selectedFacets, ctx);
  const search = vtex.api.io._v.api["intelligent-search"].product_search;

  // search products on VTEX. Feel free to change any of these parameters
  const { products: vtexProducts } = await fetchAPI<ProductSearchResult>(
    `${search.facets(facets)}?${params}`,
    {
      withProxyCache: true,
      headers: withSegmentCookie(segment),
    },
  );

  const options = {
    baseUrl: url,
    priceCurrency: config!.defaultPriceCurrency,
  };

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts
    .map((p) => toProduct(p, p.items[0], 0, options));

  setSegment(segment, ctx.response.headers);

  return products;
};

export default loader;
