import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/actions/cart/updateUser.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId-
 */
const action = (
  props: unknown,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => base(props, req, transform(ctx));

export default action;
