import type { FnContext } from "$live/types.ts";

export interface ConfigNuvemShop {
  /**
   * @description Header to define our app. For example, https://tiendanube.github.io/api-documentation/intro#authentication.
   */
  userAgent: string;

  /**
   * @description The token generated from admin panel. Read here: https://tiendanube.github.io/api-documentation/authentication.
   */
  accessToken: string;

  /**
   * @description The id of the store in nuvemshop. CHeck: https://tiendanube.github.io/api-documentation/intro#making-a-request.
   */
  storeId: string;
}

// https://tiendanube.github.io/api-documentation/resources/product
export interface ProductBaseNuvemShop {
  id: number;
  name: LanguageTypes;
  description: LanguageTypes;
  handle: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  categories: Category[];
  brand: string;
  published: boolean;
  free_shipping: boolean;
  video_url: string;
  seo_title: string;
  seo_description: string;
  attributes: string[];
  tags: string;
  created_at: Date;
  updated_at: Date;
  requires_shipping: boolean;
}
export interface ProductVariant {
  id: number;
  name?: string;
  image_id: string;
  product_id: number;
  price?: number;
  promotional_price?: number;
  stock_management?: boolean;
  stock?: string;
  weight: number;
  width: number;
  height: number;
  depth: number;
  sku: string;
  values: LanguageTypes[];
  barcode: string;
  mpn: string;
  age_group: "newborn" | "infant" | "toddler" | "kids" | "adult";
  gender: "female" | "male" | "unisex";
  cost?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImage {
  id: number;
  product_id: number;
  src: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  alt: string;
}

export interface Category {
  id: number;
  name: LanguageTypes;
  description: LanguageTypes;
  handle: string[];
  parent?: number;
  subcategories: number[];
  google_shopping_category: string;
  created_at: Date;
  updated_at: Date;
}

export type NuvemShopSort =
  | "user"
  | "price-ascending, cost-ascending"
  | "price-descending, cost-descending"
  | "alpha-ascending, name-ascending"
  | "alpha-descending, name-descending"
  | "created-at-ascending"
  | "created-at-descending"
  | "best-selling";

export interface ProductSearchParams {
  q?: string;
  page?: number;
  sort?: NuvemShopSort;
  per_page?: number;
  type_tags?: { key: string; value: string }[];
}

export interface LanguageTypes {
  pt?: string;
  en?: string;
  es?: string;
}

export type Context = FnContext<{
  configNuvemShop?: ConfigNuvemShop;
}>;

function account(acc: ConfigNuvemShop) {
  return acc;
}

export default account;
