import { Account } from "deco/blocks/account.ts";
import { fetchAPI } from "../../utils/fetch.server.ts";
import { CategoriesData, Page, PostData, PostsData } from "./types.ts";

export interface Locale {
  /**
   * @title Locale
   */
  label: string;
  authToken: string;
}

export interface ConfigButterCMS extends Account {
  locales: Locale[];
  /**
   * @description Default value: en-us
   * @default en-us
   */
  defaultLocale: string;
  /**
   * @description Default value: v2
   * @default v2
   */
  apiVersion?: string;
}

export type ClientOCC = ReturnType<typeof createClient>;

const BASE_URL = `https://api.buttercms.com`;

export const createClient = (
  { locales = [], apiVersion = "v2", defaultLocale = "en-us" }: Partial<
    ConfigButterCMS
  > = {},
) => {
  const authToken =
    locales.find((locale) => locale.label === defaultLocale)?.authToken ?? "";

  const categories = () => {
    const params = new URLSearchParams({
      auth_token: authToken,
    });

    const url = new URL(
      `/${apiVersion}/categories?${params.toString()}`,
      BASE_URL,
    );

    return fetchAPI<CategoriesData>(url);
  };

  const post = (slug: string) => {
    const params = new URLSearchParams({
      auth_token: authToken,
    });

    const url = new URL(
      `/${apiVersion}/posts/${slug}?${params.toString()}`,
      BASE_URL,
    );

    return fetchAPI<PostData>(url);
  };

  const posts = (
    page: number,
    pageSize: number,
    excludeBody = true,
    tagSlug?: string,
    categorySlug?: string,
  ) => {
    const params = new URLSearchParams({
      auth_token: authToken,
      page: page.toString(),
      page_size: pageSize.toString(),
      exclude_body: excludeBody.toString(),
      category_slug: categorySlug ?? "",
      tag_slug: tagSlug ?? "",
    });

    const url = new URL(
      `/${apiVersion}/posts?${params.toString()}`,
      BASE_URL,
    );

    return fetchAPI<PostsData>(url);
  };

  const pages = (locale = defaultLocale) => {
    const params = new URLSearchParams({
      auth_token: authToken,
      /**
       * @todo after add locales logic there is no use of defaultLocale
       */
      locale,
    });

    const url = new URL(
      `/${apiVersion}/pages/*/blog-v2?${params.toString()}`,
      BASE_URL,
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
