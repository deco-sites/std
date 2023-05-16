import { paths } from "../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  email: string;
  skuId: string;
  name?: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: Context,
): Promise<OrderForm> => {
  const { configVTEX: config } = ctx;
  const url = new URL(`${paths(config!)["no-cache"]["AviseMe.aspx"]}`);
  const form = new FormData();
  const { email, skuId, name = "" } = props;

  form.append("notifymeClientName", name);
  form.append("notifymeClientEmail", email);
  form.append("notifymeIdSku", skuId);

  const response = await fetchSafe(url, {
    method: "POST",
    body: form,
  });

  return response.json();
};

export default action;
