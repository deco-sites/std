import { signal } from "@preact/signals";
import { Runtime } from "deco-sites/std/runtime.ts";
import { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";

const payload = signal<WishlistItem[] | null>(null);
const loading = signal<boolean>(true);

const wrap = <T>(fn: (props?: T) => Promise<WishlistItem[] | null>) =>
async (
  props?: T,
) => {
  try {
    loading.value = true;
    payload.value = await fn(props);
  } finally {
    loading.value = false;
  }
};

const addItem = wrap(
  Runtime.create("deco-sites/std/actions/vtex/wishlist/addItem.ts"),
);
const removeItem = wrap(
  Runtime.create("deco-sites/std/actions/vtex/wishlist/removeItem.ts"),
);
const refresh = wrap(
  Runtime.create("deco-sites/std/loaders/vtex/wishlist.ts"),
);

// Start fetching the cart on client-side only
if (typeof document !== "undefined") {
  refresh();
}

const getItem = (item: Partial<WishlistItem>) =>
  payload.value &&
  payload.value.find((id) => id.productId == item.productId);

const state = {
  wishlist: payload,
  loading,
  addItem,
  getItem,
  removeItem,
};

export const useWishlist = () => state;
