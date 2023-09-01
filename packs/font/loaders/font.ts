import { fetchSafe } from "deco-sites/std/utils/fetch.server.ts";

const ALLOWED_ORIGINS = new Set(["https://fonts.gstatic.com"]);

const copyHeader = (headerName: string, to: Headers, from: Headers) => {
  const hdrVal = from.get(headerName);
  if (hdrVal) {
    to.set(headerName, hdrVal);
  }
};

interface Props {
  /**
   * @description Font src like: https://fonts.gstatic.com/...
   */
  src: string;
}

const loader = async (props: Props) => {
  const fontSrc = props.src;
  const fontUrl = new URL(fontSrc);

  if (!ALLOWED_ORIGINS.has(fontUrl.origin)) {
    return new Response(null, {
      status: 400,
    });
  }

  const fontResponse = await fetchSafe(fontUrl.href, {
    withProxyCache: true,
  });
  const headers = new Headers();
  copyHeader("content-length", headers, fontResponse.headers);
  copyHeader("content-type", headers, fontResponse.headers);
  copyHeader("content-disposition", headers, fontResponse.headers);
  headers.set("x-cache", "MISS");
  headers.set(
    "cache-control",
    "public, s-maxage=15552000, max-age=15552000, immutable",
  );

  return new Response(fontResponse.body, { headers });
};

export default loader;
