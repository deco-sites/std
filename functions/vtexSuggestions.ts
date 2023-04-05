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
  const { global: { configVTEX, configVTEX: { defaultLocale } } } = ctx.state;
  const vtex = createClient(configVTEX);

  const { searches } = await vtex.search.topSearches(
    { locale: defaultLocale },
  ).catch(() => ({ searches: [] }));

  return {
    data: {
      searches: count ? searches.slice(0, count) : searches,
    },
  };
});

export default topSearches;
