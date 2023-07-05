import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { Suggestion } from "deco-sites/std/commerce/types.ts";

const payload = signal<Suggestion | null>(null);
const loading = signal<boolean>(false);

const suggestions = Runtime.create(
  "deco-sites/std/loaders/linxImpulse/autocompletes/suggestions.ts",
);

const setSearch = debounce(async (search: string) => {
  try {
    payload.value = await suggestions({ query: search, count: 4 });
  } catch (error) {
    console.error("Something went wrong while fetching suggestions \n", error);
  } finally {
    loading.value = false;
  }
}, 250);

const state = {
  setSearch: (s: string) => {
    loading.value = true;
    setSearch(s);
  },
  loading,
  suggestions: payload,
};

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export const useAutocomplete = () => state;
