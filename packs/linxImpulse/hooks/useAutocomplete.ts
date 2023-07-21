import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { Suggestion } from "deco-sites/std/commerce/types.ts";

const payload = signal<Suggestion | null>(null);
const loading = signal<boolean>(false);

const suggestions = Runtime.create(
  "deco-sites/std/loaders/linxImpulse/autocompletes/suggestions.ts",
);

const setSearch = debounce(
  async (
    search: string,
    countSuggestions: number,
    countProducts: number,
  ) => {
    try {
      const { products, searches } = await suggestions({
        query: search,
        countSuggestions,
        countProducts,
      }) as Suggestion;

      payload.value = {
        searches,
        products,
      };
    } catch (error) {
      console.error(
        "Something went wrong while fetching suggestions \n",
        error,
      );
    } finally {
      loading.value = false;
    }
  },
  250,
);

const state = {
  setSearch: (
    term: string,
    countSuggestions: number,
    countProducts: number,
  ) => {
    loading.value = true;
    setSearch(term, countSuggestions, countProducts);
  },
  loading,
  suggestions: payload,
};

export const useAutocomplete = () => state;
