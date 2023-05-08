import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { Suggestion } from "deco-sites/std/commerce/types.ts";

const payload = signal<Suggestion | null>(null);

const setSearch = debounce(async (search: string) => {
  try {
    payload.value = search !== ""
      ? await Runtime.invoke({
        key: "deco-sites/std/loaders/vtex/intelligentSearch/suggestions.ts",
        props: { query: search, count: 4 },
      })
      : null;
  } catch (error) {
    console.error("Something went wrong while fetching suggestions \n", error);
    return null;
  }
}, 250);

const state = {
  setSearch,
  suggestions: payload,
};

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export const useAutocomplete = () => state;
