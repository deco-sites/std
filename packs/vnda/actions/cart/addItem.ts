import { HttpError } from "deco-sites/std/utils/HttpError.ts";
import { fetchAPI, fetchSafe } from "deco-sites/std/utils/fetch.server.ts";
import { getSetCookies, setCookie } from "std/http/mod.ts";
import type { Context } from "../../accounts/vnda.ts";
import { DECO_USER_AGENT, USER_AGENT_HEADER } from "../../constants.ts";
import type { Cart, RelatedItem } from "../../types.ts";
import { paths } from "../../utils/paths.ts";

export interface Props {
  itemId: string;
  quantity: number;
  attributes: Record<string, string>;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  try {
    const { configVNDA: config } = ctx;
    const { itemId, quantity, attributes } = props;
    const reqCookies = req.headers.get("cookie") ?? "";
    const api = paths(config!);

    const form = new FormData();
    form.set("sku", itemId);
    form.set("quantity", `${quantity}`);

    Object.entries(attributes).forEach(([name, value]) =>
      form.set(`attribute-${name}`, value)
    );

    const response = await fetchSafe(api["/carrinho/adicionar"], {
      method: "POST",
      body: form,
      headers: {
        cookie: reqCookies,
        accept: "application/json",
        [USER_AGENT_HEADER]: DECO_USER_AGENT,
      },
    });

    // in case the cart was created, set the cookie to the browser
    const cookies = getSetCookies(response.headers);
    for (const cookie of cookies) {
      setCookie(ctx.response.headers, {
        ...cookie,
        domain: new URL(req.url).hostname,
      });
    }

    const allCookies = [
      reqCookies,
      ...cookies.map(({ name, value }) => `${name}=${value}`),
    ].join("; ");

    const relatedItems = await fetchAPI<RelatedItem[]>(
      api["/carrinho/produtos-sugeridos/relacionados-carrinho"],
      {
        headers: {
          cookie: allCookies,
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
      orderForm: await response.json(),
      relatedItems,
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
