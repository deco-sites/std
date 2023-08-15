import type { Account as AccountBlock } from "$live/blocks/account.ts";
import type { FnContext } from "$live/types.ts";
import type { Manifest } from "deco-sites/std/live.gen.ts";

export interface Account extends AccountBlock {
  /**
   * @description Shopify store name.
   */
  storeName: string;

  /**
   * @description Shopify storefront access token.
   */
  storefrontAccessToken: string;
}

export type Context = FnContext<{
  configShopify?: Account;
}, Manifest>;

function account(acc: Account) {
  return acc;
}

export default account;
