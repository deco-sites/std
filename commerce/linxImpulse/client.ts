import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

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

  const suggestions = (
    term: string,
    countSuggestions: number,
    countProducts: number,
  ) => {
    return fetchAPI(
      `${searchBaseUrl}/autocompletes?apiKey=${apiKey}&productFormat=complete&prefix=${term}&resultsQueries=${countSuggestions}&resultsProducts=${countProducts}`,
      { headers: requestHeaders },
    );
  };

  return {
    pages: {
      recommendations,
    },
    autocompletes: {
      popularTerms,
      suggestions,
    },
  };
};
