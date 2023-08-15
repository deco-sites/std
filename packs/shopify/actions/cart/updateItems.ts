import { getCookies } from "std/http/mod.ts";
import type { Cart } from "../../types.ts";
import type { Context } from "../../accounts/shopify.ts";
import { getShopifyClient } from "../../client.ts";
import { SHOPIFY_COOKIE_NAME } from "../../constants.ts";
import { CART_QUERY } from "../../utils/cartQuery.ts";

const updateCartQuery =
  `mutation update($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart ${CART_QUERY}
  }
}`;

export interface updateCartQueryProps {
  cartLinesUpdate: Cart;
}

type UpdateLineProps = {
  lines: {
    id: string;
    quantity?: number;
  };
};

const action = async (
  props: UpdateLineProps,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configShopify: config } = ctx;
  const client = getShopifyClient(config);

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];
  const response: updateCartQueryProps | undefined = await client(
    updateCartQuery,
    [],
    {
      cartId: cartId,
      lines: [props.lines],
    },
  );
  const cartResponse: Cart | undefined = response?.cartLinesUpdate;

  return cartResponse || { cart: { id: cartId } };
};

export default action;
