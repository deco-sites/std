import type { LoaderFunction } from "$live/types.ts";

import {
  ClientVTEX,
  ConfigVTEX,
  createClient,
} from "../commerce/vtex/client.ts";
import { StateVTEX } from "../commerce/vtex/types.ts";

/**
 * @title Creates a VTEXClient.
 */
const vtexClient: LoaderFunction<
  ConfigVTEX | null,
  ClientVTEX,
  StateVTEX
> = (
  _req,
  ctx,
) => {
  return { data: createClient(ctx.state.$live!) };
};

export default vtexClient;
