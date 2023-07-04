import {
  filtersFromURL,
  mergeFacets,
  toFilter,
  toProduct,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import type {
  FacetSearchResult,
  PageType,
  ProductSearchResult,
  SelectedFacet,
} from "deco-sites/std/packs/vtex/types.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "deco-sites/std/packs/vtex/utils/intelligentSearch.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { slugify } from "deco-sites/std/packs/vtex/utils/slugify.ts";
import {
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
  pageTypesToSeo,
} from "deco-sites/std/packs/vtex/utils/legacy.ts";
import { parseRange } from "deco-sites/std/utils/filters.ts";
import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type {
  Facet,
  Fuzzy,
  RangeFacet,
  Sort,
} from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

/** this type is more friendly user to fuzzy type that is 0, 1 or auto. */
export type LabelledFuzzy = "automatic" | "disabled" | "enabled";

/**
 * VTEX Intelligent Search doesn't support pagination above 50 pages.
 *
 * We're now showing results for the last page so the page doesn't crash
 */
const VTEX_MAX_PAGES = 50;

const sortOptions = [
  { value: "", label: "relevance:desc" },
  { value: "price:desc", label: "price:desc" },
  { value: "price:asc", label: "price:asc" },
  { value: "orders:desc", label: "orders:desc" },
  { value: "name:desc", label: "name:desc" },
  { value: "name:asc", label: "name:asc" },
  { value: "release:desc", label: "release:desc" },
  { value: "discount:desc", label: "discount:desc" },
];

const LEGACY_TO_IS: Record<string, Sort> = {
  OrderByPriceDESC: "price:desc",
  OrderByPriceASC: "price:asc",
  OrderByTopSaleDESC: "orders:desc",
  OrderByNameDESC: "name:desc",
  OrderByReleaseDateDESC: "release:desc",
  OrderByBestDiscountDESC: "discount:desc",
};

const mapLabelledFuzzyToFuzzy = (
  labelledFuzzy?: LabelledFuzzy,
): Fuzzy | undefined => {
  switch (labelledFuzzy) {
    case "automatic":
      return "auto";
    case "disabled":
      return "0";
    case "enabled":
      return "1";
    default:
      return;
  }
};

export interface Props {
  /**
   * @description overides the query term
   */
  query?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;

  /**
   * @title Sorting
   */
  sort?: Sort;

  /**
   * @title Fuzzy
   */
  fuzzy?: LabelledFuzzy;

  /**
   * @title Selected Facets
   * @description Override selected facets from url
   */
  selectedFacets?: SelectedFacet[];

  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;

  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;
}

export const singleFlightKey = (
  props: Props,
  { request }: { request: Request },
) => {
  const url = new URL(request.url);
  const { query, count, sort, page, selectedFacets, fuzzy } = searchArgsOf(
    props,
    url,
  );
  return `${query}${count}${sort}${page}${fuzzy}${
    selectedFacets.map((f) => `${f.key}${f.value}`).sort().join("")
  }`;
};

const searchArgsOf = (props: Props, url: URL) => {
  const hideUnavailableItems = props.hideUnavailableItems;
  const count = props.count ?? 12;
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const currentPageoffset = props.pageOffset ?? 1;
  const page = Math.min(
    url.searchParams.get("page")
      ? Number(url.searchParams.get("page")) - (currentPageoffset)
      : 0,
    VTEX_MAX_PAGES - currentPageoffset,
  );
  const sort = url.searchParams.get("sort") as Sort ??
    LEGACY_TO_IS[url.searchParams.get("O") ?? ""] ?? props.sort ??
    sortOptions[0].value;
  const selectedFacets = mergeFacets(
    props.selectedFacets ?? [],
    filtersFromURL(url),
  );
  const fuzzy = mapLabelledFuzzyToFuzzy(props.fuzzy) ??
    url.searchParams.get("fuzzy") as Fuzzy;

  return {
    query,
    fuzzy,
    page,
    sort,
    count,
    hideUnavailableItems,
    selectedFacets,
  };
};

const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "brand",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
  Search: null,
  Product: null,
  NotFound: null,
  FullText: null,
};

