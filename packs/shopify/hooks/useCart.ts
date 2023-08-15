import { Runtime } from "deco-sites/std/runtime.ts";
import { Cart } from "../types.ts";
import { state as storeState } from "./context.ts";

const { cart, loading } = storeState;

const wrap =
  <T>(action: (p: T, init?: RequestInit | undefined) => Promise<Cart>) =>
  (p: T) =>
    storeState.enqueue(async (signal) => ({
      cart: await action(p, { signal }),
    }));

const state = {
  cart,
  loading,
  addItems: wrap(
    Runtime.create("deco-sites/std/actions/shopify/cart/addItems.ts"),
  ),
  updateItems: wrap(
    Runtime.create("deco-sites/std/actions/shopify/cart/updateItems.ts"),
  ),
  addCouponsToCart: wrap(
    Runtime.create("deco-sites/std/actions/shopify/cart/updateCoupons.ts"),
  ),
};

export const useCart = () => state;
