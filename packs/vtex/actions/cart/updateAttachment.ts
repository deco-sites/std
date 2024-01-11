import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/actions/cart/updateAttachment.ts";

const action = (
  props: Props,
  req: Request,
  ctx: Context,
  // @ts-ignore this should work.
): Promise<OrderForm> => base(props, req, transform(ctx));

export default action;
