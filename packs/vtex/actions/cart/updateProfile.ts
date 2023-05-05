import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { proxySetCookie } from "deco-sites/std/utils/cookies.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  ignoreProfileData: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#patch-/api/checkout/pub/orderForm/-orderFormId-/profile
 */
const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => {
  const { configVTEX: config } = ctx;
  const { ignoreProfileData } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(config!).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .profile,
  );

  const response = await fetchSafe(
    url,
    {
      method: "PATCH",
      body: JSON.stringify({ ignoreProfileData }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
