// deno-lint-ignore no-explicit-any
export const paramsToQueryString = (params: Record<string, any>): string => {
  const keys = Object.keys(params);
  const validKeys = keys.filter((key) => Boolean(params[key]));

  const qs = validKeys.map((key) => {
    if (!Array.isArray(params[key])) return `${key}=${params[key]}`;
    return params[key].map((value: string) => `${key}=${value}`).join("&");
  });

  return qs.join("&");
};
