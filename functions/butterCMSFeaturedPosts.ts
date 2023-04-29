import type { LoaderFunction } from "$live/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedPosts } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSection,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const featuredPostsLoader: LoaderFunction<
  null,
  BlogSection,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const { data } = await client.pages();

  const section =
    data.fields.sections.find((section) => section.type === "featured_posts")!
      .fields;

  return { data: toFeaturedPosts(section) as BlogSection };
};

export default featuredPostsLoader;
