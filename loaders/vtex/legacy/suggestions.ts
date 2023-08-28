import _suggestions from "https://denopkg.com/deco-cx/apps@0.1.1/vtex/loaders/legacy/suggestions.ts";
import type { Props } from "https://denopkg.com/deco-cx/apps@0.1.1/vtex/loaders/legacy/suggestions.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

const loader = (
  props: Props,
  req: Request,
  ctx: Context,
): ReturnType<typeof _suggestions> => {
  // @ts-expect-error: Necessary due to new signature in Apps
  return _suggestions(props, req, ctx.configVTEX);
};

export default loader;
