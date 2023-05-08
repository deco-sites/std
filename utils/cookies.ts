import { getSetCookies, setCookie } from "std/http/mod.ts";

export const proxySetCookie = (
  from: Headers,
  to: Headers,
  toDomain?: URL | string,
) => {
  const newDomain = toDomain && new URL(toDomain);

  for (const cookie of getSetCookies(from)) {
    const newCookie = newDomain
      ? {
        ...cookie,
        domain: newDomain.hostname,
      }
      : cookie;

    setCookie(to, newCookie);
  }
};
