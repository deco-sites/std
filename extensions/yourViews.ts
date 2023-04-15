import { Product } from "deco-sites/std/commerce/types.ts";
import {
  ConfigYourViews,
  RatingFetcher,
} from "deco-sites/std/commerce/yourViews/client.ts";
import { ExtensionOf } from "https://denopkg.com/deco-cx/live@3c5ca2344ff1d8168085a3d5685c57100e6bdedb/blocks/extension.ts";
import { createClient } from "../commerce/yourViews/client.ts";

export type Props = ConfigYourViews;

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

export default function AddYourViews(config: Props): ExtensionOf<Product> {
  const client = createClient(config);
  const aggregateRating = aggregateRatingFor(client.rating.bind(client));

  return {
    aggregateRating,
  };
}
