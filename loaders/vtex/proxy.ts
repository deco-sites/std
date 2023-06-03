import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { Route } from "$live/flags/audience.ts";

const PATHS_TO_PROXY = [
  "/sitemap.xml",
  "/sitemap/*",
  "/checkout",
  "/checkout/*",
  "/files/*",
  "/arquivos/*",
  "/account/*",
  "/login",
  "/no-cache/*",
  "/api/*",
  "/logout",
  "/_secure/account",
];

const buildProxyRoutes = ({ publicUrl }: { publicUrl?: string }) => {
  if (!publicUrl) {
    return [];
  }

  try {
    const hostname = (new URL(
      publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
    )).hostname;

    // Rejects TLD mystore.com, which VTEX doesn't support it carrefour.com.br / CNAME
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    // TODO @lucis: Fix the proxy, MITM

    // const urlToProxy = `https://${hostname}.cdn.vtex.com`;
    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;

    return PATHS_TO_PROXY.map((pathTemplate) => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "$live/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
        },
      },
    }));
  } catch (e) {
    console.log("Error parsing publicUrl from configVTEX");
    console.error(e);
    return [];
  }
};

/**
 * @title VTEX Proxy Routes
 */
export default function VTEXProxy(
  _props: unknown,
  _req: Request,
  ctx: Context,
): Route[] {
  return buildProxyRoutes({ publicUrl: ctx.configVTEX?.publicUrl });
}
