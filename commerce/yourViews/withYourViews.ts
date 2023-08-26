import type { LiveState, LoaderFunction } from "deco/types.ts";
import type {
  Product,
  ProductDetailsPage,
  ProductListingPage,
} from "../types.ts";
import { ConfigYourViews, createClient } from "./client.ts";
import type { Ratings } from "./types.ts";

export const addRatingsToProduct =
  (ratings: Ratings) => (product: Product): Product => {
    const productId = getProductId(product);
    const rating = ratings.Element.find((rating) =>
      rating.ProductId === productId
    );

    return {
      ...product,
      aggregateRating: rating
        ? {
          "@type": "AggregateRating",
          ratingCount: rating.TotalRatings,
          ratingValue: rating.Rating,
        }
        : undefined,
    };
  };

const getProductId = (product: Product) => product.isVariantOf!.productGroupID;

export const withYourViews = <
  Props,
  Data extends ProductDetailsPage | Product[] | ProductListingPage | null,
  Global extends { configYourViews: ConfigYourViews | undefined },
>(
  loader: LoaderFunction<Props, Data, LiveState<Global>>,
): LoaderFunction<Props, Data, LiveState<Global>> =>
async (req, ctx, props) => {
  const response = await loader(req, ctx, props);

  if (response.data == null) {
    return response;
  }

  if (!ctx.state.global.configYourViews) {
    console.error(
      "Missing configuration from YourViews instegration. Open Deco admin and set YourViews appId and token on global sections at Library",
    );

    return response;
  }

  const client = createClient(ctx.state.global.configYourViews);

  if (Array.isArray(response.data)) {
    const productIds = response.data.map(getProductId);

    const ratings = await client.ratings({ productIds });

    return {
      ...response,
      data: response.data.map(addRatingsToProduct(ratings)) as Data,
    };
  }

  if (response.data["@type"] === "ProductDetailsPage") {
    const productId = getProductId(response.data.product);

    const ratings = await client.rating({ productId });

    return {
      ...response,
      data: {
        ...response.data,
        product: addRatingsToProduct(ratings)(response.data.product),
      },
    };
  }

  if (response.data["@type"] === "ProductListingPage") {
    const productIds = response.data.products.map(getProductId);

    const ratings = await client.ratings({ productIds });

    return {
      ...response,
      data: {
        ...response.data,
        products: response.data.products.map(addRatingsToProduct(ratings)),
      },
    };
  }

  return response;
};
