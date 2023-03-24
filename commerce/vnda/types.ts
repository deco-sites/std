export interface ConfigVNDA {
  /**
   * @description Your VNDA domain name. For example, https://mystore.vnda.com.br
   */
  domain: string;

  /**
   * @description The token generated from admin panel. Read here: https://developers.vnda.com.br/docs/chave-de-acesso-e-requisicoes
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
