import type { Context } from "deco-sites/std/packs/vnda/accounts/vnda.ts";
import { Route } from "deco/types.ts";

const PAGE_PATHS = [
  "/admin",
  "/admin/*",
  "/carrinho",
  "/carrinho/*",
  "/cdn-cgi/*",
  "/cep",
  "/cep/*",
  "/checkout/*",
  "/common/*",
  "/components/*",
  "/conta",
  "/conta/*",
  "/cupom/ajax",
  "/entrar",
  "/images/*",
  "/javascripts/*",
  "/loja/configuracoes",
  "/pedido/*",
  "/recaptcha",
  "/recuperar_senha",
  "/sair",
  "/sitemap.xml",
  "/stylesheets/*",
  "/v/s",
  "/webform",
];

const API_PATHS = [
  "/api/*",
];

const VNDA_HOST_HEADER = "X-Shop-Host";
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
  const { internalDomain, domain } = ctx.configVNDA ?? {};

  if (!internalDomain || !domain) {
    console.warn("Missing VNDA config");

    return [];
  }

  const url = new URL(
    domain?.startsWith("http") ? domain : `https://${domain}`,
  );

  if (!url.hostname || url.hostname.split(".").length <= 2) {
    throw new Error(`Invalid hostname from '${internalDomain}'`);
  }

  const customHeaders = [{ key: VNDA_HOST_HEADER, value: url.hostname }];

  try {
    const internalDomainPaths = [
      ...PAGE_PATHS,
      ...pagesToProxy,
    ].map((
      pathTemplate,
    ) => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "$live/handlers/proxy.ts",
          url: internalDomain,
          host: url.hostname,
          customHeaders,
        },
      },
    }));

    const apiDomainPaths = API_PATHS.map((pathTemplate) => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "$live/handlers/proxy.ts",
          url: `https://api.vnda.com.br/`,
          host: url.hostname,
          customHeaders,
        },
      },
    }));

    return [...internalDomainPaths, ...apiDomainPaths];
  } catch (e) {
    console.log("Error parsing internalDomain from configVNDA");
    console.error(e);
    return [];
  }
}
