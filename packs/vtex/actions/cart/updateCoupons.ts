import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/actions/cart/updateCoupons.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons
 */
const action = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => base(props, req, transform(ctx));

export default action;
