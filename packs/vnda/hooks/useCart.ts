import { Runtime } from "deco-sites/std/runtime.ts";
import { Cart, Item } from "deco-sites/std/packs/vnda/types.ts";
import { state as storeState } from "./context.ts";
import { AnalyticsItem } from "deco-sites/std/commerce/types.ts";

const { cart, loading } = storeState;

export const mapCartItemToAnalayticsItem = (
  item: Pick<
    Item,
    | "id"
    | "product_name"
    | "price"
    | "variant_price"
    | "variant_name"
    | "variant_sku"
  >,
  { quantity, index }: { quantity: number; index: number },
): AnalyticsItem => {
  return {
    item_id: `${item.id}_${item.variant_sku}`,
    item_name: item.product_name,
    discount: item.price - item.variant_price,
    item_variant: item.variant_name.slice(item.product_name.length).trim(),
    // TODO: check
    price: item.price,
    // TODO
    // item_brand: "todo",
    index,
    quantity,
  };
};

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
