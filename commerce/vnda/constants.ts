import { SortOption } from "../types.ts";

export const BASE_URL_PROD = "https://api.vnda.com.br/api/v2/";
export const BASE_URL_SANDBOX = "https://api.sandbox.vnda.com.br/api/v2/";
export const DOMAIN_HEADER = "X-Shop-Host";
export const VNDA_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevância" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "lowest_price", label: "Menor preço" },
  { value: "highest_price", label: "Maior preço" },
];
