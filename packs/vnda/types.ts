export type Sort = "newest" | "oldest" | "lowest_price" | "highest_price";

export interface ProductSearchResult {
  results: ProductGroup[];
  aggregations: {
    min_price: number;
    max_price: number;
    properties: Record<string, Array<{ value: string; count: number }>>;
    types: Record<
      string,
      Array<{ name: string; title: string; count: number }>
    >;
  };
  pagination: {
    total_pages: number;
    total_count: number;
    current_page: number;
    prev_page: boolean;
    next_page: boolean;
  };
}

export type ProductGroup = Partial<{
  active: boolean;
  available: boolean;
  category_tags: string[];
  description: string;
  discount_id: number;
  html_description: string;
  id: number | string;
  image_url: string;
  installments: Installment[] | number[];
  min_quantity: number;
  name: string;
  on_sale: boolean;
  plain_description: string;
  price: number;
  product_type: string;
  rating: Rating;
  reference: string;
  sale_price: number;
  slug: string;
  tag_names: string[];
  updated_at: Date;
  url: string;
  variants: Array<Record<string, ProductVariant>> | ProductVariant[];
  discount_rule: {
    type: "fixed" | "percentage";
    amount: number;
  };
  attributes: Record<string, Attribute>;
  tags: RelatedItemTag[];
  images?: {
    id: number;
    updated_at: string;
    url: string;
    variant_ids: unknown[];
  }[];
}>;

export interface Attribute {
  name: string;
  mandatory: boolean;
  values: string[];
}

export interface Rating {
  votes: string;
  rating: string;
}

export type ProductVariant =
  & Partial<{
    full_name: string;
    id: number;
    main: boolean;
    available: boolean;
    sku: string;
    name: string;
    slug: string;
    min_quantity: number;
    quantity: number;
    quantity_sold: number;
    stock: number;
    custom_attributes: unknown | null;
    properties: Record<string, Property>;
    updated_at: Date;
    sku_lowercase: string;
    price: number;
    installments: Installment[] | number[];
    available_quantity: number;
    weight: number;
    width: number;
    height: number;
    length: number;
    handling_days: number;
    inventories: Inventory[];
    sale_price: number;
    image_url: string;
    product_id: number;
    norder: number;
    barcode: null | string;
  }>
  & Record<string, Attribute>;

export interface Property {
  name: string;
  value: null | string;
  defining: boolean;
}

export interface Cart {
  orderForm?: OrderForm;
  relatedItems?: RelatedItem[];
  shipping?: Shipping;
  coupon?: Coupon;
}

export interface Installment {
  number: number;
  price: number;
  interest: boolean;
  interest_rate: number;
  total: number;
}

export interface TagsSearchParams {
  page?: number;
  per_page?: number;
  type?: string;
  types?: string[];
  name: string;
  names?: string[];
  sort?: "asc" | "desc";
}

export interface ProductGetParams {
  id: string | number;
}

export interface ProductSearchParams {
  term?: string;
  page?: number;
  tags?: string[];
  sort?: Sort;
  per_page?: number;
  wildcard?: boolean;
  type_tags?: { key: string; value: string }[];
}

export interface OrderForm {
  agent: null;
  billing_address_id: null;
  channel: string;
  client_id: null;
  code: string;
  coupon_code: null;
  discount: null;
  discount_price: number;
  extra: Record<string, string>;
  id: number;
  installments: number[];
  items: Item[];
  items_count: number;
  shipping_address_id: null;
  shipping_method: null;
  shipping_methods: unknown[];
  shipping_price: number;
  subtotal: number;
  subtotal_discount: number;
  token: string;
  total: number;
  total_discount: number;
  total_for_deposit: number;
  total_for_slip: number;
  total_for_pix: number;
  updated_at: Date;
  rebate_token: null;
  rebate_discount: number;
  user_id: null;
  handling_days: number;
}

