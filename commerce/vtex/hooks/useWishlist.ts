import { computed, effect, signal } from "@preact/signals";

import { user } from "./useUser.ts";
import { getClient } from "./useClient.ts";
import { WishlistItem } from "../types.ts";

const wishlist = signal<WishlistItem[] | null>(null);
const loading = signal<boolean>(true);

const email = computed(() => user.value?.email);

const refreshWishlist = async () => {
  const client = getClient();

  if (typeof email.value !== "string") {
    wishlist.value = null;
    return null;
  }

  try {
    loading.value = true;
    const result = await client.wishlist.get({ email: email.value });
    wishlist.value = result.data.viewList.data;
  } finally {
    loading.value = false;
  }
};

const addItem = async (
  item: Partial<Omit<WishlistItem, "id">>,
) => {
  const client = getClient();

  if (typeof email.value !== "string") {
    return null;
  }

  try {
    loading.value = true;
    await client.wishlist.items.add({ email: email.value, item });
    await refreshWishlist();
  } finally {
    loading.value = false;
  }
};

const removeItem = async (id: string) => {
  const client = getClient();

  if (typeof email.value !== "string") {
    return null;
  }

  try {
    loading.value = true;
    await client.wishlist.items.remove({ email: email.value, id });
    await refreshWishlist();
  } finally {
    loading.value = false;
  }
};

const getItem = (item: Partial<WishlistItem>) =>
  wishlist.value &&
  wishlist.value.find((i) =>
    i.productId == item.productId && i.sku == item.sku
  );

effect(refreshWishlist);

const state = {
  wishlist,
  loading,
  addItem,
  getItem,
  removeItem,
};

export const useWishlist = () => state;
