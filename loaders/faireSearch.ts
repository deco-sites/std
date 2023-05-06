import type { Product } from "../commerce/types.ts";
import client from "../commerce/faire/client.ts";
import { toProduct } from "../commerce/faire/transform.ts";

export interface Props {
  /** @description query to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
}

/**
 * @title Faire - Search products
 * @description Usefull for shelves and static galleries.
 */
const productListLoader = async (
  { query, count }: Props,
): Promise<Product[] | null> => {
  console.log({ query });
  const rawProducts = await client.searchProducts(query);

  const products = rawProducts.product_tiles.slice(0, count).map(toProduct);

  return products;
};

export default productListLoader;
