export const paths = () => {
  const base = `https://api.linximpulse.com/engage/search/v3`;
  const href = (path: string) => `${base}${path}`;

  return {
    search: href(`/search`),
    autocompletes: href(`/autocompletes`),
  };
};
