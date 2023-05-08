export const stringify = (cookies: Record<string, string>) =>
  Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
