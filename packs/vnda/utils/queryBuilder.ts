import { ProductSearchParams } from "../types.ts";

export const paramsToQueryString = (
  params: ProductSearchParams | { key: string; value: string }[],
) => {
  const keys = Object.keys(params) as Array<keyof typeof params>;

  const transformedValues = keys.map((_key) => {
    const value = params[_key];
    const key = Array.isArray(value) ? `${_key}[]` : _key;

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((v) => [key, v.toString()]);
    }

    return [key, value?.toString()];
  }).filter((v) => v.length);

  return new URLSearchParams(transformedValues);
};
