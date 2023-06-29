import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type {
  LegacyProduct,
  LegacySort,
  ProductID,
} from "deco-sites/std/packs/vtex/types.ts";
import { toSegmentParams } from "deco-sites/std/packs/vtex/utils/legacy.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { toProduct } from "deco-sites/std/packs/vtex/utils/transform.ts";
import { fetchAPI } from "deco-sites/std/utils/fetchVTEX.ts";

export interface CollectionProps {
  // TODO: pattern property isn't being handled by RJSF
  /**
   * @description Collection ID or (Product Cluster id). For more info: https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search .
   * @pattern \d*
   */
  collection: string;
  /**
   * @description search sort parameter
   */
  sort?: LegacySort;
  /** @description total number of items to display */
  count: number;
}

export interface TermProps {
  /** @description term to use on search */
  term?: string;
  /**
   * @description search sort parameter
   */
  sort?: LegacySort;
  /** @description total number of items to display */
  count: number;

  /** @description fq's */
  fq?: string[];
}

export interface ProductIDProps {
  /**
   * @description SKU ids to retrieve
   */
  ids: ProductID[];
}

export type Props =
  & Partial<CollectionProps>
  & Partial<TermProps>
  & Partial<ProductIDProps>;

// deno-lint-ignore no-explicit-any
const isCollectionProps = (p: any): p is CollectionProps =>
  typeof p.collection === "string" && typeof p.count === "number";
// deno-lint-ignore no-explicit-any
const isProductIDProps = (p: any): p is ProductIDProps =>
  Array.isArray(p.ids) && p.ids.length > 0;

const fromProps = (
  props: Props,
  params = new URLSearchParams(),
): URLSearchParams => {
  if (props.sort) {
    params.set("O", encodeURI(props.sort));
  }

  if (isProductIDProps(props)) {
    props.ids.forEach((skuId) => params.append("fq", `skuId:${skuId}`));
    params.set("_from", "0");
    params.set("_to", `${Math.max(props.ids.length - 1, 0)}`);

    return params;
  }

  const count = props.count ?? 12;

  if (isCollectionProps(props)) {
    params.set("fq", `productClusterIds:${props.collection}`);
    params.set("_from", "0");
    params.set("_to", `${Math.max(count - 1, 0)}`);

    return params;
  }

  if (props.fq) {
    props.fq.forEach((FQ) => {
      params.append("fq", encodeURI(FQ));
    });

    params.set("_from", "0");
    params.set("_to", `${Math.max(count - 1, 0)}`);

    return params;
  }

  props.term && params.set("ft", encodeURIComponent(props.term));
  params.set("_from", "0");
  params.set("_to", `${Math.max(count - 1, 0)}`);

  return params;
};

/**
 * @title VTEX Catalog - Search Products
 * @description Use it in Shelves and static Galleries.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => {
  const { configVTEX: config } = ctx;
  const { url: baseUrl } = req;
  const segment = getSegment(req);
  const segmentParams = toSegmentParams(segment);
  const params = fromProps(props, segmentParams);

  const vtexProducts = await fetchAPI<LegacyProduct[]>(
    `${paths(config!).api.catalog_system.pub.products.search}?${params}`,
    {
      withProxyCache: true,
      headers: withSegmentCookie(segment),
    },
  );

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, {
      baseUrl: baseUrl,
      priceCurrency: config!.defaultPriceCurrency,
    })
  );

  setSegment(segment, ctx.response.headers);

  return products;
};

export default loader;
