import { getCookies } from "std/http/mod.ts";

import type { Cart } from "../../types.ts";
import type { Context } from "../../accounts/shopify.ts";
import { gql } from "../../utils/gql.ts";
import { getShopifyClient } from "../../client.ts";

import { SHOPIFY_COOKIE_NAME } from "../../constants.ts";

const cartAddLineMutation = gql`
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    payload: cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
    }
  }
`;

type CartAddLineProps = {
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
  };
};

const action = async (
  props: CartAddLineProps,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configShopify: config } = ctx;
  const client = getShopifyClient(config);

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];

  const response = await client(cartAddLineMutation, [], {
    id: cartId,
    lines: props.lines,
  });

  console.log(response);

  const updated = await ctx.invoke("deco-sites/std/loaders/shopify/cart.ts");
  return { ...updated };
};

export default action;
