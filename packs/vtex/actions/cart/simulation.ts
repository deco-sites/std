import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { SimulationOrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base, {
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/actions/cart/simulation.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation
 */
const action = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<SimulationOrderForm> => base(props, req, transform(ctx));

export default action;
