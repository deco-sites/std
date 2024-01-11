import loader from "deco-sites/std/packs/vtex/loaders/navbar.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { Navbar } from "../commerce/types.ts";

export interface Props {
  /**
   * @description Number of levels of categories to be returned
   *  @default 2
   */
  levels?: number;
}

/**
 * @title Navigation Bar
 * @deprecated true
 */
// @ts-ignore this should work.
const loaderV0: LoaderFunction<
  Props,
  Navbar[] | null,
  StateVTEX
> = async (req, ctx, props) => {
  const data = await loader(
    props,
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
