import { LiveState } from "$live/types.ts";
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

export interface PostsSection {
  type: "featured_posts";
  fields: PostFields;
}
export interface PostFields {
  title: string;
  previews: PreviewField[];
}

export interface PlacesSection {
  type: "featured_places";
  fields: PlacesFields;
}
export interface PlacesFields {
  title: string;
  places: PlaceField[];
}

export interface BrandSection {
  type: "featured_brands";
  fields: BrandFields;
}
export interface BrandFields {
  title: string;
  brands: BrandField[];
}

export interface AdSection {
  type: "featured_ads";
  fields: AdFields;
}
export interface AdFields {
  title: string;
  ads: AdField[];
}

export interface ArticleSection {
  type: "featured_articles";
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
  meta: Meta;
  data: Post[];
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
  author: Author;
  tags: Tag[];
  categories: Tag[];
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

export interface Meta {
  next_page: number;
  previous_page?: number;
  count: number;
}

export interface BlogPost {
  title: string;
  summary?: string;
  image: string;
  imageAlt: string;
  category: string;
  slug: string;
}

export interface BlogPlace {
  name: string;
  slug: string;
}

export interface BlogSectionPosts {
  title: string;
  posts: BlogPost[];
}

export interface BlogSectionPlaces {
  title: string;
  places: BlogPlace[];
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
