import type { ProductListingPage } from "../commerce/types.ts";
import client from "../commerce/faire/client.ts";
import { toProduct } from "../commerce/faire/transform.ts";

export interface Props {
  /** @description total number of items to display */
  items: number;
}

/**
 * @title Faire - Search Page
 * @description Uses ?s
 */
const productListLoader = async (
  { items }: Props,
  req: Request,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const query = url.searchParams.get("s");
  const rawProducts = await client.searchProducts(query as string);

  const products = rawProducts.product_tiles.slice(0, items).map(toProduct);

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: [],
    products,
    // TODO: Pagination
    pageInfo: {
      nextPage: undefined,
      previousPage: undefined,
      currentPage: 1,
    },
    sortOptions: [],
  };
};

export default productListLoader;
