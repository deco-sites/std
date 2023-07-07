import type { Product } from "deco-sites/std/commerce/types.ts";
import type { ProductLinxImpulse } from "../../types.ts";

import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

interface AutocompletesProductsResponse {
  requestId: string;
  searchId: string;
  products: ProductLinxImpulse[];
}

export interface Props {
  /**
   * @description term to get the list of product suggestions
   */
  query?: string;
}

/**
 * @title Linx Impulse - Autocompletes Products
 */
const loaders = async (
  props: Props,
  req: Request,
): Promise<Product[] | null> => {
  const { query } = props;

  const linximpulse = createClient();

  const { products } = await linximpulse.autocompletes
    .autocompletesProducts(query) as AutocompletesProductsResponse;

  const options = {
    baseUrl: req.url,
  };

  return products.map((product) =>
    toProduct(product, product.skus[0].properties, 0, options)
  );
};

export default loaders;
