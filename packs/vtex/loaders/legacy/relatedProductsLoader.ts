import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/legacy/relatedProductsLoader.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/loaders/legacy/relatedProductsLoader.ts";

/**
 * @title VTEX Related Products - Catalog
 * @description Works on routes of type /:slug/p
 */
function loader(
  props: Props,
  req: Request,
  ctx: Context,
) {
  return base(props, req, transform(ctx));
}

export default loader;
