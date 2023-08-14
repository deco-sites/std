import { state as storeState } from "./context.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import { mapCategoriesToAnalyticsCategories } from "deco-sites/std/commerce/utils/productToAnalyticsItem.ts";
import type { AnalyticsItem } from "deco-sites/std/commerce/types.ts";
import type {
  OrderForm,
  OrderFormItem,
} from "deco-sites/std/packs/vtex/types.ts";

const { cart, loading } = storeState;

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
    item_name: item.name ?? item.skuName ?? "",
    coupon,
    discount: Number(((item.price - item.sellingPrice) / 100).toFixed(2)),
    index,
    item_brand: item.additionalInfo.brandName ?? "",
    item_variant: item.skuName,
    price: item.price / 100,
    quantity: item.quantity,
    affiliation: item.seller,
    ...(mapItemCategoriesToAnalyticsCategories(item)),
  }));
};

const wrap =
  <T>(action: (p: T, init?: RequestInit | undefined) => Promise<OrderForm>) =>
  (p: T) =>
    storeState.enqueue(async (signal) => ({
      cart: await action(p, { signal }),
    }));

const state = {
  cart,
  loading,
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
