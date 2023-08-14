import { getCookies } from "std/http/mod.ts";
import type { Cart } from "../../types.ts";
import type { Context } from "../../accounts/shopify.ts";
import { getShopifyClient } from "../../client.ts";
import { SHOPIFY_COOKIE_NAME } from "../../constants.ts";
import { CART_QUERY } from "../../utils/cartQuery.ts";

const addToCartQuery = `mutation add($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart ${CART_QUERY}
  }
}`;

export interface addToCartQueryProps {
  cartLinesAdd: Cart;
}

type UpdateLineProps = {
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
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
  const response: addToCartQueryProps | undefined = await client(
    addToCartQuery,
    [],
    {
      cartId: cartId,
      lines: [props.lines],
    },
  );

  const cartResponse: Cart | undefined = response?.cartLinesAdd;

  return cartResponse || { cart: { id: cartId } };
};

export default action;