export interface Item {
  delivery_days: number;
  extra: Record<string, string>;
  id: number;
  place_id: null;
  price: number;
  product_id: number;
  product_name: string;
  product_reference: string;
  product_url: string;
  product_type: string;
  quantity: number;
  subtotal: number;
  total: number;
  updated_at: Date;
  has_customizations: boolean;
  available_quantity: number;
  image_url: string;
  variant_attributes: Record<string, string>;
  variant_min_quantity: number;
  variant_name: string;
  variant_price: number;
  variant_intl_price: number;
  variant_properties: Record<string, Property>;
  variant_sku: string;
  seller: null;
  seller_name: null;
}

export interface ShippingMethod {
  delivery_days: number;
  description: string;
  name: string;
  price: number;
  shipping_method_id: number;
  value: string;
  countries: string[] | null;
  fulfillment_company: string | null;
  value_needed_to_discount: number | null;
}

export interface Address {
  city: string;
  client_address_id: string | null;
  company_name: string | null;
  complement: string | null;
  email: string | null;
  first_name: string | null;
  first_phone: string | null;
  first_phone_area: string | null;
  id: string;
  last_name: string | null;
  neighborhood: string;
  reference: string | null;
  second_phone: string | null;
  second_phone_area: string | null;
  state: string;
  street_name: string;
  street_number: string;
  zip: string;
}

export interface Shipping {
  address: Address;
  methods: ShippingMethod[];
}

export interface RelatedItemTag {
  name: string;
  title: string;
  subtitle: string;
  description: string | null;
  importance: string | null;
  type: string | null;
  image_url: string | null;
}

export interface RelatedItemAttribute {
  name: string;
  mandatory: boolean;
  values: unknown[];
}

export interface RelatedItemInstallment {
  number: number;
  price: number;
  interest: boolean;
  interest_rate: number;
  total: number;
}

export interface Inventory {
  name: string | null;
  slug: string;
  available: boolean;
  price: number;
  sale_price: number;
  quantity: number;
  quantity_sold: number;
  place: {
    id: number;
    name: string;
  };
}

export interface RelatedItemVariant {
  id: number;
  sku: string;
  sku_lowercase: string;
  name: string;
  full_name: string;
  main: boolean;
  available: boolean;
  image_url: string | null;
  price: number;
  sale_price: number;
  intl_price: number;
  installments: RelatedItemInstallment[];

  stock: number;
  quantity: number;
  quantity_sold: number;
  min_quantity: number;
  available_quantity: number;
  custom_attributes: unknown | null;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  properties: Record<string, Property | null>;
  inventories: Inventory[];

  handling_days: number;
  barcode: string;
  weight: number;
  width: number;
  height: number;
  length: number;
}

export interface RelatedItem {
  id: number;
  active: boolean;
  available: boolean;
  subscription: boolean;
  slug: string;
  reference: string;
  name: string;
  description: string;
  image_url: string;
  url: string;
  tags: RelatedItemTag[];

  price: number;
  on_sale: boolean;
  sale_price: number;
  intl_price: number;
  discount_id: number;
  discount_rule: string | null;
  discount: number | null;
  images: { sku: string | null; url: string }[];
  attribute: Record<string, RelatedItemAttribute>;
  variants: RelatedItemVariant[];
  installments: RelatedItemInstallment[];
}

export type Coupon = {
  code: string;
  discount: number;
  rebate_token: string | null;
  rebate_discount: number;
};

export interface Banner {
  id: string;
  url: string | null;
  external: boolean;
  updated_at: string;
  file_uid: string;
  file_name: string;
  title: string;
  description: string | null;
  tag: string;
  norder: number;
  html_description: string;
  plain_description: string | null;
  subtitle: string | null;
  start_at: string | null;
  end_at: string | null;
  small_thumb: string;
  big_thumb: string;
  color: string | null;
}

export interface SEO {
  id: number;
  title?: string;
  description?: string | null;
  resource_type: string;
  resource_id: number;
  parent_id: null | number;
}
