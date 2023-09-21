import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/intelligentSearch/productDetailsPage.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/intelligentSearch/productDetailsPage.ts";

/**
 * @title VTEX Intelligent Search - Product Details Page
 * @description Works on routes of type /:slug/p
 */
const loader = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> => base(props, req, transform(ctx));

export default loader;
