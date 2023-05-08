import { categoryTreeToNavbar } from "deco-sites/std/packs/vtex/utils/transform.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { Navbar } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { Category } from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  /**
   * @description Number of levels of categories to be returned
   *  @default 2
   */
  levels?: number;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: Context,
): Promise<Navbar[] | null> => {
  const { levels = 2 } = props;
  const { configVTEX: config } = ctx;

  const tree = await fetchAPI<Category[]>(
    paths(config!).api.catalog_system.pub.category.tree.level(levels),
    { withProxyCache: true },
  );

  return categoryTreeToNavbar(tree);
};

export default loader;
