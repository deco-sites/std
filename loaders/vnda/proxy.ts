import type { Context } from "deco-sites/std/packs/vnda/vndaAccount.ts";
import { Route } from "$live/flags/audience.ts";

const PATHS_TO_PROXY = [
  "/carrinho",
  "/carrinho/*",
  "/cep/*",
  "/checkout/*",
  "/components/*",
  "/conta",
  "/conta/*",
  "/cupom/ajax",
  "/entrar",
  "/images/*",
  "/javascripts/*",
  "/sair",
  "/sitemap.xml",
  "/stylesheets/*",
  "/v/s",
];

const buildProxyRoutes = (
  { internalDomain, publicDomain }: {
    internalDomain?: string;
    publicDomain?: string;
  },
) => {
  if (!internalDomain) {
    return [];
  }

  try {
    const hostname = (new URL(
      publicDomain?.startsWith("http")
        ? publicDomain
        : `https://${publicDomain}`,
    )).hostname;

    // Rejects TLD mystore.com, which VTEX doesn't support it carrefour.com.br / CNAME
    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${internalDomain}'`);
    }

    const urlToProxy = internalDomain;
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
    console.log("Error parsing internalDomain from configVTEX");
    console.error(e);
    return [];
  }
};

/**
 * @title VNDA Proxy Routes
 */
export default function VNDAProxy(
  _props: unknown,
  _req: Request,
  ctx: Context,
): Route[] {
  return buildProxyRoutes({
    internalDomain: ctx.configVNDA?.internalDomain,
    publicDomain: ctx.configVNDA?.domain,
  });
}
