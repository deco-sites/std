import type { Account as AccountBlock } from "$live/blocks/account.ts";
import type { FnContext } from "$live/types.ts";
import type { Manifest } from "deco-sites/std/live.gen.ts";

export interface Account extends AccountBlock {
  /**
   * @description LINX Account name. For more info, read here: https://help.linx.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl?: string;

  /**
   * @description Locale used for LINX Intelligent Search client.
   */
  defaultLocale: string;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;

  /**
   * @description LINX sales channel. This will be the default sales channel your site. For more info, read here: https://help.linx.com/tutorial/how-trade-policies-work--6Xef8PZiFm40kg2STrMkMV
   */
  defaultSalesChannel: string;
  defaultRegionId?: string;
  defaultHideUnavailableItems?: boolean;
}

export type Context = FnContext<{
  configLINX?: Account;
}, Manifest>;

function account(acc: Account) {
  return acc;
}

export default account;
