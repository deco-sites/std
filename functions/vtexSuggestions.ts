import { LiveState, LoaderFunction } from "$live/types.ts";
import { Suggestion } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { toProduct } from "../commerce/vtex/transform.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;
}

const topSearches: LoaderFunction<
  Props,
  Suggestion | null,
  LiveState<{ configVTEX: ConfigVTEX }>
> = withISFallback(async (req, ctx, { count, query }) => {
  const url = new URL(req.url);
  const { global: { configVTEX, configVTEX: { defaultLocale } } } = ctx.state;
  const vtex = createClient(configVTEX);

  const suggestions = query
    ? vtex.search.suggestedTerms
    : vtex.search.topSearches;

  const [{ searches }, { products }] = await Promise.all([
    suggestions({ query, locale: defaultLocale }),
    vtex.search.products({
      query,
      page: 1,
      count: count ?? 4,
      locale: defaultLocale,
    }),
  ]);

  if (!searches || !products) return { data: null };

  return {
    data: {
      searches,
      products: products.map((p) =>
        toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() })
      ),
    },
  };
});

export default topSearches;
