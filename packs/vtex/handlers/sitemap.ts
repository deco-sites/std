import Proxy from "$live/handlers/proxy.ts";
import { ConnInfo } from "std/http/server.ts";
import { isFreshCtx } from "$live/handlers/fresh.ts";
import type { Account } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

/**
 * @title Sitemap Proxy
 */
export default function Sitemap(_: unknown) {
  return async (
    req: Request,
    ctx: ConnInfo,
  ) => {
    if (!isFreshCtx<{ configVTEX: Account }>(ctx)) {
      throw new Error("Missing fresh context");
    }

    const url = ctx.state.configVTEX?.publicUrl;

    if (!url) {
      throw new Error("Missing configVTEX.publicUrl");
    }

    const publicUrl =
      new URL(url?.startsWith("http") ? url : `https://${url}`).href;

    const response = await Proxy({
      url: publicUrl,
    })(req, ctx);

    const reqUrl = new URL(req.url);
    const text = await response.text();

    return new Response(text.replaceAll(publicUrl, `${reqUrl.origin}/`), {
      headers: response.headers,
      status: response.status,
    });
  };
}
