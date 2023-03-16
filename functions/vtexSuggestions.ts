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
  Suggestion,
  LiveState<{ configVTEX: ConfigVTEX }>
> = async (_, ctx, { count }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const topSearches = await vtex.search.topSearches(
    { locale: ctx.state.global.configVTEX.defaultLocale },
  );

  return {
    data: {
      ...topSearches,
      searches: topSearches?.searches && count
        ? topSearches.searches.slice(0, count)
        : topSearches?.searches,
    },
  };
};

export default withISFallback(topSearches);
