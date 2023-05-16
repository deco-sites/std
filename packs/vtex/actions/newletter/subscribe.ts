import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  email: string;
  name?: string;
  page?: string;
  part?: string;
  campaing?: string;
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
  const url = new URL(`${paths(config!)["no-cache"]["Newsletter.aspx"]}`);
  const form = new FormData();
  const {
    email,
    name = "",
    part = "newsletter",
    page = "_",
    campaing = "newsletter:opt-in",
  } = props;

  form.append("newsletterClientName", name);
  form.append("newsletterClientEmail", email);
  form.append("newsInternalPage", page);
  form.append("newsInternalPart", part);
  form.append("newsInternalCampaign", campaing);

  const response = await fetchSafe(url, {
    method: "POST",
    body: form,
  });

  return response.json();
};

export default action;
