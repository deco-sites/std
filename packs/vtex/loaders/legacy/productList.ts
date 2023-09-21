import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productList.ts";
export type {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/legacy/productList.ts";

/**
 * @title VTEX Catalog - Search Products
 * @description Use it in Shelves and static Galleries.
 */
const loader = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => base(props, req, transform(ctx));

export default loader;
