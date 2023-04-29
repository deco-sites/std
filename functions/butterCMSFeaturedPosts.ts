import type { LoaderFunction } from "$live/types.ts";

import { createClient } from "../commerce/butterCMS/client.ts";
import type { Page, StateButterCMS } from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const featuredPostsLoader: LoaderFunction<
  null,
  Page,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const data = await client.pages();

  return { data };
};

export default featuredPostsLoader;
