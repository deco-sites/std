import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { Route } from "$live/flags/audience.ts";

const PATHS_TO_PROXY = [
  "/account",
  "/checkout",
  "/checkout/*",
  "/files/*",
  "/assets/*",
  "/arquivos/*",
  "/account/*",
  "/login",
  "/no-cache/*",
  "/api/*",
  "/logout",
  "/_secure/account",
  "/XMLData/*",
  "/_v/*",
];

const buildProxyRoutes = (
  { publicUrl, extraPaths }: { publicUrl?: string; extraPaths: string[] },
) => {
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

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "$live/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
        },
      },
    });
    const routesFromPaths = [...PATHS_TO_PROXY, ...extraPaths].map(
      routeFromPath,
    );

    return [
      {
        pathTemplate: "/sitemap.xml",
        handler: {
          value: {
            __resolveType: "deco-sites/std/handlers/vtex/sitemap.ts",
          },
        },
      },
      {
        pathTemplate: "/sitemap/*",
        handler: {
          value: {
            __resolveType: "deco-sites/std/handlers/vtex/sitemap.ts",
          },
        },
      },
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl from configVTEX");
    console.error(e);
    return [];
  }
};

export interface Props {
  extraPathsToProxy?: string[];
}

/**
 * @title VTEX Proxy Routes
 */
export default function VTEXProxy(
  { extraPathsToProxy = [] }: Props,
  _req: Request,
  ctx: Context,
): Route[] {
  return buildProxyRoutes({
    publicUrl: ctx.configVTEX?.publicUrl,
    extraPaths: extraPathsToProxy,
  });
}
