export const parseRange = (price: string) => {
  const splitted = price.split(":");

  const from = Number(splitted?.[0]);
  const to = Number(splitted?.[1]);

  return Number.isNaN(from) || Number.isNaN(to) ? null : { from, to };
};

export const formatRange = (from: number, to: number) => `${from}:${to}`;
