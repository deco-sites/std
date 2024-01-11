import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toPostsPreview } from "../commerce/butterCMS/transform.ts";
import type {
  BlogPostList,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

export interface Props {
  /**
   * @description Used to declare the size of results
   */
  pageSize: number;
}

/**
 * @title Butter CMS Posts Loader
 * @description Useful for paginated galleries.
 */
const postsLoader: LoaderFunction<
  Props,
  BlogPostList,
  StateButterCMS
> = async (
  req,
  ctx,
  { pageSize = 6 },
) => {
  // @ts-ignore: global should be set
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;

  const { data, meta } = await client.posts(
    page,
    pageSize,
    true,
    ctx.params.searchText,
    ctx.params.categorySlug,
  );

  return {
    data: {
      posts: toPostsPreview(data),
      pagination: {
        currentPage: page,
        nextPage: meta.next_page,
        previousPage: meta.previous_page,
        count: meta.count,
        pageSize,
      },
    },
  };
};

export default postsLoader;
