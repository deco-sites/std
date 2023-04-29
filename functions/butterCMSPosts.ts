import type { LoaderFunction } from "$live/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toPostsPreview } from "../commerce/butterCMS/transform.ts";
import type {
  BlogPostList,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

export interface Props {
  pageSize: number;
}

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
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
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;

  const { data, meta } = await client.posts(page, pageSize, true);

  return {
    data: {
      posts: toPostsPreview(data),
      pagination: {
        currentPage: page,
        nextPage: meta.next_page,
        previousPage: meta.previous_page,
        count: meta.count,
      },
    },
  };
};

export default postsLoader;
