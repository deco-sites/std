import type { Suggestion } from "deco-sites/std/commerce/types.ts";
import type {
  ProductLinxImpulse,
  Query,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import {
  toProduct,
  toRequestHeader,
  toSearchTerm,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import { HttpError } from "deco-sites/std/utils/HttpError.ts";

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
  ctx: Context,
): Promise<Suggestion | null> => {
  const { configLinxImpulse: config } = ctx;
  const { query: term, countSuggestions, countProducts } = props;

  const linxImpulse = paths(config!);
  const requestHeaders = toRequestHeader(config!);

  try {
    const suggestionsData = await fetchAPI<AutocompletesResponse>(
      `${
        linxImpulse.autocompletes.suggestions.term(
          term ?? "",
          countSuggestions ?? 5,
          countProducts ?? 5,
        )
      }`,
      { headers: requestHeaders },
    );

    const options = {
      baseUrl: req.url,
    };

    const products = suggestionsData.products.map((product) =>
      toProduct(product, product.skus[0], 0, options)
    );

    const searches = toSearchTerm(suggestionsData);

    return {
      products,
      searches,
    };
  } catch (err) {
    if (err instanceof HttpError && err.status >= 500) {
      throw err;
    }
    return null;
  }
};

export default loaders;
