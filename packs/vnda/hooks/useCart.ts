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
  addItem: wrap(Runtime.create("deco-sites/std/actions/vnda/cart/addItem.ts")),
  updateItem: wrap(Runtime.create(
    "deco-sites/std/actions/vnda/cart/updateItem.ts",
  )),
  setShippingAddress: wrap(Runtime.create(
    "deco-sites/std/actions/vnda/cart/setShippingAddress.ts",
  )),
  updateCoupon: wrap(Runtime.create(
    "deco-sites/std/actions/vnda/cart/updateCoupon.ts",
  )),
};

export const useCart = () => state;
