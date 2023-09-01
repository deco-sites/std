import { HttpError } from "deco-sites/std/utils/HttpError.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import type { Context } from "../accounts/vnda.ts";
import type { Cart, OrderForm, RelatedItem } from "../types.ts";
import { paths } from "../utils/paths.ts";
import { DECO_USER_AGENT, USER_AGENT_HEADER } from "../constants.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configVNDA: config } = ctx;

  const api = paths(config!);

  const orderForm = await fetchAPI<OrderForm>(api["/carrinho"], {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      accept: "application/json",
      [USER_AGENT_HEADER]: DECO_USER_AGENT,
    },
  });

  const relatedItems = await fetchAPI<RelatedItem[]>(
    api["/carrinho/produtos-sugeridos/relacionados-carrinho"],
    {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        [USER_AGENT_HEADER]: DECO_USER_AGENT,
      },
    },
  ).catch((error) => {
    if (error instanceof HttpError && error.status === 404) {
      return [];
    }

    throw error;
  });

  return {
    orderForm,
    relatedItems,
  };
};

export default loader;
