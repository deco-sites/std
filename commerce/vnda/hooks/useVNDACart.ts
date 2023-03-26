import { Signal, signal } from "@preact/signals";
import { fetchAPI } from "../../../utils/fetchAPI.ts";
import type { VNDACart } from "../types.ts";

const cart = signal<VNDACart | null>(null);
const loading = signal<boolean>(false);

type UseVNDACartHook = {
  loading: Signal<boolean>;
  cart: Signal<VNDACart | null>;
  fetchAndSetCart(): Promise<void>;
  addItemToCart(
    params: { itemId: string; sellerId?: string; quantity: number },
  ): Promise<void>;
  addCouponToCart(params: { text: string }): Promise<void>;
  updateItemQuantity(
    params: { itemId: number; quantity: number },
  ): Promise<void>;
};

const addItemToCart: UseVNDACartHook["addItemToCart"] = async (
  { itemId, quantity },
) => {
  const fd = new FormData();
  fd.set("sku", itemId);
  fd.set("quantity", `${quantity}`);

  const vndaCart = await fetchAPI<VNDACart>(`/api/carrinho/adicionar`, {
    method: "POST",
    body: fd,
  });

  cart.value = vndaCart;
};

const addCouponToCart: UseVNDACartHook["addCouponToCart"] = async (
  { text },
) => {
  // TODO: Check returned type after we have a valid coupon
  const fd = new FormData();
  fd.set("code", text);

  await fetchAPI<any>(`/api/cupom/ajax`, { method: "POST", body: fd });
};

const updateItemQuantity: UseVNDACartHook["updateItemQuantity"] = async (
  { itemId, quantity },
) => {
  if (quantity > 0) {
    cart.value = await fetchAPI<VNDACart>(
      "/api/carrinho/quantidade/atualizar",
      {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, quantity }),
      },
    );
  } else {
    cart.value = await fetchAPI<VNDACart>(
      "/api/carrinho/remover",
      {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      },
    );
  }
};

const fetchAndSetCart = async () => {
  const vndaCart = await fetchAPI<VNDACart>(`/api/carrinho`);

  cart.value = vndaCart;
};

type Middleware = (fn: () => Promise<void>) => Promise<void>;

/**
 * Usually we add a withCart middleware here, but it wouldn't work
 * with VNDA because it doesn't create a Cart structure before
 * adding items.
 */

const withLoading: Middleware = async (cb) => {
  try {
    loading.value = true;
    return await cb();
  } finally {
    loading.value = false;
  }
};

let queue = Promise.resolve();
const withPQueue: Middleware = (cb) => {
  queue = queue.then(cb);

  return queue;
};

// Start fetching the cart on client-side only
if (typeof document !== "undefined") {
  // const _getCart = () => {};
  const _getCart = () => withPQueue(() => withLoading(fetchAndSetCart));

  _getCart();

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && _getCart(),
  );
}

const state: UseVNDACartHook = {
  loading,
  cart,
  fetchAndSetCart: () => withPQueue(() => withLoading(() => fetchAndSetCart())),
  addItemToCart: (opts) =>
    withPQueue(() => withLoading(() => addItemToCart(opts))),
  addCouponToCart: (opts) =>
    withPQueue(() => withLoading(() => addCouponToCart(opts))),
  updateItemQuantity: (opts) =>
    withPQueue(() => withLoading(() => updateItemQuantity(opts))),
};

export const useVNDACart = () => state;
