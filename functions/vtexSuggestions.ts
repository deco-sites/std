import { LiveState, LoaderFunction } from "$live/types.ts";
import { Suggestion } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";

const topSearches: LoaderFunction<
  null,
  Suggestion,
  LiveState<{ configVTEX: ConfigVTEX }>
> = async (_, ctx) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const topSearches = await vtex.search.topSearches(
    { locale: ctx.state.global.configVTEX.defaultLocale },
  );

  return { data: topSearches };
};

export default topSearches;
