import { getCookies, getSetCookies, setCookie } from "std/http/mod.ts";

import type { Cart } from "../types.ts";
import type { Context } from "../accounts/shopify.ts";
import { getShopifyClient } from "../client.ts";
import { gql } from "../utils/gql.ts";
import { SHOPIFY_COOKIE_NAME } from "../constants.ts";

import { CART_QUERY } from "../utils/cartQuery.ts";

const createCartMutation = gql`
  mutation createCart {
    payload: cartCreate {
      cart {
        id
      }
    }
  }
`;

const cartQuery = `query($id: ID!) { cart(id: $id) ${CART_QUERY} }`;

type CreateCartPayload = {
  payload: {
    cart: {
      id: string;
    };
  };
};

const loader = async (
  _props: unknown,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configShopify: config } = ctx;
  const client = getShopifyClient(config);

  try {
    const r = await client<CreateCartPayload>(createCartMutation);

    const reqCookies = getCookies(req.headers);
    const cartIdCookie = reqCookies[SHOPIFY_COOKIE_NAME];
    if (cartIdCookie) {
      const queryResponse = await client<Cart>(
        cartQuery,
        [],
        {
          id: cartIdCookie,
        },
      );
      if (!queryResponse?.cart?.id) {
        throw new Error("unable to create a cart");
      }
      return queryResponse;
    }

    if (!r?.payload?.cart.id) {
      throw new Error("unable to create a cart");
    }
    const { cart } = r.payload;

    const cookies = getSetCookies(ctx.response.headers);
    cookies.push({ name: SHOPIFY_COOKIE_NAME, value: cart.id });

    for (const cookie of cookies) {
      setCookie(ctx.response.headers, {
        ...cookie,
        domain: new URL(req.url).hostname,
      });
    }

    return { cart: { id: cart.id } };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default loader;
