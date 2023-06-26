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
  "/webform",
];

const buildProxyRoutes = (
  { internalDomain, publicDomain, pagesToProxy }: {
    internalDomain?: string;
    publicDomain?: string;
    pagesToProxy: string[];
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

    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${internalDomain}'`);
    }

    const urlToProxy = internalDomain;
    const hostToUse = hostname;

    return [...PATHS_TO_PROXY, ...pagesToProxy].map((pathTemplate) => ({
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

export interface Props {
  /** @description ex: /p/fale-conosco */
  pagesToProxy?: string[];
}

/**
 * @title VNDA Proxy Routes
 */
export default function VNDAProxy(
  { pagesToProxy = [] }: Props,
  _req: Request,
  ctx: Context,
): Route[] {
  return buildProxyRoutes({
    internalDomain: ctx.configVNDA?.internalDomain,
    publicDomain: ctx.configVNDA?.domain,
    pagesToProxy,
  });
}
