import { fetchAPI } from "../../utils/fetchAPI.ts";
import { FaireSearchResult } from "./types.ts";

export default {
  searchProducts: async (query: string) => {
    // TODO: Create Account and use it
    const result = (await fetchAPI(
      `https://lucisteste.mesa.land?query=${query}`,
    ).catch(console.log)) as FaireSearchResult;

    return result;
  },
};
