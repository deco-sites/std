import type { FnContext } from "$live/types.ts";
import type { Account as AccountBlock } from "$live/blocks/account.ts";

export interface Account extends AccountBlock {
  /**
   * @description LinxImpulse apiKey. For more info, read here: https://docs.linximpulse.com/v2-search-api/reference/introdu%C3%A7%C3%A3o#via-backend
   */
  apiKey: string;

  /**
   * @description LinxImpulse secretKey.
   */
  secretKey?: string;
}

export type Context = FnContext<{
  configLinxImpulse?: Account;
}>;

function account(acc: Account) {
  return acc;
}

export default account;
