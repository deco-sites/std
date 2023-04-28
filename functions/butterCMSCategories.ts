import type { LoaderFunction } from "$live/types.ts";

import { createClient } from "../commerce/butterCMS/client.ts";
import type { Category, StateButterCMS } from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const categoriesLoader: LoaderFunction<
  null,
  Category[],
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const { data } = await client.categories();

  return { data };
};

export default categoriesLoader;
