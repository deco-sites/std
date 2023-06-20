import { Cookie, getCookies } from "std/http/mod.ts";
import { stringify } from "./cookies.ts";

const VTEX_CHECKOUT_COOKIE = "checkout.vtex.com";

export const parseCookie = (headers: Headers) => {
  const cookies = getCookies(headers);
  const ofidCookie = cookies[VTEX_CHECKOUT_COOKIE];

  /**
   * There are two cookies present for VTEX Auth:
   *
   * - VtexIdClientAutCookie_{accountName}
   * - VtexIdClientAutCookie_{crypto.randomUuid()}
   *
   * Here, we sort them to get the first one and pass forward its value
   */
  const authCookieName = Object.keys(cookies).toSorted((a, z) =>
    a.length - z.length
  ).find((cookieName) => cookieName.startsWith("VtexIdclientAutCookie"));

  const authCookie = authCookieName ? cookies[authCookieName] : undefined;

  if (ofidCookie == null) {
    return {
      orderFormId: "",
      cookie: "",
    };
  }

  if (!/^__ofid=([0-9a-fA-F])+$/.test(ofidCookie)) {
    throw new Error(
      `Not a valid VTEX orderForm cookie. Expected: /^__ofid=([0-9])+$/, receveid: ${ofidCookie}`,
    );
  }

  const [_, id] = ofidCookie.split("=");

  return {
    orderFormId: id,
    cookie: stringify({
      [VTEX_CHECKOUT_COOKIE]: ofidCookie,
      ...(authCookieName && { [authCookieName]: authCookie }),
    }),
  };
};

export const formatCookie = (orderFormId: string): Cookie => ({
  value: `__ofid=${orderFormId}`,
  name: "checkout.vtex.com",
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});
