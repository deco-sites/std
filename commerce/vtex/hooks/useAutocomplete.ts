import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";

import { Suggestion } from "../../../commerce/types.ts";
import { Runtime } from "../../sdk/runtime.ts";

const suggestions = signal<Suggestion | null>(null);

const fetchSuggestions = async (query: string) => {
  try {
    return await Runtime.invoke({
      key: "deco-sites/std/functions/vtexSuggestions.ts",
      props: { count: 4, query },
    });
  } catch (error) {
    console.error("Something went wrong with the suggestion \n", error);
    return null;
  }
};

const setSearch = debounce(async (search: string) => {
  if (search === "") {
    suggestions.value = null;
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
