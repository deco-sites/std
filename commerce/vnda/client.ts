import { ConfigVNDA } from "./types.ts";
import ProductGet from "./requests/product/get.ts";
import ProductSearch from "./requests/product/search.ts";

export const createClient = (params: ConfigVNDA) => {
  return {
    product: {
      search: ProductSearch(params),
      get: ProductGet(params),
    },
  };
};
