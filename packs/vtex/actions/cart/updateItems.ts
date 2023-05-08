import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { proxySetCookie } from "deco-sites/std/utils/cookies.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Item {
  quantity: number;
  index: number;
}

export interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update
 */
const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => {
  const { configVTEX: config } = ctx;
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(config!).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .items.update,
  );

  if (allowedOutdatedData) {
    for (const it of allowedOutdatedData) {
      url.searchParams.append("allowedOutdatedData", it);
    }
  }

  const response = await fetchSafe(
    url,
    {
      method: "POST",
      body: JSON.stringify({ orderItems }),
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
