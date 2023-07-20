import { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

export const paths = ({ apiKey }: Account) => {
  const recommendationsbaseUrl = "https://recs.chaordicsystems.com/v0";
  const searchBaseUrl = "https://api.linximpulse.com/engage/search/v3";

  return {
    product: {
      getProductBySlug: {
        term: (term: string) =>
          `${searchBaseUrl}/search?apiKey=${apiKey}&productFormat=complete&terms=${term}&hide=quickFilters&hide=suggestions&hide=filters`,
      },
      similarItems: {
        productId: (productId: string) =>
          `${recommendationsbaseUrl}/pages/recommendations?apiKey=${apiKey}&name=product&source=desktop&productId=${productId}&productFormat=complete`,
      },
    },
  };
};
