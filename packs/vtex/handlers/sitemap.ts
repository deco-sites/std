import Proxy from "$live/handlers/proxy.ts";
import { Handler } from "std/http/mod.ts";

export interface Props {
  /**
   * @description the proxy sitemap url.
   * @example https://bravtexfashionstore.vtexcommercestable.com.br
   */
  url: string;
}

/**
 * @title Proxy Handler
 * @description Proxies request to the target url.
 */
export default function Sitemap({ url }: Props): Handler {
  return async (req, ctx) => {
    const response = await Proxy({ url })(req, ctx);

    const reqUrl = new URL(req.url);
    const text = await response.text();

    return new Response(text.replaceAll(url, reqUrl.origin), {
      headers: response.headers,
      status: response.status,
    });
  };
}
