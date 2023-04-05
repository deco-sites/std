import type { LoaderFunction } from "$live/types.ts";

import type { Filter, ProductListingPage } from "../commerce/types.ts";
import { createClient } from "../commerce/vtex/client.ts";
import {
  filtersFromSearchParams,
  toFilter,
  toProduct,
} from "../commerce/vtex/transform.ts";
import type {
  Fuzzy,
  PageType,
  Sort,
  StateVTEX,
} from "../commerce/vtex/types.ts";
import { slugify } from "../commerce/vtex/utils/slugify.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import { withSegment } from "../commerce/vtex/withSegment.ts";
import {
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
} from "./vtexLegacyProductListingPage.ts";

/** this type is more friendly user to fuzzy type that is 0, 1 or auto. */
export type LabelledFuzzy = "automatic" | "disabled" | "enabled";

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

  /*
   * @title Fuzzy
   */
  fuzzy?: LabelledFuzzy;
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
  const count = props.count ?? 12;
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const page = Number(url.searchParams.get("page")) ?? 0;
  const sort = url.searchParams.get("sort") as Sort ?? "" as Sort;
  const selectedFacets = filtersFromSearchParams(url.searchParams);
  const fuzzy = mapLabelledFuzzyToFuzzy(props.fuzzy) ??
    url.searchParams.get("fuzzy") as Fuzzy;

  return {
    query,
    fuzzy,
    page,
    sort,
    count,
    selectedFacets,
  };
};

const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "brand",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
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

/**
 * @title Product listing page loader
 * @description Returns data ready for search pages like category,brand pages
 */
const plpLoader: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVTEX
> = withSegment(withISFallback(async (
  req,
  ctx,
  props,
) => {
  const { global: { configVTEX }, segment } = ctx.state;
  const url = new URL(req.url);
  const vtex = createClient(configVTEX);

  const { selectedFacets: baseSelectedFacets, page, ...args } = searchArgsOf(
    props,
    url,
  );
  const pageTypesPromise = pageTypesFromPathname(url.pathname, vtex);
  const selectedFacets = baseSelectedFacets.length === 0
    ? filtersFromPathname(await pageTypesPromise)
    : baseSelectedFacets;

  const searchArgs = {
    ...args,
    page,
    selectedFacets,
    fuzzy,
    segment,
  };

  // search products on VTEX. Feel free to change any of these parameters
  const [productsResult, facetsResult] = await Promise.all([
    vtex.search.products(searchArgs),
    vtex.search.facets(searchArgs),
  ]);
  const { products: vtexProducts, pagination } = productsResult;
  const { facets } = facetsResult;

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() })
  );
  const filters = facets
    .map((f) => !f.hidden && toFilter(f, selectedFacets))
    .filter((x): x is Filter => Boolean(x));
  const itemListElement = pageTypesToBreadcrumbList(
    await pageTypesPromise,
    url,
  );

  const hasNextPage = Boolean(pagination.next.proxyUrl);
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
        nextPage: hasNextPage ? `?${nextPage}` : undefined,
        previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
        currentPage: page,
      },
    },
  };
}));

export default plpLoader;
