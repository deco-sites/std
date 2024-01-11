import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/intelligentSearch/suggestions.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/intelligentSearch/suggestions.ts";

/**
 * @title VTEX Intelligent Search - Search Suggestions
 */
const loaders = (
  props: Props,
  req: Request,
  ctx: Context,
) => base(props, req, transform(ctx));

export default loaders;
