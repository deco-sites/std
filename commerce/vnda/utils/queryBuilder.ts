// deno-lint-ignore no-explicit-any
export const paramsToQueryString = (params: Record<string, any>): string => {
  const keys = Object.keys(params);
  const validKeys = keys.filter((key) => Boolean(params[key]));
  const qs = validKeys.map((key) => `${key}=${params[key]}`);

  return qs.join("&");
};
