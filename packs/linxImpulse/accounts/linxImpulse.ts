import type { Account as AccountBlock } from "deco/blocks/account.ts";
import type { FnContext } from "deco/types.ts";

export interface Account extends AccountBlock {
  /**
   * @description Linx Impulse apiKey. For more info, read here: https://docs.linximpulse.com/v2-search-api/reference/introdu%C3%A7%C3%A3o#via-backend
   */
  apiKey: string;

  /**
   * @description Linx Impulse secretKey.
   */
  secretKey?: string;

  /**
   * @description Linx Impulse sales channel.
   */
  salesChannel: string;

  /**
   * @description Url to set headers request "origin" and "referer", used when no secret key is available.
   */
  url?: string;
}

export type Context = FnContext<{
  configLinxImpulse?: Account;
}>;

function account(acc: Account) {
  return acc;
}

export default account;
