import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { Context } from "../../accounts/vnda.ts";
import type { Cart, OrderForm } from "../../types.ts";
import { paths } from "../../utils/paths.ts";

export interface Props {
  itemId: number;
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
      },
    });
  } else {
    await fetchAPI<OrderForm>(api["/carrinho/remover"], {
      method: "POST",
      body: JSON.stringify({ item_id }),
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });
  }

  return ctx.invoke("deco-sites/std/loaders/vnda/cart.ts");
};

export default action;
