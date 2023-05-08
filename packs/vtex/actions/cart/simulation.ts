import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { SimulationOrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Item {
  id: number;
  quantity: number;
  seller: string;
}

export interface Props {
  items: Item[];
  postalCode: string;
  country: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: Context,
): Promise<SimulationOrderForm> => {
  const { configVTEX: config } = ctx;
  const {
    items,
    postalCode,
    country,
  } = props;
  const response = await fetchSafe(
    paths(config!).api.checkout.pub.orderForms.simulation,
    {
      method: "POST",
      body: JSON.stringify({ items, postalCode, country }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    },
  );

  return response.json();
};

export default action;
