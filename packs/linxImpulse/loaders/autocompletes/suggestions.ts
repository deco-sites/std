import type { Suggestion } from "deco-sites/std/commerce/types.ts";

import {
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
  /**
   * @description limit the number of searches
   */
  count?: number;
}

/**
 * @title Linx Impulse - Autocompletes Popular Terms
 */
const loaders = async (
  props: Props,
): Promise<Suggestion | null> => {
  const { count } = props;

  const linximpulse = createClient();

  const suggestions = await linximpulse.autocompletes
    .popularTerms() as AutocompletesPopularReponse;
  const searches = toSearchTerm(suggestions);

  return {
    searches: count ? searches.slice(0, count) : searches,
  };
};

export default loaders;
