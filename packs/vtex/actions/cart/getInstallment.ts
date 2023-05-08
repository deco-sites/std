import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { proxySetCookie } from "deco-sites/std/utils/cookies.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  paymentSystem: number;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm/-orderFormId-/installments
 */
const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => {
  const { configVTEX: config } = ctx;
  const { paymentSystem } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(config!).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .installments,
  );

  url.searchParams.set("paymentSystem", `${paymentSystem}`);

  const response = await fetchSafe(
    url,
    {
      headers: {
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
