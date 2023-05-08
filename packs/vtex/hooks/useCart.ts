import { signal } from "@preact/signals";
import { Runtime } from "deco-sites/std/runtime.ts";
import { mapCategoriesToAnalyticsCategories } from "deco-sites/std/commerce/utils/productToAnalyticsItem.ts";
import type { AnalyticsItem } from "deco-sites/std/commerce/types.ts";
import type {
  OrderForm,
  OrderFormItem,
} from "deco-sites/std/packs/vtex/types.ts";

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

const payload = signal<OrderForm | null>(null);
const loading = signal<boolean>(true);

const wrap = <T>(action: (p: T) => Promise<OrderForm>) => (p: T) =>
  withPQueue(() =>
    withCart(() =>
      withLoading(async () => {
        payload.value = await action(p);
      })
    )
  );

const getCart = () =>
  withPQueue(() =>
    withLoading(async () => {
      payload.value = await Runtime.invoke({
        key: "deco-sites/std/loaders/vtex/cart.ts",
      });
    })
  );

type Middleware = (fn: () => Promise<void>) => Promise<void>;

const withCart: Middleware = async (cb) => {
  if (payload.value === null) {
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
  getCart();

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && getCart(),
  );
}

const state = {
  loading,
  cart: payload,
  updateItems: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateItems.ts"),
  ),
  removeAllItems: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/removeItems.ts"),
  ),
  addItems: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/addItems.ts"),
  ),
  addCouponsToCart: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateCoupons.ts"),
  ),
  changePrice: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateItemPrice.ts"),
  ),
  getCartInstallments: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/getInstallment.ts"),
  ),
  ignoreProfileData: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateProfile.ts"),
  ),
  removeAllPersonalData: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateUser.ts"),
  ),
  addItemAttachment: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateItemAttachment.ts"),
  ),
  removeItemAttachment: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/removeItemAttachment.ts"),
  ),
  sendAttachment: wrap(
    Runtime.create("deco-sites/std/actions/vtex/cart/updateAttachment.ts"),
  ),
  simulate: Runtime.create("deco-sites/std/actions/vtex/cart/simulation.ts"),
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
