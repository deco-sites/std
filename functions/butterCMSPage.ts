import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import type { BlogPage, StateButterCMS } from "../commerce/butterCMS/types.ts";

/**
 * @title Butter CMS Page Loader
 * @description Works com any page to retrive page informations like title or breadcrumb
 */
const blogPageLoader: LoaderFunction<
  null,
  BlogPage,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const {
    state: { global: { configButterCMS } },
    params: { slug, categorySlug },
  } = ctx;
  const client = createClient(configButterCMS);

  if (slug) {
    const { data } = await client.post(slug);

    return {
      data: {
        breadcrumbList: [...data.categories, { name: data.title, slug: "" }],
        title: data.title,
      },
    };
  }

  const { data } = await client.categories();
  const currentCategory = data.find((category) =>
    category.slug === categorySlug
  );

  return {
    data: {
      breadcrumbList: currentCategory ? [currentCategory] : [],
      title: currentCategory?.name || "Kavak Blog",
    },
  };
};

export default blogPageLoader;
