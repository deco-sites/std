import { signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type {
  Product,
  Search,
  Suggestion,
} from "deco-sites/std/commerce/types.ts";

const payload = signal<Suggestion | null>(null);
const loading = signal<boolean>(false);

interface SuggestionsResponse {
  searches: Search[];
}

const suggestions = Runtime.create(
  "deco-sites/std/loaders/linxImpulse/autocompletes/suggestions.ts",
);

const products = Runtime.create(
  "deco-sites/std/loaders/linxImpulse/autocompletes/products.ts",
);

const setSearch = debounce(async (search: string) => {
  try {
    const { searches } = await suggestions({ count: 4 }) as SuggestionsResponse;
    const productsData = await products({ query: search }) as Product[];

    payload.value = {
      searches,
      products: productsData,
    };
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

export const useAutocomplete = () => state;
