import { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

export const paths = ({ apiKey }: Account) => {
  const recommendationsbaseUrl = "https://recs.chaordicsystems.com/v0";
  const searchBaseUrl = "https://api.linximpulse.com/engage/search/v3";

  return {
    pages: {
      recommendations: {
        name: (name: string) =>
          `${recommendationsbaseUrl}/pages/recommendations?apiKey=${apiKey}&source=desktop&name=${name}&productFormat=complete`,
      },
    },
    autocompletes: {
      popularTerms:
        `${searchBaseUrl}/autocompletes/popular?apiKey=${apiKey}&productFormat=complete`,
      suggestions: {
        term: (term: string, countSuggestions: number, countProducts: number) =>
          `${searchBaseUrl}/autocompletes?apiKey=${apiKey}&productFormat=complete&prefix=${term}&resultsQueries=${countSuggestions}&resultsProducts=${countProducts}`,
      },
    },
  };
};
