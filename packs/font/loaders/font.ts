import { fetchSafe } from "deco-sites/std/utils/fetch.ts";

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
  const fontResponse = await fetchSafe(fontUrl.href, {
    withProxyCache: true,
  });
  const headers = new Headers();
  copyHeader("content-length", headers, fontResponse.headers);
  copyHeader("content-type", headers, fontResponse.headers);
  copyHeader("content-disposition", headers, fontResponse.headers);
  copyHeader("cache-control", headers, fontResponse.headers);

  return new Response(fontResponse.body, { headers });
};

export default loader;
