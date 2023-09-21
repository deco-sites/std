import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/actions/wishlist/addItem.ts";

const action = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<WishlistItem[]> => base(props, req, transform(ctx));

export default action;
