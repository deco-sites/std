import type { LoaderFunction } from "$live/types.ts";

import { createClient } from "../commerce/butterCMS/client.ts";
import type { StateButterCMS } from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const categoriesLoader: LoaderFunction<
  null,
  { test: boolean },
  StateButterCMS
> = async (
  req,
  ctx,
) => {
  console.log({ req, ctx });

  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const test = await client.categories();

  console.log(test);

  return { data: { test: true } };
};

export default categoriesLoader;
