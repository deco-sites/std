import type { LoaderFunction } from "$live/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedAds } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSectionPosts,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const featuredPostsLoader: LoaderFunction<
  null,
  BlogSectionPosts,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const { data } = await client.pages();

  const section =
    data.fields.sections.find((section) => section.type === "featured_ads")!
      .fields;

  return { data: toFeaturedAds(section) as BlogSectionPosts };
};

export default featuredPostsLoader;
