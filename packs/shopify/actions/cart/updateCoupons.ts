import { getCookies } from "std/http/mod.ts";
import type { Cart } from "../../types.ts";
import type { Context } from "../../accounts/shopify.ts";
import { getShopifyClient } from "../../client.ts";
import { SHOPIFY_COOKIE_NAME } from "../../constants.ts";
import { CART_QUERY } from "../../utils/cartQuery.ts";

const addCouponQuery =
  `mutation addCoupon($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart ${CART_QUERY}
    userErrors {
        field
        message
    }
  }
}`;

export interface addCouponQueryProps {
  cartDiscountCodesUpdate: Cart;
}

type AddCouponProps = {
  discountCodes: string[];
};

const action = async (
  props: AddCouponProps,
  req: Request,
  ctx: Context,
): Promise<Cart> => {
  const { configShopify: config } = ctx;
  const client = getShopifyClient(config);

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];
  const response: addCouponQueryProps | undefined = await client(
    addCouponQuery,
    [],
    {
      cartId: cartId,
      discountCodes: [...props.discountCodes],
    },
  );
  const cartResponse: Cart | undefined = response?.cartDiscountCodesUpdate;

  return cartResponse || { cart: { id: cartId } };
};

export default action;
