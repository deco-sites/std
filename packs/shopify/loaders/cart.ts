import type { Cart } from "../types.ts";
import type { Context } from "../accounts/shopify.ts";
import { getCookies, getSetCookies, setCookie } from "std/http/mod.ts";
import { getShopifyClient } from "../client.ts";
import { gql } from "../utils/gql.ts";

const createCartMutation = gql`
  mutation createCart {
    payload: cartCreate {
      cart {
        id
      }
    }
  }
`;

const CartFragment = gql`
  fragment CartFragment on Cart {
    id
  }
`;

const cartQuery = gql`
  query cart($id: ID!) {
    cart(id: $id) {
      ...CartFragment
    }
  }
`;

type CreateCartPayload = {
  payload: {
    cart: {
      id: string;
    };
  };
};

type CartQueryPayload = {
  payload: {
    cart: Cart;
  };
};

const SHOPIFY_COOKIE_NAME = "shopify_cart_id";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configShopify: config } = ctx;
  try {
    const client = getShopifyClient(config);
    const r = await client<CreateCartPayload>(createCartMutation);

    const reqCookies = getCookies(req.headers);
    const cartIdCookie = reqCookies[SHOPIFY_COOKIE_NAME];
    if (cartIdCookie) {
      const queryResponse = await client<CartQueryPayload>(
        cartQuery,
        [CartFragment],
        {
          id: cartIdCookie,
        },
      );

      if (!queryResponse?.payload.cart) {
        throw new Error("unable to create a cart");
      }

      return queryResponse?.payload.cart;
    }

    if (!r?.payload.cart.id) {
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

    return { id: cart.id };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default loader;
