import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedPosts } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSectionPosts,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title Butter CMS Featured Posts Loader
 * @description Useful for shelves and static galleries.
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
    data.fields.sections.find((section) => section.type === "featured_posts")!
      .fields;

  return { data: toFeaturedPosts(section) as BlogSectionPosts };
};

export default featuredPostsLoader;
