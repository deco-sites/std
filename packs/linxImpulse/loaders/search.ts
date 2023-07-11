import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type { SearchProductsResponse, Sort } from "../types.ts";

import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

const sortOptions = [
  { value: "relevance", "label": "Relevância" },
  { value: "pid", "label": "Id de produto" },
  { value: "ascPrice", "label": "Menor preço" },
  { value: "descPrice", "label": "Maior preço" },
  { value: "descDate", "label": "Lançamentos" },
  { value: "ascSold", "label": "Menor venda" },
  { value: "descSold", "label": "Maior venda" },
  { value: "descReview", "label": "Maior avaliação" },
  { value: "ascReview", "label": "Menor avaliação" },
  { value: "descDiscount", "label": "Maiores descontos" },
];

const searchArgsOf = (props: Props, url: URL) => {
  const hideUnavailableItems = Boolean(props.hideUnavailableItems);
  const count = props.count ?? 12;
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const sort = url.searchParams.get("sort") as Sort ?? sortOptions[0].value;

  return {
    query,
    sort,
    count,
    hideUnavailableItems,
  };
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
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;
}

/**
 * @title Linx Impulse - Product Listing page
 * @description Returns data ready for search pages like category, brand pages
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => {
  const { url: baseUrl } = req;
  const { configLinxImpulse: config } = ctx;

  const url = new URL(baseUrl);
  const linximpulse = createClient();

  const { query, sort, count, hideUnavailableItems } = searchArgsOf(props, url);

  const searchData = await linximpulse.search(
    query,
    sort,
    count,
    hideUnavailableItems,
  ) as SearchProductsResponse;

  const products = searchData.products.map((product) =>
    toProduct(product, product.skus[0].properties, 0, { baseUrl })
  );

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [{
        "@type": "ListItem" as const,
        name: searchData.queries.original!,
        item: "#",
        position: 1,
      }],
      numberOfItems: 1,
    },
    filters: [],
    products,
    pageInfo: {
      nextPage: undefined,
      previousPage: undefined,
      currentPage: 0,
      records: searchData.size,
      recordPerPage: count,
    },
    sortOptions,
    seo: {
      title: "",
      description: "",
      canonical: "",
    },
  };
};

export default loader;
