import type { Suggestion } from "deco-sites/std/commerce/types.ts";
import type {
  ProductLinxImpulse,
  Query,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import {
  toProduct,
  toSearchTerm,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

interface AutocompletesResponse {
  requestId: string;
  searchId: string;
  queries: Query[];
  products: ProductLinxImpulse[];
}

export interface Props {
  /**
   * @description term to get the list of product suggestions
   */
  query?: string;
  /**
   * @description limit the number of suggestions terms
   */
  countSuggestions?: number;
  /**
   * @description limit the number of products
   */
  countProducts?: number;
}

/**
 * @title Linx Impulse - Autocompletes Products
 */
const loaders = async (
  props: Props,
  req: Request,
): Promise<Suggestion | null> => {
  const { query: term, countSuggestions, countProducts } = props;

  if (!term) return null;

  const linximpulse = createClient();

  const suggestionsData = await linximpulse.autocompletes
    .suggestions(
      term,
      countSuggestions ?? 5,
      countProducts ?? 5,
    ) as AutocompletesResponse;

  const options = {
    baseUrl: req.url,
  };

  const products = suggestionsData.products.map((product) =>
    toProduct(product, product.skus[0].properties, 0, options)
  );

  const searches = toSearchTerm(suggestionsData);

  return {
    products,
    searches,
  };
};

export default loaders;
