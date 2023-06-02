import { Route } from "$live/flags/audience.ts";

export interface Props {
  /**
   * A valid VTEX Store domain.
   * @example fashion.bravtexstores.com.br
   */
  hostname: string;
}

const pathsToProxy = [
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

const buildProxyRoutes = (url: string) =>
  pathsToProxy.map((pathTemplate) => ({
    pathTemplate,
    handler: { value: { url, __resolveType: "$live/handlers/proxy.ts" } },
  }));

/**
 * @title VTEX Proxy Routes
 */
export default function VTEXProxy(
  { hostname }: Props,
): Route[] {
  return buildProxyRoutes(`https://${hostname}`);
}
