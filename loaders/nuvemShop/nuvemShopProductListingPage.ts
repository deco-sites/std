import type { NuvemShopSort } from "deco-sites/std/commerce/nuvemShop/types.ts";
import {
  createClient,
  NUVEMSHOP_SORT_OPTIONS,
} from "deco-sites/std/commerce/nuvemShop/client.ts";
import {
  toFilters,
  toProduct,
} from "deco-sites/std/commerce/nuvemShop/transform.ts";
import type { Context } from "deco-sites/std/commerce/nuvemShop/types.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  limit: number;
  sort?: NuvemShopSort;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * @title NuvemShop - Product Listing page
 * @description Useful for category, search, brand and collection pages.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
) => {
  const url = new URL(req.url);
  // const { configNuvemShop } = ctx.state.global;
  const configNuvemShop = {
    userAgent: "My Awsome App (lucis@deco.cx)",
    accessToken: "87d04ece2a751e7334994dbd3d135647967dfe11",
    storeId: "2734114",
  };
  console.log({ props, req, ctx });
  const client = createClient(configNuvemShop);

  const per_page = props.limit ?? 10;
  const sort = props.sort || url.searchParams.get("sort_by") as NuvemShopSort ||
    "user";
  const minPrice = props.minPrice || url.searchParams.get("min_price");
  const maxPrice = props.maxPrice || url.searchParams.get("max_price");
  const page = Number(url.searchParams.get("page")) || 1;

  const q = /*ctx.params.slug ||*/ props.term || url.searchParams.get("q") ||
    undefined;

  const result = await client?.product.search({
    q,
    sort,
    per_page,
  });

  const products = result?.map((product) => {
    return toProduct(product);
  });

  const nextPage = new URLSearchParams(url.searchParams);
  nextPage.set("page", (page + 1).toString());

  const previousPage = new URLSearchParams(url.searchParams);
  previousPage.set("page", (page - 1).toString());

  return {
    data: {
      "@type": "ProductListingPage",
      // TODO: Find out what's the right breadcrumb on vnda
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      products: products,
      pageInfo: {
        nextPage: `?${nextPage}`,
        previousPage: `?${previousPage}`,
        currentPage: page,
      },
      sortOptions: NUVEMSHOP_SORT_OPTIONS,
      filters: toFilters(
        typeof minPrice === "number" ? minPrice : parseFloat(minPrice || "0"),
        typeof maxPrice === "number" ? maxPrice : parseFloat(maxPrice || "0"),
        sort,
      ),
    },
  };
};

export default loader;
