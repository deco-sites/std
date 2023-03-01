import { Handlers } from "$fresh/server.ts";

const proxyTo = `https://esm.sh`;

const hopByHop = [
  "Keep-Alive",
  "Transfer-Encoding",
  "TE",
  "Connection",
  "Trailer",
  "Upgrade",
  "Proxy-Authorization",
  "Proxy-Authenticate",
];

const proxy: Handlers["GET"] = async (req, ctx) => {
  const headers = new Headers(req.headers);
  const fromUrl = new URL(req.url);
  const toUrl = new URL(
    `${fromUrl.pathname}${fromUrl.search}`,
    proxyTo,
  );

  hopByHop.forEach((h) => headers.delete(h));

  const response = await fetch(toUrl, {
    headers,
    method: req.method,
    body: req.body,
  });

  const responseHeaders = new Headers(response.headers);

  // Fix content-type for .d.ts files
  if (fromUrl.pathname.endsWith(".d.ts")) {
    responseHeaders.set("content-type", "application/typescript");
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const handler: Handlers = {
  GET: proxy,
  HEAD: proxy,
  POST: proxy,
  PUT: proxy,
  DELETE: proxy,
  OPTIONS: proxy,
  PATCH: proxy,
};
