import type {
  Filter,
  ProductListingPage,
} from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { LegacySort } from "deco-sites/std/packs/vtex/types.ts";
import {
  getMapAndTerm,
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
  toSegmentParams,
} from "deco-sites/std/packs/vtex/utils/legacy.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import {
  legacyFacetToFilter,
  toProduct,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
import { fetchAPI, fetchSafe } from "deco-sites/std/utils/fetchVTEX.ts";
import type { LegacyFacets, LegacyProduct } from "../../types.ts";

const MAX_ALLOWED_PAGES = 500;

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
  /**
   * @description FullText term
   * @$comment https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search
   */
  ft?: string;
  /**
   * @$comment https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search
   */
  fq?: string;
  /**
   * @description map param
   */
  map?: string;
  /**
   * @title Sorting
   */
  sort?: LegacySort;

  /**
   * @title Filter behavior
   * @description Set to static to not change the facets when the user filters the search. Dynamic will only show the filters containing products after each filter action
   */
  filters?: "dynamic" | "static";

  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;
}

export const sortOptions = [
  { label: "price:desc", value: "OrderByPriceDESC" },
  { label: "price:asc", value: "OrderByPriceASC" },
  { label: "orders:desc", value: "OrderByTopSaleDESC" },
  { label: "name:desc", value: "OrderByNameDESC" },
  { label: "name:asc", value: "OrderByNameASC" },
  { label: "release:desc", value: "OrderByReleaseDateDESC" },
  { label: "discount:desc", value: "OrderByBestDiscountDESC" },
  { label: "relevance:desc", value: "OrderByScoreDESC" },
];

const IS_TO_LEGACY: Record<string, LegacySort> = {
  "price:desc": "OrderByPriceDESC",
  "price:asc": "OrderByPriceASC",
  "orders:desc": "OrderByTopSaleDESC",
  "name:desc": "OrderByNameDESC",
  "release:desc": "OrderByReleaseDateDESC",
  "discount:desc": "OrderByBestDiscountDESC",
  "relevance:desc": "OrderByScoreDESC",
};

const getTerm = (path: string, map: string) => {
  const mapSegments = map.split(",");
  const pathSegments = path.replace(/^\/.*/, "").split("/");

  return pathSegments.slice(0, mapSegments.length).join("/");
};

/**
 * @title VTEX product listing page - Portal
 * @description Returns data ready for search pages like category,brand pages
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  const { configVTEX: config } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);
  const segment = getSegment(req);
  const params = toSegmentParams(segment);
  const search = paths(config!).api.catalog_system.pub;
  const currentPageoffset = props.pageOffset ?? 1;

  const filtersBehavior = props.filters || "dynamic";
  const count = props.count ?? 12;
  const maybeMap = props.map || url.searchParams.get("map") || undefined;
  const maybeTerm = props.term || url.pathname || "";
  const page = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) - (currentPageoffset)
    : 0;
  const O = url.searchParams.get("O") as LegacySort ??
    IS_TO_LEGACY[url.searchParams.get("sort") ?? ""] ??
    props.sort ??
    sortOptions[0].value;
  const ft = props.ft || url.searchParams.get("ft") ||
    url.searchParams.get("q") || "";
  const fq = props.fq || url.searchParams.get("fq") || "";
  const _from = `${page * count}`;
  const _to = `${(page + 1) * count - 1}`;

  const pageTypes = await pageTypesFromPathname(maybeTerm, ctx);

  if (pageTypes.length === 0 && !ft && !fq) {
    return null;
  }

  const missingParams = typeof maybeMap !== "string" || !maybeTerm;
  const [map, term] = missingParams
    ? getMapAndTerm(pageTypes)
    : [maybeMap, maybeTerm];
  const fmap = url.searchParams.get("fmap") ?? map;
  const args = { map, _from, _to, O, ft, fq };

  const pParams = new URLSearchParams(params);
  Object.entries(args).map(([key, value]) => value && pParams.set(key, value));

  const fParams = new URLSearchParams(pParams);
  fmap && fParams.set("map", fmap);

  const [vtexProductsResponse, vtexFacets] = await Promise.all([
    fetchSafe(
      `${search.products.search.term(getTerm(term, map))}?${pParams}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    ),
    fetchAPI<LegacyFacets>(
      `${search.facets.search.term(getTerm(term, fmap))}?${fParams}`,
      { withProxyCache: true },
    ),
  ]);

  const vtexProducts = await vtexProductsResponse.json() as LegacyProduct[];
  const resources = vtexProductsResponse.headers.get("resources") ?? "";
  const [, _total] = resources.split("/");

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, {
      baseUrl,
      priceCurrency: config!.defaultPriceCurrency,
    })
  );
  const filters = Object.entries({
    Departments: vtexFacets.Departments,
    Brands: vtexFacets.Brands,
    ...vtexFacets.SpecificationFilters,
  }).map(([name, facets]) =>
    legacyFacetToFilter(name, facets, url, map, filtersBehavior)
  )
    .flat()
    .filter((x): x is Filter => Boolean(x));
  const itemListElement = pageTypesToBreadcrumbList(pageTypes, baseUrl);

  const hasMoreResources = parseInt(_to, 10) < parseInt(_total, 10) - 1;

  const hasNextPage = Boolean(
    page < MAX_ALLOWED_PAGES && hasMoreResources,
  );

  const hasPreviousPage = page > 0;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + currentPageoffset + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page + currentPageoffset - 1).toString());
  }

  setSegment(segment, ctx.response.headers);

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    filters,
    products,
    pageInfo: {
      nextPage: hasNextPage ? `?${nextPage.toString()}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage.toString()}` : undefined,
      currentPage: page + currentPageoffset,
      records: parseInt(_total, 10),
      recordPerPage: count,
    },
    sortOptions,
  };
};

export default loader;
