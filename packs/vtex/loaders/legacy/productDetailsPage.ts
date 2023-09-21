import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productDetailsPage.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productDetailsPage.ts";

/**
 * @title VTEX Catalog - Product Details Page
 * @description For routes of type /:slug/p
 */
function loader(
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> {
  return base(props, req, transform(ctx));
}

export default loader;
