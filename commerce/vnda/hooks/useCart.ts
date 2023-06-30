import { Signal, signal } from "@preact/signals";
import type {
  VNDACart,
  VNDACoupon,
  VNDARelatedItem,
  VNDAShipping,
} from "../types.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

const cart = signal<VNDACart | null>(null);
const cartRelatedItems = signal<VNDARelatedItem[]>([]);
const shipping = signal<VNDAShipping | null>(null);
const coupon = signal<VNDACoupon | string | null>(null);

const loading = signal<boolean>(false);
const shippingLoading = signal<boolean>(false);
const couponLoading = signal<boolean>(false);

export type UseVNDACartHook = {
  cart: Signal<VNDACart | null>;
  cartRelatedItems: Signal<VNDARelatedItem[]>;
  shipping: Signal<VNDAShipping | null>;
  coupon: Signal<VNDACoupon | string | null>;
  loading: Signal<boolean>;
  shippingLoading: Signal<boolean>;
  couponLoading: Signal<boolean>;
  getCartQuantity(): number;
  fetchAndSetCart(): Promise<void>;
  fetchAndSetRelatedItems(): Promise<void>;
  addItemToCart(
    params: {
      itemId: string;
      quantity: number;
      attributes: Record<string, string>;
      sellerId?: string;
    },
  ): Promise<void>;
  addCouponToCart(params: { text: string }): Promise<void>;
  updateItemQuantity(
    params: { itemId: number; quantity: number },
  ): Promise<void>;
  addShippingAddress(
    params: { zip: string },
  ): Promise<void>;
};

const addItemToCart: UseVNDACartHook["addItemToCart"] = async (
  { itemId, quantity, attributes },
) => {
  const fd = new FormData();
  fd.set("sku", itemId);
  fd.set("quantity", `${quantity}`);

  Object.entries(attributes).forEach(
    ([name, value]) => {
      fd.set(`attribute-${name}`, value);
    },
  );

  const vndaCart = await fetchAPI<VNDACart>(`/carrinho/adicionar`, {
    method: "POST",
    body: fd,
  });

  cart.value = vndaCart;
  fetchAndSetRelatedItems();
};

const addCouponToCart: UseVNDACartHook["addCouponToCart"] = async (
  { text },
) => {
  const fd = new FormData();
  fd.set("code", text);

  const vndaCoupon = await fetchAPI<VNDACoupon>(`/cupom/ajax`, {
    method: "POST",
    body: fd,
  });

  coupon.value = vndaCoupon;
};

const updateItemQuantity: UseVNDACartHook["updateItemQuantity"] = async (
  { itemId, quantity },
) => {
  if (quantity > 0) {
    cart.value = await fetchAPI<VNDACart>(
      "/carrinho/quantidade/atualizar",
      {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, quantity }),
      },
    );
  } else {
    cart.value = await fetchAPI<VNDACart>(
      "/carrinho/remover",
      {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      },
    );
  }
};

const addShippingAddress: UseVNDACartHook["addShippingAddress"] = async (
  { zip },
) => {
  const fd = new FormData();
  fd.set("zip", zip);

  try {
    const vndaShipping = await fetchAPI<VNDAShipping>("/cep", {
      method: "POST",
      body: fd,
    });

    shipping.value = vndaShipping;
  } catch (_e) {
    shipping.value = null;
  }
};

const fetchAndSetCart = async () => {
  const vndaCart = await fetchAPI<VNDACart>("/carrinho");
  cart.value = vndaCart;
  fetchAndSetRelatedItems();
};

const fetchAndSetRelatedItems = async () => {
  const vndaRelatedItems = await fetchAPI<VNDARelatedItem[]>(
    "/carrinho/produtos-sugeridos/relacionados-carrinho",
    {
      referrerPolicy: "no-referrer",
    },
  );
  cartRelatedItems.value = vndaRelatedItems;
};

type Middleware = (
  fn: () => Promise<void>,
  opts?: { loadingSignal: Signal<boolean> },
) => Promise<void>;

/**
 * Usually we add a withCart middleware here, but it wouldn't work
 * with VNDA because it doesn't create a Cart structure before
 * adding items.
 */

const withLoading: Middleware = async (
  cb,
  opts = { loadingSignal: loading },
) => {
  try {
    opts.loadingSignal.value = true;
    return await cb();
  } finally {
    opts.loadingSignal.value = false;
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
  cart,
  shipping,
  cartRelatedItems,
  coupon,
  loading,
  shippingLoading,
  couponLoading,
  fetchAndSetCart: () => withPQueue(() => withLoading(() => fetchAndSetCart())),
  addItemToCart: (opts) =>
    withPQueue(() => withLoading(() => addItemToCart(opts))),
  addCouponToCart: (opts) =>
    withPQueue(() =>
      withLoading(() => addCouponToCart(opts), {
        loadingSignal: couponLoading,
      })
    ),
  updateItemQuantity: (opts) =>
    withPQueue(() => withLoading(() => updateItemQuantity(opts))),
  addShippingAddress: (opts) =>
    withPQueue(() =>
      withLoading(() => addShippingAddress(opts), {
        loadingSignal: shippingLoading,
      })
    ),
  // This doesn't need `withLoading`, because it's a non-blocking element
  fetchAndSetRelatedItems: () => withPQueue(() => fetchAndSetRelatedItems()),
};

export const useVNDACart = () => state;
