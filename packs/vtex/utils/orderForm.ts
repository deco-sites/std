import { Cookie, getCookies } from "std/http/mod.ts";
import { stringify } from "./cookies.ts";

const NAME = "checkout.vtex.com";

export const parseCookie = (headers: Headers) => {
  const cookies = getCookies(headers);
  const cookie = cookies[NAME];

  if (cookie == null) {
    return {
      orderFormId: "",
      cookie: "",
    };
  }

  if (!/^__ofid=([0-9a-fA-F])+$/.test(cookie)) {
    throw new Error(
      `Not a valid VTEX orderForm cookie. Expected: /^__ofid=([0-9])+$/, receveid: ${cookie}`,
    );
  }

  const [_, id] = cookie.split("=");

  return {
    orderFormId: id,
    cookie: stringify({ [NAME]: cookie }),
  };
};

export const formatCookie = (orderFormId: string): Cookie => ({
  value: `__ofid=${orderFormId}`,
  name: "checkout.vtex.com",
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});
