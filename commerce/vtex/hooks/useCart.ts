import { signal } from "@preact/signals";

import { getClient } from "./useClient.ts";
import { AnalyticsItem } from "../../types.ts";
import { mapCategoriesToAnalyticsCategories } from "../../utils/productToAnalyticsItem.ts";
import type { OrderForm, OrderFormItem } from "../types.ts";

const mapItemCategoriesToAnalyticsCategories = (
  item: OrderFormItem,
): Record<`item_category${number | ""}`, string> => {
  return mapCategoriesToAnalyticsCategories(
    Object.values(item.productCategories),
  );
};

const mapOrderFormItemsToAnalyticsItems = (
  orderForm: Pick<OrderForm, "items" | "marketingData">,
): AnalyticsItem[] => {
  const items = orderForm.items;

  if (!items) {
    return [];
  }

  const coupon = orderForm.marketingData?.coupon ?? undefined;

  return items.map((item, index) => ({
    item_id: item.productId,
    item_name: item.skuName,
    coupon,
    discount: item.price - item.sellingPrice,
    index,
    item_brand: item.additionalInfo.brandName ?? "",
    item_variant: item.id,
    price: item.price,
    quantity: item.quantity,
    ...(mapItemCategoriesToAnalyticsCategories(item)),
  }));
};

export const cart = signal<OrderForm | null>(null);
const loading = signal<boolean>(true);

interface AddCouponsToCartOptions {
  text: string;
}

const addCouponsToCart = async (options: AddCouponsToCartOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).coupons.post(options);
};

interface CartInstallmentsOptions {
  paymentSystem: number;
}

const getCartInstallments = async (options: CartInstallmentsOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).installments.get(options);
};

interface IgnoreProfileDataOptions {
  ignoreProfileData: boolean;
}

const ignoreProfileData = async (options: IgnoreProfileDataOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).profile.patch(options);
};

interface ChangePriceOptions {
  itemIndex: number;
  price: number;
}

const changePrice = async (options: ChangePriceOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).items.price.put(options);
};

const getCart = async () => {
  cart.value = await getClient().checkout.pub.orderForm("").post();
};

const removeAllPersonalData = async () => {
  cart.value = await getClient()
    .checkout.changeToAnonymousUser(cart.value!.orderFormId).get();
};

interface UpdateItemsOptions {
  orderItems: Array<{
    quantity: number;
    index: number;
  }>;
  allowedOutdatedData?: Array<"paymentData">;
}

const updateItems = async (options: UpdateItemsOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).items.update.post(options);
};

export interface SimulationOptions {
  items: Array<{
    id: number;
    quantity: number;
    seller: string;
  }>;
  postalCode: string;
  country: string;
}

const simulate = (data: SimulationOptions) =>
  getClient().checkout.pub.orderForms.simulation.post(data);

const removeAllItems = async () => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).items.removeAll.post();
};

interface AddItemsOptions {
  orderItems: Array<{
    quantity: number;
    seller: string;
    id: string;
    index?: number;
    price?: number;
  }>;
  allowedOutdatedData?: Array<"paymentData">;
}

const addItems = async (options: AddItemsOptions) => {
  cart.value = await getClient()
    .checkout.pub.orderForm(cart.value!.orderFormId).items.post(options);
};

type Middleware = (fn: () => Promise<void>) => Promise<void>;

const withCart: Middleware = async (cb) => {
  if (cart.value === null) {
    throw new Error("Missing cart");
  }

  return await cb();
};

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
  const _getCart = () => withPQueue(() => withLoading(getCart));

  _getCart();

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && _getCart(),
  );
}

const state = {
  loading,
  cart,
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/removeAll */
  removeAllItems: () =>
    withPQueue(() => withCart(() => withLoading(removeAllItems))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId- */
  removeAllPersonalData: () =>
    withPQueue(() => withCart(() => withLoading(removeAllPersonalData))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update */
  updateItems: (opts: UpdateItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => updateItems(opts)))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items */
  addItems: (opts: AddItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addItems(opts)))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#put-/api/checkout/pub/orderForm/-orderFormId-/items/-itemIndex-/price */
  changePrice: (opts: ChangePriceOptions) =>
    withPQueue(() => withCart(() => withLoading(() => changePrice(opts)))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#patch-/api/checkout/pub/orderForm/-orderFormId-/profile */
  ignoreProfileData: (opts: IgnoreProfileDataOptions) =>
    withPQueue(() =>
      withCart(() => withLoading(() => ignoreProfileData(opts)))
    ),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm/-orderFormId-/installments */
  getCartInstallments: (opts: CartInstallmentsOptions) =>
    withPQueue(() =>
      withCart(() => withLoading(() => getCartInstallments(opts)))
    ),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons */
  addCouponsToCart: (opts: AddCouponsToCartOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addCouponsToCart(opts)))),
  /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation */
  simulate,
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
