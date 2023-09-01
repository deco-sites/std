import type { Suggestion } from "deco-sites/std/commerce/types.ts";

import {
  toRequestHeader,
  toSearchTerm,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";

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
  _req: Request,
  ctx: Context,
): Promise<Suggestion | null> => {
  const { configLinxImpulse: config } = ctx;
  const { count } = props;

  const linxImpulse = paths(config!);
  const requestHeaders = toRequestHeader(config!);

  const suggestions = await fetchAPI<AutocompletesPopularReponse>(
    `${linxImpulse.autocompletes.popularTerms}`,
    { headers: requestHeaders },
  );

  const searches = toSearchTerm(suggestions);

  return {
    searches: count ? searches.slice(0, count) : searches,
  };
};

export default loaders;
