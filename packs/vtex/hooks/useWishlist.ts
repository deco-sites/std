import { state as storeState } from "./context.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";

const { wishlist, loading } = storeState;

const wrap = <T>(
  action: (
    props?: T,
    init?: RequestInit | undefined,
  ) => Promise<WishlistItem[] | null>,
) =>
(props?: T) =>
  storeState.enqueue(async (signal) => ({
    wishlist: await action(props, { signal }),
  }));

const addItem = wrap(
  Runtime.create("deco-sites/std/actions/vtex/wishlist/addItem.ts"),
);
const removeItem = wrap(
  Runtime.create("deco-sites/std/actions/vtex/wishlist/removeItem.ts"),
);

const getItem = (item: Partial<WishlistItem>) =>
  wishlist.value?.find((id) => id.productId == item.productId);

const state = {
  wishlist,
  loading,
  addItem,
  getItem,
  removeItem,
};

export const useWishlist = () => state;
