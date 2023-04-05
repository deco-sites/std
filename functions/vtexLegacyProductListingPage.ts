import type { LoaderFunction } from "$live/types.ts";

import { ClientVTEX, createClient } from "../commerce/vtex/client.ts";
import { legacyFacetToFilter, toProduct } from "../commerce/vtex/transform.ts";
import { slugify } from "../commerce/vtex/utils/slugify.ts";
import { withSegment } from "../commerce/vtex/withSegment.ts";
import type { Filter, ProductListingPage } from "../commerce/types.ts";
import type { LegacySort, PageType } from "../commerce/vtex/types.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";

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
}

const SORT_TO_LEGACY_SORT: Record<string, string> = {
  "price:desc": "OrderByPriceDESC",
  "price:asc": "OrderByPriceASC",
  "orders:desc": "OrderByTopSaleDESC",
  "name:desc": "OrderByNameDESC",
  "name:asc": "OrderByNameASC",
  "release:desc": "OrderByReleaseDateDESC",
  "discount:desc": "OrderByBestDiscountDESC",
  "": "OrderByScoreDESC",
};

const segmentsFromTerm = (term: string) => term.split("/").filter(Boolean);

export const pageTypesFromPathname = async (
  term: string,
  vtex: ClientVTEX,
) => {
  const segments = segmentsFromTerm(term);

  const results = await Promise.all(
    segments.map((_, index) =>
      vtex.catalog_system.pageType({
        slug: segments.slice(0, index + 1).join("/"),
      })
    ),
  );

  return results.filter((result) => PAGE_TYPE_TO_MAP_PARAM[result.pageType]);
};

export const pageTypesToBreadcrumbList = (pages: PageType[], url: URL) => {
  const filteredPages = pages
    .filter(({ pageType }) =>
      pageType === "Category" || pageType === "Department" ||
      pageType === "SubCategory"
    );

  return filteredPages.map((page, index) => {
    const position = index + 1;
    const slug = filteredPages.slice(0, position).map((x) => slugify(x.name!));

    return ({
      "@type": "ListItem" as const,
      name: page.name!,
      item: new URL(`/${slug.join("/")}`, url.origin).href,
      position,
    });
  });
};

const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "b",
  Category: "c",
  Department: "c",
  SubCategory: "c",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
  Product: null,
  NotFound: null,
  FullText: null,
};

const getMapAndTerm = (
  pageTypes: PageType[],
) => {
  const term = pageTypes
    .map((type, index) =>
      type.url
        ? segmentsFromTerm(
          new URL(`http://${type.url}`).pathname,
        )[index]
        : null
    )
    .filter(Boolean)
    .join("/");

  const map = pageTypes
    .map((type) => PAGE_TYPE_TO_MAP_PARAM[type.pageType])
    .filter(Boolean)
    .join(",");

  return [map, term];
};

/**
 * @title Product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 */
const legacyPLPLoader: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVTEX
> = withSegment(async (
  req,
  ctx,
  props,
) => {
  const url = new URL(req.url);
  const { configVTEX } = ctx.state.global;
  const vtex = createClient(configVTEX);

  const count = props.count ?? 12;
  const maybeMap = props.map || url.searchParams.get("map") || undefined;
  const maybeTerm = props.term || ctx.params["0"] || "";
  const pageTypesPromise = pageTypesFromPathname(maybeTerm, vtex);
  const page = Number(url.searchParams.get("page")) || 0;
  const O = (url.searchParams.get("O") ||
    SORT_TO_LEGACY_SORT[url.searchParams.get("sort") ?? ""]) as LegacySort;
  const ft = props.ft || url.searchParams.get("ft") ||
    url.searchParams.get("q") || "";
  const fq = props.fq || url.searchParams.get("fq") || "";
  const _from = page * count;
  const _to = (page + 1) * count - 1;

  const [map, term] =
    typeof maybeMap !== "string" || typeof maybeTerm !== "string"
      ? getMapAndTerm(await pageTypesPromise)
      : [maybeMap, maybeTerm];

  const searchArgs = {
    term,
    map,
    _from,
    _to,
    O,
    ft,
    fq,
  };

  // search products on VTEX. Feel free to change any of these parameters
  const [vtexProducts, vtexFacets] = await Promise.all([
    vtex.catalog_system.products(searchArgs),
    vtex.catalog_system.facets(searchArgs),
  ]);

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() })
  );
  const filters = Object.entries({
    Departments: vtexFacets.Departments,
    Brands: vtexFacets.Brands,
    ...vtexFacets.SpecificationFilters,
  }).map(([name, facets]) => legacyFacetToFilter(name, facets, url, map))
    .flat()
    .filter((x): x is Filter => Boolean(x));
  const itemListElement = pageTypesToBreadcrumbList(
    await pageTypesPromise,
    url,
  );

  const hasNextPage = Boolean(page < 50 && products.length === count);
  const hasPreviousPage = page > 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    data: {
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
        previousPage: hasPreviousPage
          ? `?${previousPage.toString()}`
          : undefined,
        currentPage: page,
      },
    },
  };
});

export default legacyPLPLoader;
