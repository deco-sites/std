import type { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productListingPage.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productListingPage.ts";

/**
 * @title VTEX Catalog - Product Listing Page
 * @description Returns data ready for search pages like category,brand pages
 */
const loader = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductListingPage | null> => base(props, req, transform(ctx));

export default loader;
