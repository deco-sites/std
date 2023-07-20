import { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

export const paths = ({ apiKey }: Account) => {
  const searchBaseUrl = "https://api.linximpulse.com/engage/search/v3";

  return {
    search: {
      params: (params: URLSearchParams) =>
        `${searchBaseUrl}/search?apiKey=${apiKey}&productFormat=complete&${params}`,
    },
  };
};
