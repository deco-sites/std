import { Account } from "$live/blocks/account.ts";
import { fetchAPI } from "../../utils/fetchAPI.ts";
import { CategoriesData, Page, PostsData } from "./types.ts";

export interface ConfigButterCMS extends Account {
  authToken: string;
  /**
   * @description Default value: v2
   */
  apiVersion: string;
  defaultLocale: string;
}

export type ClientOCC = ReturnType<typeof createClient>;

export const createClient = (
  { authToken = "", apiVersion = "v2", defaultLocale = "en-us" }: Partial<
    ConfigButterCMS
  > = {},
) => {
  const baseUrl = `https://api.buttercms.com/${apiVersion}`;

  const categories = () => {
    const params = new URLSearchParams({
      authToken,
    });

    const url = new URL(`/categories?${params.toString()}`, baseUrl);

    return fetchAPI<CategoriesData>(url);
  };

  const post = (slug: string) => {
    const params = new URLSearchParams({
      authToken,
    });

    const url = new URL(
      `/posts/${slug}?auth_token=?${params.toString()}`,
      baseUrl,
    );

    return fetchAPI<PostsData>(url);
  };

  const posts = (
    page: number,
    pageSize: number,
    excludeBody = true,
    tagSlug?: string,
  ) => {
    const params = new URLSearchParams({
      authToken,
      page: page.toString(),
      pageSize: pageSize.toString(),
      excludeBody: excludeBody.toString(),
      tagSlug: tagSlug ?? "",
    });

    const url = new URL(
      `/posts?auth_token=?${params.toString()}`,
      baseUrl,
    );

    return fetchAPI<PostsData>(url);
  };

  const pages = (locale?: string) => {
    const params = new URLSearchParams({
      authToken,
      /**
       * @todo after add locales logic there is no use of defaultLocale
       */
      locale: locale ?? defaultLocale,
    });

    const url = new URL(
      `/pages/*/blog-v2?auth_token=?${params.toString()}`,
      baseUrl,
    );

    return fetchAPI<Page>(url);
  };

  return {
    categories,
    posts,
    post,
    pages,
  };
};
