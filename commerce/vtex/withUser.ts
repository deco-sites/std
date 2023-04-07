import { LoaderFunction } from "$live/types.ts";
import { getCookies } from "std/http/mod.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";

import type { StateVTEX } from "./types.ts";

const COOKIE = "VtexIdclientAutCookie";

export const withUser = <Props, Data>(
  loader: LoaderFunction<Props, Data, StateVTEX>,
): LoaderFunction<Props, Data | null, StateVTEX> =>
(req, ctx, props) => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[COOKIE] ??
    cookies[`${COOKIE}_${ctx.state.global.configVTEX?.account}`] ?? "";
  const decoded = cookie ? decode(cookie) : null;

  const user = (decoded?.[1] as { sub: string })?.sub;

  ctx.state = {
    ...ctx.state,
    user,
  };

  return loader(req, ctx, props);
};
