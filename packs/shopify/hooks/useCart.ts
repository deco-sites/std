// import { Runtime } from "deco-sites/std/runtime.ts";
// import { Cart } from "../types.ts";
import { state as storeState } from "./context.ts";

const { cart, loading } = storeState;

// const wrap =
//   <T>(action: (p: T, init?: RequestInit | undefined) => Promise<Cart>) =>
//   (p: T) =>
//     storeState.enqueue(async (signal) => ({
//       cart: await action(p, { signal }),
//     }));

const state = {
  cart,
  loading,
};

export const useCart = () => state;