const pageTypeToMapParam = (type: PageType["pageType"], index: number) => {
  if (type === "Category" || type === "Department" || type === "SubCategory") {
    return `category-${index + 1}`;
  }

  return PAGE_TYPE_TO_MAP_PARAM[type];
};

const filtersFromPathname = (pages: PageType[]) =>
  pages
    .map((page, index) => {
      const key = pageTypeToMapParam(page.pageType, index);

      if (!key || !page.name) {
        return;
      }

      return key && page.name && {
        key,
        value: slugify(page.name),
      };
    })
    .filter((facet): facet is { key: string; value: string } => Boolean(facet));

// Search API does not return the selected price filter, so there is no way for the
// user to remove this price filter after it is set. This function selects the facet
// so users can clear the price filters
const selectPriceFacet = (facets: Facet[], selectedFacets: SelectedFacet[]) => {
  const price = facets.find((f): f is RangeFacet => f.key === "price");
  const ranges = selectedFacets
    .filter((k) => k.key === "price")
    .map((s) => parseRange(s.value))
    .filter(Boolean);

  if (price) {
    for (const range of ranges) {
      if (!range) continue;

      for (const val of price.values) {
        if (val.range.from === range.from && val.range.to === range.to) {
          val.selected = true;
        }
      }
    }
  }

  return facets;
};

/**
 * @title VTEX Intelligent Search - Product Listing page
 * @description Returns data ready for search pages like category,brand pages
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  const { url: baseUrl } = req;
  const { configVTEX: config } = ctx;
  const url = new URL(baseUrl);
  const vtex = paths(config!);
  const segment = getSegment(req);
  const search = vtex.api.io._v.api["intelligent-search"];
  const currentPageoffset = props.pageOffset ?? 1;

  const {
    selectedFacets: baseSelectedFacets,
    page,
    ...args
  } = searchArgsOf(props, url);

  const pageTypesPromise = pageTypesFromPathname(url.pathname, ctx);
  const selectedFacets = baseSelectedFacets.length === 0
    ? filtersFromPathname(await pageTypesPromise)
    : baseSelectedFacets;

  const selected = withDefaultFacets(selectedFacets, ctx);
  const fselected = selected.filter((f) => f.key !== "price");
  const params = withDefaultParams({ ...args, page }, ctx);

  // search products on VTEX. Feel free to change any of these parameters
  const [productsResult, facetsResult] = await Promise.all([
    fetchAPI<ProductSearchResult>(
      `${search.product_search.facets(toPath(selected))}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    ),
    fetchAPI<FacetSearchResult>(
      `${search.facets.facets(toPath(fselected))}?${params}`,
      { withProxyCache: true, headers: withSegmentCookie(segment) },
    ),
  ]);

  /** Intelligent search API analytics. Fire and forget 🔫 */
  const fullTextTerm = params.get("query");
  if (fullTextTerm) {
    fetchAPI(vtex["event-api"].v1.account.event, {
      method: "POST",
      body: JSON.stringify({
        type: "search.query",
        text: fullTextTerm,
        misspelled: productsResult.correction?.misspelled ?? false,
        match: productsResult.recordsFiltered,
        operator: productsResult.operator,
        locale: config?.defaultLocale,
        agent: "deco-sites/std",
        anonymous: crypto.randomUUID(),
        session: crypto.randomUUID(),
      }),
      headers: {
        "content-type": "application/json",
      },
    }).catch(console.error);
  }

  const { products: vtexProducts, pagination, recordsFiltered } =
    productsResult;
  const facets = selectPriceFacet(facetsResult.facets, selectedFacets);

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, {
      baseUrl: baseUrl,
      priceCurrency: config!.defaultPriceCurrency,
    })
  );

  const filters = facets.filter((f) => !f.hidden).map(toFilter(selectedFacets));
  const pageTypes = await pageTypesPromise;
  const itemListElement = pageTypesToBreadcrumbList(pageTypes, baseUrl);

  const hasNextPage = Boolean(pagination.next.proxyUrl);
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
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage: page + currentPageoffset,
      records: recordsFiltered,
      recordPerPage: pagination.perPage,
    },
    sortOptions,
    seo: pageTypesToSeo(pageTypes, req),
  };
};

export default loader;
