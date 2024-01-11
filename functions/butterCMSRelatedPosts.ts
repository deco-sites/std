import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toPostsPreview } from "../commerce/butterCMS/transform.ts";
import type {
  BlogPostList,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

export interface Props {
  pageSize: number;
  withPagination?: boolean;
}

/**
 * @title Butter CMS Related Posts Loader
 * @description Useful for paginated or not galleries. Works on routes of type /blog/:slug
 */
const relatedPostsLoader: LoaderFunction<
  Props,
  BlogPostList,
  StateButterCMS
> = async (
  req,
  ctx,
  { pageSize, withPagination = false },
) => {
  // @ts-ignore: global should be set
  const { state: { global: { configButterCMS } }, params: { slug } } = ctx;
  const client = createClient(configButterCMS);

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;

  const { data: { tags } } = await client.post(slug);
  const { data, meta } = await client.posts(
    page,
    pageSize + 1,
    true,
    tags[0].slug ?? "",
  );

  return {
    data: {
      posts: toPostsPreview(data.filter((post) => post.slug !== slug)),
      pagination: withPagination
        ? {
          currentPage: page,
          nextPage: meta.next_page,
          previousPage: meta.previous_page,
          count: meta.count,
          pageSize,
        }
        : null,
    },
  };
};

export default relatedPostsLoader;
