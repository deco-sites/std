// Intelligent Search analytics integration
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { fetchSafe } from "deco-sites/std/utils/fetch.ts";
import { getOrSetISCookie } from "../../utils/intelligentSearch.ts";
import { paths } from "../../utils/paths.ts";

export type Props =
  | {
    type: "session.ping";
  }
  | {
    type: "search.click";
    position: number;
    text: string;
    productId: string;
    url: string;
  }
  | {
    type: "search.query";
    text: string;
    misspelled: boolean;
    match: number;
    operator: string;
    locale: string;
  };

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<null> => {
  const { configVTEX: config } = ctx;

  const { anonymous, session } = getOrSetISCookie(req, ctx.response.headers);

  console.log({ ...props, agent: "deco-sites/std", anonymous, session });
  await fetchSafe(
    paths(config!)["event-api"].v1.account.event,
    {
      method: "POST",
      body: JSON.stringify({
        ...props,
        agent: "deco-sites/std",
        anonymous,
        session,
      }),
      headers: {
        "content-type": "application/json",
      },
    },
  ).then(console.log).then(console.log);

  return null;
};

export default action;
