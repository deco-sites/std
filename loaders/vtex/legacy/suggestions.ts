import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { Props } from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/legacy/suggestions.ts";
import _suggestions from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/legacy/suggestions.ts";

const loader = (
  props: Props,
  req: Request,
  ctx: Context,
): ReturnType<typeof _suggestions> => {
  // @ts-expect-error: Necessary due to new signature in Apps
  return _suggestions(props, req, ctx.configVTEX);
};

export default loader;
