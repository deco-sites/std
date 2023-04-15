import DataLoader from "https://esm.sh/dataloader@2.2.2";
import { fetchAPI } from "../../utils/fetchAPI.ts";
import { Rating, Ratings, Reviews } from "./types.ts";

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
export type RatingFetcher = (productIds: string) => Promise<Rating | undefined>;
const fetcherPool: Record<
  string,
  RatingFetcher
> = {};

const sameOrder = (
  productIds: readonly string[],
  elements: Rating[],
): (Rating | undefined)[] => {
  const ordered = new Array<Rating | undefined>(productIds.length).fill(
    undefined,
  );
  for (let i = 0; i < productIds.length; i++) {
    const ratingIdx = elements.findIndex((e) => e.ProductId === productIds[i]);
    if (ratingIdx !== -1) {
      ordered[i] = elements[ratingIdx];
      elements.splice(ratingIdx, 1); // remove already found rating
    }
  }
  return ordered;
};

const getRatingFetcher = (
  { appId, token }: ConfigYourViews,
): RatingFetcher => {
  const key = `${appId}${token}`;
  if (fetcherPool[key]) {
    return fetcherPool[key];
  }
  const headers = {
    "Authorization": token,
  };

  const dl = new DataLoader((productIds: readonly string[]) =>
    fetchAPI<Ratings>(
      `${baseUrl}/api/${appId}/review/reviewshelf?${new URLSearchParams({
        page: 0,
        count: productIds.length,
        productIds: productIds.join(","),
      } as unknown as Record<string, string>)}`,
      { headers, withProxyCache: true },
    ).then((rat) => sameOrder(productIds, rat.Element))
  );
  return fetcherPool[key] = dl.load.bind(dl);
};

export const createClient = ({ token, appId }: ConfigYourViews) => {
  const headers = {
    "Authorization": token,
  };
  const batchFetcher = getRatingFetcher({ token, appId });

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000756179-buscar-as-estrelas-nas-prateleiras */
  const rating = batchFetcher;

  /** @description https://yourviews.freshdesk.com/support/solutions/articles/5000756179-buscar-as-estrelas-nas-prateleiras */
  const ratings = (
    productIds: string[],
  ) => Promise.all(productIds.map(batchFetcher));

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
