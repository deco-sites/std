import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { Context } from "../../accounts/vnda.ts";
import type { Cart, Coupon } from "../../types.ts";
import { paths } from "../../utils/paths.ts";

export interface Props {
  code: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configVNDA: config } = ctx;
  const { code } = props;
  const api = paths(config!);

  const form = new FormData();
  form.set("code", code);

  const coupon = await fetchAPI<Coupon>(api["/cupom/ajax"], {
    method: "POST",
    body: form,
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  const updated = await ctx.invoke("deco-sites/std/loaders/vnda/cart.ts");

  return { coupon, ...updated };
};

export default action;
