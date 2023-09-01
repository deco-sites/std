import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import type { Context } from "../../accounts/vnda.ts";
import type { Cart, Shipping } from "../../types.ts";
import { paths } from "../../utils/paths.ts";
import { DECO_USER_AGENT, USER_AGENT_HEADER } from "../../constants.ts";

export interface Props {
  zip: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configVNDA: config } = ctx;
  const { zip } = props;
  const api = paths(config!);

  const form = new FormData();
  form.set("zip", zip);

  const shipping = await fetchAPI<Shipping>(api["/cep"], {
    method: "POST",
    body: form,
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      [USER_AGENT_HEADER]: DECO_USER_AGENT,
    },
  });

  const updated = await ctx.invoke("deco-sites/std/loaders/vnda/cart.ts");

  return { shipping, ...updated };
};

export default action;
