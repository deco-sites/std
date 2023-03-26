export interface ConfigVNDA {
  /**
   * @description Your VNDA domain name. For example, https://mystore.vnda.com.br
   */
  domain: string;

  /**
   * @description The token generated from admin panel. Read here: https://developers.vnda.com.br/docs/chave-de-acesso-e-requisicoes. Do not add any other permissions than catalog.
   */
  authToken: string;

  /**
   * @description Define if sandbox environment should be used
   */
  useSandbox: boolean;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;
}

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
  extra: Record<any, string>;
  id: number;
  installments: number[];
  items: Item[];
  items_count: number;
  shipping_address_id: null;
  shipping_method: null;
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
