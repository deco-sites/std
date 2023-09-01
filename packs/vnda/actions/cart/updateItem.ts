import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import type { Context } from "../../accounts/vnda.ts";
import type { Cart, OrderForm } from "../../types.ts";
import { paths } from "../../utils/paths.ts";
import { DECO_USER_AGENT, USER_AGENT_HEADER } from "../../constants.ts";

export interface Props {
  itemId: number | string;
  quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configVNDA: config } = ctx;
  const { itemId: item_id, quantity } = props;
  const api = paths(config!);

  if (quantity > 0) {
    await fetchAPI<OrderForm>(api["/carrinho/quantidade/atualizar"], {
      method: "POST",
      body: JSON.stringify({ item_id, quantity }),
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        [USER_AGENT_HEADER]: DECO_USER_AGENT,
      },
    });
  } else {
    await fetchAPI<OrderForm>(api["/carrinho/remover"], {
      method: "POST",
      body: JSON.stringify({ item_id }),
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        [USER_AGENT_HEADER]: DECO_USER_AGENT,
      },
    });
  }

  return ctx.invoke("deco-sites/std/loaders/vnda/cart.ts");
};

export default action;
