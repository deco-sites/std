import { DecoState as LiveState } from "deco/types.ts";
import { ConfigButterCMS } from "./client.ts";

export type StateButterCMS = LiveState<{ configButterCMS?: ConfigButterCMS }>;

export interface Page {
  data: PageData;
}

export interface PageData {
  slug: string;
  name: string;
  published: string;
  updated: string;
  page_type: string;
  fields: DataFields;
}

export interface DataFields {
  sections: Section[];
}

export type Section =
  | PostsSection
  | PlacesSection
  | BrandSection
  | AdSection
  | ArticleSection;

export type Fields =
  | PostFields
  | PlacesFields
  | BrandFields
  | AdFields
  | ArticleFields;

export enum FieldTypesEnum {
  Posts = "featured_posts",
  Places = "featured_places",
  Brands = "featured_brands",
  Ads = "featured_ads",
  Articles = "featured_articles",
}

export type FieldTypes =
  | "featured_posts"
  | "featured_places"
  | "featured_brands"
  | "featured_ads"
  | "featured_articles";

export interface PostsSection {
  type: FieldTypesEnum.Posts;
  fields: PostFields;
}
export interface PostFields {
  title: string;
  previews: PreviewField[];
}

export interface PlacesSection {
  type: FieldTypesEnum.Places;
  fields: PlacesFields;
}
export interface PlacesFields {
  title: string;
  places: PlaceField[];
}

export interface BrandSection {
  type: FieldTypesEnum.Brands;
  fields: BrandFields;
}
export interface BrandFields {
  title: string;
  brands: BrandField[];
}

export interface AdSection {
  type: FieldTypesEnum.Ads;
  fields: AdFields;
}
export interface AdFields {
  title: string;
  ads: AdField[];
}

export interface ArticleSection {
  type: FieldTypesEnum.Articles;
  fields: ArticleFields;
}
export interface ArticleFields {
  title: string;
  articles?: ArticleField[];
}

export interface ArticleField {
  article: Place;
}

export interface AdField {
  ad: Ad;
}

export interface Ad {
  meta: Meta;
  title: string;
  summary: string;
  category: string;
  image: string;
  image_alt: string;
  url_text: string;
  url_slug: string;
}

export interface BrandField {
  brand: Place;
}

export interface PlaceField {
  place: Place;
}

export interface Place {
  meta: Meta;
  name: string;
  catalogue_slug: string;
}

export interface PreviewField {
  preview: Preview;
}

export interface Preview {
  meta: Meta;
  title: string;
  summary: string;
  featured_image: string;
  featured_image_alt: string;
  category: string;
  slug: string;
}

export interface Meta {
  id: number;
}

export interface CategoriesData {
  data: Category[];
}

export interface Category {
  name: string;
  slug: string;
}

export interface PostsData {
  meta: PaginationMeta;
  data: Post[];
}

export interface PostData {
  meta: PaginationMeta;
  data: Post;
}

export interface Post {
  status: string;
  created: string;
  updated: string;
  published: string;
  title: string;
  slug: string;
  summary: string;
  seo_title: string;
  meta_description: string;
  featured_image_alt: string;
  url: string;
  featured_image: string;
  body?: string;
  author: Author;
  tags: Tag[];
  categories: Category[];
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Author {
  bio: string;
  slug: string;
  email: string;
  title: string;
  last_name: string;
  first_name: string;
  facebook_url: string;
  linkedin_url: string;
  instagram_url: string;
  pinterest_url: string;
  profile_image: string;
  twitter_handle: string;
}

export interface PaginationMeta {
  next_page: number;
  previous_page: number | null;
  count: number;
}

export interface BlogPlace {
  name: string;
  slug: string;
}

export interface BlogSectionPosts {
  title: string;
  posts: BlogPostPreview[];
}

export interface BlogSectionPlaces {
  title: string;
  places: BlogPlace[];
}

export interface Pagination {
  currentPage: number;
  nextPage: number;
  previousPage: number | null;
  count: number;
  pageSize: number;
}

export interface BlogPostList {
  posts: BlogPostPreview[];
  pagination: Pagination | null;
}

export type OmitedFields = {
  previews: PreviewField[];
} | {
  places: PlaceField[];
} | {
  brands: BrandField[];
} | {
  ads: AdField[];
} | {
  articles?: ArticleField[];
};

export interface BlogPost {
  title: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  category: Category;
  slug: string;
  author: string;
  tags: string[];
  body: string;
  seo: SEO;
}

export type BlogPostPreview = Omit<BlogPost, "seo" | "body" | "tags"> & {
  summary: string;
  ctaText?: string;
};

export interface SEO {
  title: string;
  description: string;
}

export interface BlogPage {
  title?: string;
  breadcrumbList?: Category[];
}
