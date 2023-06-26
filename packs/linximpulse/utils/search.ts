import { Sort } from "../types.ts";

interface Params {
  terms: string;
  page: number;
  resultsPerPage: number;
  sortBy?: Sort;
  showOnlyAvailable?: boolean;
}

export const withDefaultParams = ({
  terms = "",
  page = 0,
  resultsPerPage = 12,
  sortBy,
  showOnlyAvailable = true,
}: Partial<Params>) =>
  new URLSearchParams({
    terms,
    page: `${page + 1}`,
    resultsPerPage: `${resultsPerPage}`,
    sortBy: `${sortBy}`,
    showOnlyAvailable: `${showOnlyAvailable}`,
  });
