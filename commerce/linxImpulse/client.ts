import { Account } from "$live/blocks/account.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

const requestHeaders = {
  origin: `https://www.ibyte.com.br`,
  referer: `https://www.ibyte.com.br/`,
};

export interface ConfigLinxImpulse extends Account {
  baseUrl: string;
}

export type ClientLinxImpulse = ReturnType<typeof createClient>;

export const createClient = ({ baseUrl }: ConfigLinxImpulse) => {
  const recommendations = (name: string) => {
    return fetchAPI(
      `${baseUrl}/pages/recommendations?apiKey=ibyte&source=desktop&name=${name}&productFormat=complete`,
      { headers: requestHeaders },
    );
  };

  return {
    pages: {
      recommendations,
    },
  };
};
