import { Cookie } from "https://deno.land/std@0.162.0/http/cookie.ts";

export const CHECKOUT_COOKIE_NAME = "checkout.vtex.com";

export const parse = (cookie: string) => {
  const [key, value] = cookie.split("=");

  if (key !== "__ofid" || typeof value !== "string") {
    throw new Error("Malformed VTEX checkout cookie");
  }

  return {
    orderFormId: value,
  };
};

export const format = (orderFormId: string): Cookie => ({
  value: `__ofid=${orderFormId}`,
  name: CHECKOUT_COOKIE_NAME,
  httpOnly: true,
  secure: true,
});
