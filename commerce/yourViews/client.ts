import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import { Ratings, Reviews } from "./types.ts";

export type ClientYourViews = ReturnType<typeof createClient>;

export interface ConfigYourViews {
  token: string;
  appId: string;
}

export interface PaginationOptions {
  page?: number;
  count?: number;
}

const baseUrl = "http://service.yourviews.com.br";

export const createClient = ({ token, appId }: ConfigYourViews) => {
  const headers = {
    "Authorization": token,
  };

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000756179-buscar-as-estrelas-nas-prateleiras */
  const rating = (
    { page = 0, count = 1, productId }: PaginationOptions & {
      productId: string;
    },
  ) =>
    fetchAPI<Ratings>(
      `${baseUrl}/api/${appId}/review/reviewshelf?${new URLSearchParams(
        { page, count, productIds: productId } as unknown as Record<
          string,
          string
        >,
      )}`,
      { headers, withProxyCache: true },
    );

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000756179-buscar-as-estrelas-nas-prateleiras */
  const ratings = (
    { page = 0, count, productIds }: PaginationOptions & {
      productIds: string[];
    },
  ) =>
    fetchAPI<Ratings>(
      `${baseUrl}/api/${appId}/review/reviewshelf?${new URLSearchParams({
        page,
        count: count ?? productIds.length,
        productIds: productIds.join(","),
      } as unknown as Record<string, string>)}`,
      { headers, withProxyCache: true },
    );

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000740469-buscar-reviews-de-produto */
  const review = (
    { reviewId, ...params }: PaginationOptions & { reviewId: string },
  ) =>
    fetchAPI<Reviews>(
      `${baseUrl}/api/${appId}/review/${reviewId}?${new URLSearchParams(
        params as unknown as Record<string, string>,
      )}`,
      {
        headers,
        withProxyCache: true,
      },
    );

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000740469-buscar-reviews-de-produto */
  const reviews = (
    options: PaginationOptions & {
      productId: string;
      orderBy: number;
    },
  ) =>
    fetchAPI<Reviews>(
      `${baseUrl}/api/${appId}/review?${new URLSearchParams(
        options as unknown as Record<string, string>,
      )}`,
      {
        headers,
        withProxyCache: true,
      },
    );

  return {
    rating,
    ratings,
    review,
    reviews,
  };
};
