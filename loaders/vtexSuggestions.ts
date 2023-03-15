import { LiveState } from "$live/types.ts";
import { HandlerContext } from "https://deno.land/x/fresh@1.1.3/server.ts";
import { LiveConfig } from "$live/blocks/handler.ts";
import { Suggestion } from "deco-sites/std/commerce/types.ts";
import {
  ConfigVTEX,
  createClient,
} from "deco-sites/std/commerce/vtex/client.ts";

export interface Props {
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;
}

async function topSearches(
  _req: Request,
  ctx: HandlerContext<
    unknown,
    LiveConfig<Props, LiveState<{ configVTEX: ConfigVTEX }>>
  >
): Promise<Suggestion> {
  const vtex = createClient(ctx.state.global.configVTEX);
  const topSearches = await vtex.search.topSearches({
    locale: ctx.state.global.configVTEX.defaultLocale,
  });

  const count = ctx.state.$live.count;
  return {
    ...topSearches,
    searches:
      topSearches?.searches && count
        ? topSearches.searches.slice(0, count)
        : topSearches?.searches,
  };
}

export default topSearches;
