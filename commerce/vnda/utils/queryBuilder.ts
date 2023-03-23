// deno-lint-ignore no-explicit-any
export const paramsToQueryString = (params: Record<string, any>) => {
  const keys: string[] = Object.keys(params);
  const validKeys: string[] = keys.filter((key) => Boolean(params[key]));
  const validParams = validKeys.map((key) => [key, params[key]]);
  return new URLSearchParams(validParams);
};
