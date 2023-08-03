import { isFreshCtx } from "$live/handlers/fresh.ts";
import Proxy from "$live/handlers/proxy.ts";
import type { Account } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { ConnInfo } from "std/http/server.ts";

const xmlHeader =
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const includeSiteMaps = (
  currentXML: string,
  origin: string,
  includes?: string[],
) => {
  const siteMapIncludeTags = [];

  for (const include of (includes ?? [])) {
    siteMapIncludeTags.push(`
  <sitemap>
    <loc>${include.startsWith("/") ? `${origin}${include}` : include}</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
  </sitemap>`);
  }
  return siteMapIncludeTags.length > 0
    ? currentXML.replace(
      xmlHeader,
      `${xmlHeader}\n${siteMapIncludeTags.join("\n")}`,
    )
    : currentXML;
};

export interface Props {
  include?: string[];
}
/**
 * @title Sitemap Proxy
 */
export default function Sitemap({ include }: Props) {
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

    return new Response(
      includeSiteMaps(
        text.replaceAll(publicUrl, `${reqUrl.origin}/`),
        reqUrl.origin,
        include,
      ),
      {
        headers: response.headers,
        status: response.status,
      },
    );
  };
}
