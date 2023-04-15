import { Product } from "deco-sites/std/commerce/types.ts";
import {
  ConfigYourViews,
  createClient,
} from "deco-sites/std/commerce/yourViews/client.ts";
import { ExtensionOf } from "https://denopkg.com/deco-cx/live@3c5ca2344ff1d8168085a3d5685c57100e6bdedb/blocks/extension.ts";
import DataLoader from "https://esm.sh/dataloader@2.2.2";
import { Rating } from "../commerce/yourViews/types.ts";

export type Props = ConfigYourViews;

type RatingFetcher = (productId: string) => Promise<Rating | undefined>;
const aggregateRatingFor =
  (fetcher: RatingFetcher) => async ({ isVariantOf }: Product) => {
    const productId = isVariantOf!.productGroupID;
    const rating = await fetcher(productId);

    return rating
      ? {
        "@type": "AggregateRating" as const,
        ratingCount: rating.TotalRatings,
        ratingValue: rating.Rating,
      }
      : undefined;
  };

const fetcherPool: Record<
  string,
  RatingFetcher
> = {};

const getFetcher = (
  config: Props,
): RatingFetcher => {
  const key = `${config.appId}${config.token}`;
  if (fetcherPool[key]) {
    return fetcherPool[key];
  }
  const client = createClient(config);
  const dl = new DataLoader((productIds: readonly string[]) =>
    client.ratings({ productIds: productIds as string[] }).then((rat) =>
      sameOrder(productIds, rat.Element)
    )
  );
  return fetcherPool[key] = dl.load.bind(dl);
};

export default function AddYourViews(config: Props): ExtensionOf<Product> {
  const client = getFetcher(config);
  const aggregateRating = aggregateRatingFor(client);

  return {
    aggregateRating,
  };
}

const sameOrder = (
  productIds: readonly string[],
  elements: Rating[],
): (Rating | undefined)[] => {
  const ordered = new Array<Rating | undefined>(productIds.length);
  for (let i = 0; i < productIds.length; i++) {
    ordered[i] = elements.find((e) => e.ProductId === productIds[i]);
  }
  return ordered;
};
