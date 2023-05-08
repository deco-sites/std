import { getCookies } from "std/http/mod.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { stringify } from "./cookies.ts";

const NAME = "VtexIdclientAutCookie";

export const parseCookie = (headers: Headers, account: string) => {
  const cookies = getCookies(headers);
  const cookie = cookies[NAME] || cookies[`${NAME}_${account}`];
  const decoded = cookie ? decode(cookie) : null;

  const user = (decoded?.[1] as { sub: string })?.sub;

  return {
    cookie: stringify({
      [NAME]: cookies[NAME],
      [`${NAME}_${account}`]: cookies[`${NAME}_${account}`],
    }),
    user,
  };
};
