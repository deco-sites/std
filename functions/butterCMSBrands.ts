import type { LoaderFunction } from "$live/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedPlaces } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSectionPlaces,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const featuredPostsLoader: LoaderFunction<
  null,
  BlogSectionPlaces,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const { data } = await client.pages();

  const section =
    data.fields.sections.find((section) => section.type === "featured_brands")!
      .fields;

  return { data: toFeaturedPlaces(section) as BlogSectionPlaces };
};

export default featuredPostsLoader;
