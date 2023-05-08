import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { DEFAULT_EXPECTED_SECTIONS } from "./updateItemAttachment.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { proxySetCookie } from "deco-sites/std/utils/cookies.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  attachment: string;
  expectedOrderFormSections?: string[];
  // deno-lint-ignore no-explicit-any
  body: any;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => {
  const { configVTEX: config } = ctx;
  const {
    attachment,
    body,
    expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS,
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(config!).api.checkout.pub.orderForm.orderFormId(orderFormId)
      .attachments.attachment(attachment),
  );

  const response = await fetchSafe(
    url,
    {
      method: "POST",
      body: JSON.stringify({ expectedOrderFormSections, ...body }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
