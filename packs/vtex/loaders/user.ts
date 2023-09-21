import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import base from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/loaders/user.ts";

export interface User {
  id: string;
  email: string;
}

function loader(props: unknown, req: Request, ctx: Context): User | null {
  return base(props, req, transform(ctx));
}

export default loader;
