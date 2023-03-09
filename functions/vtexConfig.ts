import { LiveState, LoaderFunction } from "$live/types.ts";
import { ConfigVTEX } from "../commerce/vtex/client.ts";

export type { ConfigVTEX } from "../commerce/vtex/client.ts";

export interface ClientConfigVTEX {
  account: string;
  defaultLocale: string;
  defaultPriceCurrency: string;
  //   defaultLocale: ConfigVTEX["defaultLocale"];
  //   defaultPriceCurrency: ConfigVTEX["defaultPriceCurrency"];
}

/**
 * @title Loader to get vtex config and pass to components
 * @description Usefull for client side components, like: search auto complete.
 */
const vtexConfig: LoaderFunction<
  null,
  ClientConfigVTEX | undefined,
  LiveState<{ configVTEX: ConfigVTEX | undefined }>
> = (_, ctx) => {
  const { configVTEX } = ctx.state.global;

  return Promise.resolve({
    data: configVTEX,
  });
};

export default vtexConfig;
