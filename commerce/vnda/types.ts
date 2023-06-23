export type VNDASort = "newest" | "oldest" | "lowest_price" | "highest_price";

export interface ProductSearchResultVNDA {
  results: ProductGetResultVNDA[];
  aggregations: {
    min_price: number;
    max_price: number;
    properties: Record<string, Array<{ value: string; count: number }>>;
    types: Record<
      string,
      Array<{ name: string; title: string; count: number }>
    >;
  };
}

export interface ProductGetResultVNDA extends ProductBaseVNDA {
  variants: Record<string, ProductVariationVNDA>[] | ProductVariationVNDA[];
}

export interface ProductBaseVNDA {
  id: number;
  active: boolean;
  available: boolean;
  description: string;
  discount_id: number;
  image_url: string;
  installments: ProductVNDAInstallments[] | number[];
  name: string;
  on_sale: number;
  price: number;
  sale_price: number;
  reference: string;
  slug: string;
  url: string;
  discount_rule: {
    type: "fixed" | "percentage";
    amount: number;
  };
}

export interface ProductVariationVNDA extends ProductBaseVNDA {
  available_quantity: number;
  installments: number[];
  main: boolean;
  min_quantity: number;
  properties: Record<
    string,
    { name: string; value: string; defining: boolean }
  >;
  quantity: number;
  quantity_sold: number;
  sku: string;
  stock: number;
  sku_lowercase: string;
  full_name: string;
}

interface ProductVNDAInstallments {
  number: number;
  price: number;
  interest: boolean;
  interest_rate: number;
  total: number;
}

export interface ProductGetParams {
  id?: string;
}

export interface ProductSearchParams {
  term?: string;
  page?: number;
  tags?: string[];
  sort?: VNDASort;
  per_page?: number;
  wildcard?: boolean;
  type_tags?: { key: string; value: string }[];
}

export interface VNDACart {
  agent: null;
  billing_address_id: null;
  channel: string;
  client_id: null;
  code: string;
  coupon_code: null;
  discount: null;
  discount_price: number;
  // deno-lint-ignore no-explicit-any
  extra: Record<any, string>;
  id: number;
  installments: number[];
  items: Item[];
  items_count: number;
  shipping_address_id: null;
  shipping_method: null;
  // deno-lint-ignore no-explicit-any
  shipping_methods: any[];
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
  // deno-lint-ignore no-explicit-any
  extra: Record<any, string>;
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
  // deno-lint-ignore no-explicit-any
  variant_attributes: Record<any, string>;
  variant_min_quantity: number;
  variant_name: string;
  variant_price: number;
  variant_intl_price: number;
  variant_properties: VariantProperties;
  variant_sku: string;
  seller: null;
  seller_name: null;
}

export interface VariantProperties {
  property1: Property;
  property2: Property;
}

export interface Property {
  name: string;
  value: string;
  defining: boolean;
}

export interface VNDAShippingMethod {
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

export interface VNDAAddress {
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

export interface VNDAShipping {
  address: VNDAAddress;
  methods: VNDAShippingMethod[];
}

export interface VNDARelatedItemTag {
  name: string;
  title: string;
  subtitle: string;
  description: string | null;
  importance: string | null;
  type: string | null;
  image_url: string | null;
}

export interface VNDARelatedItemAttribute {
  name: string;
  mandatory: boolean;
  values: unknown[];
}

export interface VNDARelatedItemInstallment {
  number: number;
  price: number;
  interest: boolean;
  interest_rate: number;
  total: number;
}

export interface VNDAInventory {
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

export interface VNDARelatedItemVariant {
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
  installments: VNDARelatedItemInstallment[];
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
  inventories: VNDAInventory[];
  handling_days: number;
  barcode: string;
  weight: number;
  width: number;
  height: number;
  length: number;
}

export interface VNDARelatedItem {
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
  tags: VNDARelatedItemTag[];
  price: number;
  on_sale: boolean;
  sale_price: number;
  intl_price: number;
  discount_id: number;
  discount_rule: string | null;
  discount: number | null;
  images: { sku: string | null; url: string }[];
  attribute: Record<string, VNDARelatedItemAttribute>;
  variants: VNDARelatedItemVariant[];
  installments: VNDARelatedItemInstallment[];
}

export type VNDACoupon = unknown;
