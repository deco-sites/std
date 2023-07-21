import { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

export const paths = ({ apiKey, secretKey }: Account) => {
  const recommendationsbaseUrl = "https://recs.chaordicsystems.com/v0";
  const searchBaseUrl = "https://api.linximpulse.com/engage/search/v3";
  const secretKeyParam = secretKey ? `&secretKey=${secretKey}` : "";

  return {
    search: {
      params: (params: URLSearchParams) =>
        `${searchBaseUrl}/search?apiKey=${apiKey}&productFormat=complete&${params}${secretKeyParam}`,
    },
    pages: {
      recommendations: {
        name: (name: string) =>
          `${recommendationsbaseUrl}/pages/recommendations?apiKey=${apiKey}&source=desktop&name=${name}&productFormat=complete${secretKeyParam}`,
      },
    },
    autocompletes: {
      popularTerms:
        `${searchBaseUrl}/autocompletes/popular?apiKey=${apiKey}&productFormat=complete${secretKeyParam}`,
      suggestions: {
        term: (term: string, countSuggestions: number, countProducts: number) =>
          `${searchBaseUrl}/autocompletes?apiKey=${apiKey}&productFormat=complete&prefix=${term}&resultsQueries=${countSuggestions}&resultsProducts=${countProducts}${secretKeyParam}`,
      },
    },
  };
};
