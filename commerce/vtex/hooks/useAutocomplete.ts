import { ReadonlySignal, signal } from "@preact/signals";
import { debounce } from "std/async/debounce.ts";

import { ClientConfigVTEX } from "../../../functions/vtexConfig.ts";
import { Suggestion } from "../../../commerce/types.ts";
import { createClient } from "../../../commerce/vtex/client.ts";
import { toProduct } from "../../../commerce/vtex/transform.ts";

async function vtexSearchSuggestion(
  client: ReturnType<typeof createClient>,
  query: string,
) {
  try {
    const [{ searches }, { products }] = await Promise.all([
      client.search.suggestedTerms({ query }),
      client.search.products({ query, page: 1, count: 4 }),
    ]);

    if (!searches || !products) return;

    const url = new URL(window.location.href);
    return {
      searches,
      products: products.map((p) =>
        toProduct(p, p.items[0], 0, { url, priceCurrency: client.currency() })
      ),
    };
  } catch (_) {
    console.error("Something went wrong with the suggestion \n", _);
    return;
  }
}

interface UseVTEXAutocompleteProps {
  configVTEX?: ClientConfigVTEX;
}

interface AutocompleteHook {
  setSearch: (search: string) => void;
  suggestions: ReadonlySignal<Suggestion | undefined>;
}

let vtexClient: ReturnType<typeof createClient>;
const suggestions = signal<Suggestion | undefined>(undefined);
const setSuggestions = (_suggestions: Suggestion | undefined) => {
  suggestions.value = _suggestions;
};

const setSearch = debounce(async (search: string) => {
  if (!vtexClient) return;

  if (search === "") {
    setSuggestions(undefined);
    return;
  }

  const _suggestion = await vtexSearchSuggestion(
    vtexClient,
    search,
  );

  setSuggestions(_suggestion);
}, 250);

/**
 * This hook only works if the vtex intelligent search app is installed at VTEX Account.
 */
export default function useAutocomplete(
  { configVTEX }: UseVTEXAutocompleteProps,
): AutocompleteHook {
  if (configVTEX && !vtexClient) {
    // TODO: create a singleton
    vtexClient = createClient({
      ...configVTEX,
      baseUrl: window.location.origin,
    });
  }

  return {
    setSearch,
    suggestions,
  };
}
