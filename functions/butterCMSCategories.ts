import type { LoaderFunction } from "deco/types.ts";

import { createClient } from "../commerce/butterCMS/client.ts";
import type { Category, StateButterCMS } from "../commerce/butterCMS/types.ts";

/**
 * @title Butter CMS Categories Loader
 * @description Useful for list blog's categories
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
