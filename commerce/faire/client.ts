import { fetchAPI } from "../../utils/fetch.ts";
import { FaireSearchResult } from "./types.ts";

export default {
  searchProducts: async (query: string) => {
    const headers = new Headers();
    headers.set("content-type", "application/json");
    headers.set("Origin", "https://www.faire.com/");
    headers.set("user-agent", "deco.cx");

    // TODO: Create Account and use it
    const result = (await fetchAPI(
      `https://proxy-faire.deco-cx.workers.dev?query=${query}`,
    ).catch(console.log)) as FaireSearchResult;

    return result;
  },
};
