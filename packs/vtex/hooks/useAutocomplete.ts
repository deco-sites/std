import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { Suggestion } from "deco-sites/std/commerce/types.ts";

const payload = signal<Suggestion | null>(null);
const loading = signal<boolean>(false);

const suggestions = Runtime.create(
  "deco-sites/std/loaders/vtex/intelligentSearch/suggestions.ts",
);

const setSearch = debounce(async (search: string, count: number) => {
  try {
    payload.value = await suggestions({ query: search, count });
  } catch (error) {
    console.error("Something went wrong while fetching suggestions \n", error);
  } finally {
    loading.value = false;
  }
}, 250);

const state = {
  setSearch: (query: string, count = 4) => {
    loading.value = true;
    setSearch(query, count);
  },
  loading,
  suggestions: payload,
};

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export const useAutocomplete = () => state;
