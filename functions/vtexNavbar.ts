import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { categoryTreeToNavbar } from "../commerce/vtex/transform.ts";
import type { Navbar } from "../commerce/types.ts";
import type { LiveState, LoaderFunction } from "$live/types.ts";

export interface Props {
  /**
   * @description Number of levels of categories to be returned
   *  @default 2
   */
  levels?: number;
}

const navbar: LoaderFunction<
  Props,
  Navbar[] | null,
  LiveState<{ configVTEX: ConfigVTEX }>
> = async (_, ctx, { levels = 2 }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const tree = await vtex.catalog_system.categoryTree({
    categoryLevels: levels,
  });

  return {
    data: categoryTreeToNavbar(tree),
  };
};

export default navbar;
