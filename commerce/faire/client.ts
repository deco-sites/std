import { fetchAPI } from "../../utils/fetchAPI.ts";
import { FaireSearchResult } from "./types.ts";

export default {
  searchProducts: async (query: string) => {
    const headers = new Headers();
    headers.set("content-type", "application/json");
    // TODO: Create Account and use it
    const result = (await fetchAPI(
      "https://www.faire.com/api/v2/products/search/query-products-with-lean-tiles",
      {
        headers,
        method: "POST",
        body: JSON.stringify({
          "maker_values": [],
          "filter_keys": [],
          "range_filters": [],
          "previous_filter_keys": [],
          "initial_request_exposed_visual_filter_option_keys": [],
          query,
          "page_number": 0,
          "page_size": 60,
          "return_filter_sections": true,
          "container_name": "search_results_grid",
          "referrer": {
            "referrer_type": "NONE",
          },
          "allow_query_pruning": true,
          "allow_related_brands_search": true,
          "allow_semantically_similar_results": true,
          "do_query_spell_check": true,
          "return_related_explore_keyword": false,
          "filter_split_strategy": "PRODUCTS_ONLY",
          "brand_off_faire_search_method":
            "BRAND_OFF_FAIRE_QUERY_METHOD_UNKNOWN",
          "enable_brand_off_faire_query_response": true,
          "return_preorderable_products": true,
          "enable_preorderable_delivery_window_filter": true,
          "return_retrieval_and_ranking_debug_info": false,
          "product_search_method": "PRODUCT_SEARCH_METHOD_UNKNOWN",
        }),
      },
    ).catch(console.log)) as FaireSearchResult;

    return result;
  },
};
