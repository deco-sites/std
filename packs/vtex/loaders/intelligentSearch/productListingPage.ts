import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type {
  Facet,
  FacetSearchResult,
  Fuzzy,
  PageType,
  ProductSearchResult,
  RangeFacet,
  SelectedFacet,
  Sort,
} from "deco-sites/std/packs/vtex/types.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "deco-sites/std/packs/vtex/utils/intelligentSearch.ts";
import {
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
  pageTypesToSeo,
} from "deco-sites/std/packs/vtex/utils/legacy.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { slugify } from "deco-sites/std/packs/vtex/utils/slugify.ts";
import {
  filtersFromURL,
  mergeFacets,
  toFilter,
  toProduct,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { parseRange } from "deco-sites/std/utils/filters.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";

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
   * @description Check this if you're creating a custom query page
   */
  ignoreUrlPath?: boolean;

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
   * @title Starting page query parameter.
   * @description Set the starting page. Overrides the parameter in the URL.
   */
  page?: number;

  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;

  /**
   * @description Include similar products
   */
  similars?: boolean;
}

// TODO (mcandeia) investigating bugs related to returning the same set of products but different queries.
const _singleFlightKey = (
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
  const currentPageOffset = props.pageOffset ?? 1;
  // Choses the page number from the props or the url and offsets it by the pageOffset
  const pageFromProps = typeof props.page === "number"
    ? props.page - currentPageOffset
    : undefined;
  const pageFromUrl = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) - currentPageOffset
    : undefined;
  const currentPage = pageFromProps ?? pageFromUrl ?? 0;

  const page = Math.max(
    Math.min(currentPage, VTEX_MAX_PAGES - currentPageOffset),
    0,
  );

  const sort = url.searchParams.get("sort") as Sort ??
    LEGACY_TO_IS[url.searchParams.get("O") ?? ""] ?? props.sort ??
    sortOptions[0].value;

  const selectedFacets = mergeFacets(
    props.selectedFacets ?? [],
    props.ignoreUrlPath ? [] : filtersFromURL(url),
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

  const shouldGetFacetsFromFetch = baseSelectedFacets.length === 0 &&
    !props.ignoreUrlPath;

  const selectedFacets = shouldGetFacetsFromFetch
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
  console.log({ fullTextTerm });
  if (fullTextTerm) {
    ctx.invoke("deco-sites/std/actions/vtex/analytics/sendEvent.ts", {
      type: "session.ping",
    }).then(() =>
      ctx.invoke("deco-sites/std/actions/vtex/analytics/sendEvent.ts", {
        type: "search.query",
        text: fullTextTerm,
        misspelled: productsResult.correction?.misspelled ?? false,
        match: productsResult.recordsFiltered,
        operator: productsResult.operator,
        locale: config?.defaultLocale,
      })
    ).catch(console.error);
  }

  const { products: vtexProducts, pagination, recordsFiltered } =
    productsResult;
  const facets = selectPriceFacet(facetsResult.facets, selectedFacets);

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = await Promise.all(
    vtexProducts.map((p) =>
      toProduct(p, p.items[0], 0, {
        baseUrl: baseUrl,
        priceCurrency: config!.defaultPriceCurrency,
      })
    ).map((product) =>
      props.similars
        ? withIsSimilarTo(ctx, product, {
          hideUnavailableItems: props.hideUnavailableItems,
        })
        : product
    ),
  );

  const paramsToPersist = new URLSearchParams();
  args.query && paramsToPersist.set("q", args.query);
  args.sort && paramsToPersist.set("sort", args.sort);
  const filters = facets.filter((f) => !f.hidden).map(
    toFilter(selectedFacets, paramsToPersist),
  );
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
