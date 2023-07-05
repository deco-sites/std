import type { Suggestion } from "deco-sites/std/commerce/types.ts";

import {
  toProduct,
  toSearchTerm,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

interface AutocompletesPopularReponse {
  requestId: string;
  searchId: string;
  queries: {
    query: string;
    link: string;
  }[];
  products: {
    id: string;
  }[];
}

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 5
   */
  count?: number;
}

/**
 * @title Linx Impulse - Suggestions
 */
const loaders = async (
  props: Props,
  req: Request,
): Promise<Suggestion | null> => {
  const { count, query } = props;

  const linximpulse = createClient();

  const suggestions = await linximpulse.autocompletes
    .popularTerms() as AutocompletesPopularReponse;
  const searches = toSearchTerm(suggestions);

  const topSearches = [];

  const options = {
    baseUrl: req.url,
  };

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: topSearches
      .map((p) => toProduct(p, p.items[0], 0, options)),
  };
};

export default loaders;
