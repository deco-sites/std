import type { LoaderFunction } from "$live/types.ts";

import { ClientVTEX, createClient } from "../commerce/vtex/client.ts";
import { StateVTEX } from "../commerce/vtex/types.ts";

/**
 * @title Creates a VTEXClient.
 */
const vtexClient: LoaderFunction<
  null,
  ClientVTEX,
  StateVTEX
> = (
  _req,
  ctx,
) => {
  return { data: createClient(ctx.state.global.configVTEX!) };
};

export default vtexClient;
