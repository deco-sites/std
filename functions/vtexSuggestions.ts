import loader from "deco-sites/std/packs/vtex/loaders/intelligentSearch/suggestions.ts";
import { LoaderFunction } from "$live/types.ts";
import { Suggestion } from "../commerce/types.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;
}

/**
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  Suggestion | null,
  StateVTEX
> = withISFallback(async (req, ctx, props) => {
  const data = await loader(
    props,
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
});

export default loaderV0;
