import { LiveState, LoaderFunction } from "$live/types.ts";
import { Suggestion } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
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
> = withISFallback(async (_, ctx, { count }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const suggestion: Suggestion = {};

  try {
    const { searches } = await vtex.search.topSearches(
      { locale: ctx.state.global.configVTEX.defaultLocale },
    );

    suggestion.searches = count ? searches.slice(0, count) : searches;
  } catch (e) {
    console.error(`Error fetching vtex top searches: \n ${e}`);

    return { data: { searches: [], products: [] } };
  }

  return {
    data: suggestion,
  };
});

export default topSearches;
