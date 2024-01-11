import type { Manifest } from "deco-sites/std/live.gen.ts";
import type { Account as AccountBlock } from "deco/blocks/account.ts";
import type { FnContext } from "deco/types.ts";

export interface Account extends AccountBlock {
  /**
   * @description Your VNDA domain name. For example, https://mystore.vnda.com.br
   */
  domain: string;

  /** @description e.g: deco.cdn.vnda.com.br */
  internalDomain: string;

  /**
   * @description The token generated from admin panel. Read here: https://developers.vnda.com.br/docs/chave-de-acesso-e-requisicoes. Do not add any other permissions than catalog.
   */
  authToken: string;

  /**
   * @description Define if sandbox environment should be used
   */
  useSandbox: boolean;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;
}

export type Context = FnContext<{
  configVNDA?: Account;
  // @ts-ignore this should work.
}, Manifest>;

export type StateVNDA = FnContext<
  { global: { configVTEX: Account } },
  // @ts-ignore this should work.
  Manifest
>;

function account(acc: Account) {
  return acc;
}

export default account;
