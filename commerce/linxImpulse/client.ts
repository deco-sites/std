import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

import type { Sort } from "deco-sites/std/packs/linxImpulse/types.ts";

const requestHeaders = {
  origin: `https://www.ibyte.com.br`,
  referer: `https://www.ibyte.com.br/`,
};

export type ClientLinxImpulse = ReturnType<typeof createClient>;

export const createClient = () => {
  const recommendationsbaseUrl = "https://recs.chaordicsystems.com/v0";
  const searchBaseUrl = "https://api.linximpulse.com/engage/search/v3";
  const apiKey = "ibyte";

  const recommendations = (name: string) => {
    return fetchAPI(
      `${recommendationsbaseUrl}/pages/recommendations?apiKey=${apiKey}&source=desktop&name=${name}&productFormat=complete`,
      { headers: requestHeaders },
    );
  };

  const popularTerms = () => {
    return fetchAPI(
      `${searchBaseUrl}/autocompletes/popular?apiKey=${apiKey}&productFormat=complete`,
      { headers: requestHeaders },
    );
  };

  const autocompletesProducts = (terms: string) => {
    return fetchAPI(
      `${searchBaseUrl}/autocompletes/products?apiKey=${apiKey}&terms=${terms}&productFormat=complete`,
      { headers: requestHeaders },
    );
  };

  const search = (
    terms: string,
    sort: Sort,
    count: number,
    hideUnavailableItems: boolean,
  ) => {
    return fetchAPI(
      `${searchBaseUrl}/search?apiKey=${apiKey}&terms=${terms}&productFormat=complete&resultsPerPage=${count}&sortBy=${sort}&showOnlyAvailable=${hideUnavailableItems}`,
      { headers: requestHeaders },
    );
  };

  return {
    pages: {
      recommendations,
    },
    autocompletes: {
      popularTerms,
      autocompletesProducts,
    },
    search,
  };
};
