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

  const getProductBySlug = (term: string) => {
    return fetchAPI(
      `${searchBaseUrl}/search?apiKey=${apiKey}&productFormat=complete&terms=${term}&hide=quickFilters&hide=suggestions&hide=filters`,
      { headers: requestHeaders },
    );
  };

  const similarItems = (productId: string) => {
    return fetchAPI(
      `${recommendationsbaseUrl}/pages/recommendations?apiKey=${apiKey}&name=product&source=desktop&productId=${productId}&productFormat=complete`,
      { headers: requestHeaders },
    );
  };

  return {
    pages: {
      recommendations,
    },
    autocompletes: {
      popularTerms,
    },
    product: {
      getProductBySlug,
      similarItems,
    },
  };
};
