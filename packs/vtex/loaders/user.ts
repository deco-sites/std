import { parseCookie } from "../utils/vtexId.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface User {
  email: string;
}

function loader(_props: unknown, req: Request, ctx: Context): User | null {
  const { configVTEX: config } = ctx;
  const { user } = parseCookie(req.headers, config!.account);

  if (!user) {
    return null;
  }

  return {
    email: user,
  };
}

export default loader;
