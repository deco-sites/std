import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";

import { Suggestion } from "../../../commerce/types.ts";
import { toProduct } from "../../../commerce/vtex/transform.ts";
import { getClient } from "./useClient.ts";

const suggestions = signal<Suggestion | undefined>(undefined);

const fetchSuggestions = async (query: string) => {
  const client = getClient();
  const url = new URL(window.location.href);

  try {
    const [{ searches }, { products }] = await Promise.all([
      client.search.suggestedTerms({ query }),
      client.search.products({ query, page: 1, count: 4 }),
    ]);

    if (!searches || !products) return;

    return {
      searches,
      products: products.map((p) =>
        toProduct(p, p.items[0], 0, { url, priceCurrency: client.currency() })
      ),
    };
  } catch (error) {
    console.error("Something went wrong with the suggestion \n", error);
    return;
  }
};

const setSearch = debounce(async (search: string) => {
  if (search === "") {
    suggestions.value = undefined;
    return;
  }

  const _suggestion = await fetchSuggestions(
    search,
  );

  suggestions.value = _suggestion;
}, 250);

const state = {
  setSearch,
  suggestions,
};

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export const useAutocomplete = () => state;
