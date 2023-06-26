export const paths = () => {
  const base = `https://api.linximpulse.com/engage/search/v3`;
  const href = (path: string) => new URL(path, base).href;

  return {
    search: href(`/search`),
    autocompletes: href(`/autocompletes`),
  };
};
