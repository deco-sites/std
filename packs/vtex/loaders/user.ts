import { parseCookie } from "../utils/vtexId.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface User {
  id: string;
  email: string;
}

function loader(_props: unknown, req: Request, ctx: Context): User | null {
  const { configVTEX: config } = ctx;
  const { payload } = parseCookie(req.headers, config!.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.sub,
  };
}

export default loader;
