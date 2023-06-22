import type {
  ProductBaseNuvemShop,
} from "deco-sites/std/commerce/nuvemShop/types.ts";
import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import { createClient } from "deco-sites/std/commerce/nuvemShop/client.ts";
import { toProduct } from "deco-sites/std/commerce/nuvemShop/transform.ts";
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
  // Sort in NuvemShort do not work when using q in query params
  // sort?: NuvemShopSort;
}

/**
 * @title NuvemShop - Product Listing page
 * @description Useful for category, search, brand and collection pages.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { configNuvemShop } = ctx;
  const client = createClient(configNuvemShop);

  const per_page = props.limit ?? 10;
  const page = Number(url.searchParams.get("page")) || 0;

  const minPrice = url.searchParams.get("min_price");
  const maxPrice = url.searchParams.get("max_price");

  // Sort in NuvemShort do not work when using q in query params
  // const sort = props.sort || url.searchParams.get("sort") as NuvemShopSort;

  let q = props.term || url.searchParams.get("q") ||
    decodeURIComponent(url.pathname) ||
    undefined;

  q = q?.replace("/", "");

  let result: ProductBaseNuvemShop[] | undefined;

  try {
    result = await client?.product.search({
      q,
      per_page,
      page,
      price_max: maxPrice,
      price_min: minPrice,
    });
  } catch {
    result = [];
  }

  const products = result?.map((product) => {
    return [...toProduct(product, new URL(req.url), null)];
  }).flat();

  const nextPage = new URLSearchParams(url.searchParams);
  nextPage.set("page", (page + 1).toString());

  const previousPage = new URLSearchParams(url.searchParams);
  previousPage.set("page", (page - 1).toString());

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          name: q || "",
          item: `${q}`,
          position: 1,
        },
      ],
      numberOfItems: 1,
    },
    products: products ?? [],
    pageInfo: {
      nextPage: `?${nextPage}`,
      previousPage: `?${previousPage}`,
      currentPage: page,
    },
    // sortOptions: NUVEMSHOP_SORT_OPTIONS, Sort in NuvemShort do not work when using q in query params
    sortOptions: [],
    // filters: toFilters(
    //   result || [],
    //   typeof minPrice === "number" ? minPrice : parseFloat(minPrice || "0"),
    //   typeof maxPrice === "number" ? maxPrice : parseFloat(maxPrice || "0"),
    //   req.url,
    // ),
    filters: [], // NuvemShop right now don't receive product variant query params in products route
  };
};

export default loader;
