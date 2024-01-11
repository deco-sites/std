import type { Handler } from "deco/blocks/handler.ts";
import type { Resolvable } from "deco/engine/core/resolver.ts";
import { isResolvable } from "deco/engine/core/resolver.ts";
import { Route } from "deco/types.ts";
import { ConnInfo } from "std/http/server.ts";

const isPage = (handler: Resolvable<Handler>) =>
  isResolvable(handler) &&
  handler.__resolveType === "$live/handlers/fresh.ts";

const isAbsolute = (href: string) =>
  !href.includes(":") && !href.includes("*") && !href.startsWith("/_live");

const buildSiteMap = (urls: string[]) => {
  const entries: string[] = [];
  for (const url of urls) {
    entries.push(`
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().substring(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`);
  }
  return entries.join("\n");
};

const sanitize = (url: string) => url.startsWith("/") ? url : `/${url}`;
const siteMapFromRoutes = (publicUrl: string, routes: Route[]): string => {
  const urls: string[] = [];
  for (const route of routes) {
    if (isAbsolute(route.pathTemplate) && isPage(route.handler.value)) {
      urls.push(`${publicUrl}${sanitize(route.pathTemplate)}`);
    }
  }
  return buildSiteMap(urls);
};

/**
 * @title SiteMap
 */
export default function SiteMap(_props: unknown) {
  return function (req: Request, connInfo: ConnInfo) {
    const reqUrl = new URL(req.url);
    const ctx = connInfo as ConnInfo & {
      params: Record<string, string>;
      state: {
        routes: Route[];
      };
    };
    return new Response(
      `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${siteMapFromRoutes(reqUrl.origin, ctx.state.routes ?? [])}
</urlset>`,
      { headers: { "content-type": "text/xml", status: "200" } },
    );
  };
}
