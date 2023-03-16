import { LiveState, LoaderFunction } from "$live/types.ts";
import { ConfigVTEX } from "../commerce/vtex/client.ts";

export type { ConfigVTEX } from "../commerce/vtex/client.ts";

export interface ClientConfigVTEX {
  account: string;
  defaultLocale: string;
  defaultPriceCurrency: string;
}

// TODO: Drop this when live@1.x
/**
 * @title Loader to get vtex config and pass to components
 * @description Usefull for client side components, like: search auto complete.
 */
const vtexConfig: LoaderFunction<
  null,
  ClientConfigVTEX,
  LiveState<{ configVTEX: ConfigVTEX }>
> = (_, ctx) => {
  const { configVTEX } = ctx.state.global;

  return Promise.resolve({
    data: configVTEX,
  });
};

export default vtexConfig;
