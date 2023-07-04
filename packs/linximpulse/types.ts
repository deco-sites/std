type Value = {
  label: string;
  size: number;
  idO?: string;
  id: number;
  applyLink: string;
};

type Filter = {
  id: number;
  attribute: string;
  type: string;
  fType?: number;
  values: Value[];
};

type MinMaxValue = {
  value: number;
  unity: string;
  minN?: number;
  maxN?: number;
};

type ContinuousValue = {
  size: number;
  unityId: number;
  unN: string;
  min: MinMaxValue;
  max: MinMaxValue;
  applyLink: string;
};

type DiscreteValue = {
  label: string;
  size: number;
  id: number;
  applyLink: string;
};

export type Pagination = {
  first: string;
  last: string;
  next: string;
  previous: string;
};

type Category = {
  id: string;
  name: string;
  parents: string[];
  used: boolean;
};

type Image = {
  default: string;
};

type Sku = {
  sku: string;
  // deno-lint-ignore no-explicit-any
  specs: Record<string, any>;
  properties: {
    status: string;
    oldPrice: number;
    price: number;
    url: string;
    images: Image;
  };
  // deno-lint-ignore no-explicit-any
  customBusiness: Record<string, any>;

  details: {
    measurement: {
      multiplier: number;
      unit: string;
    };
    referenceId: string;
    skuSellers: {
      sku: string;
      sellerId: string;
      sellerName: string;
      sellerDefault: boolean;
    };
    ratingCount: number;
    ratingValue: number;
  };
  eanCode: string;
  images: {
    [key: string]: string;
  };
  installment: {
    count: number;
    price: number;
  };
  name: string;
  oldPrice: number;
  price: number;
  status: string;
  stock: number;
  url: string;
};

type CustomBusiness = {
  search: {
    ads: {
      boost: boolean;
    };
  };
  ads: {
    clickLink: string;
    pageViewLink: string;
    view: string;
  };
};

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  url: string;
  images: Image;
  installment: {
    count: number;
    price: number;
  };
  status: string;
  clickUrl: string;
  categories: Category[];
  // deno-lint-ignore no-explicit-any
  tags: any[];
  // deno-lint-ignore no-explicit-any
  specs: Record<string, any>;
  created: string;
  brand: string;
  collectInfo: {
    // deno-lint-ignore no-explicit-any
    skuList: any[];
    productId: string;
  };
  cId: string;
  iId: number;
  skus: Sku[];
  details: {
    [key: string]: string | string[] | Record<string, string> | undefined;
  };
  description: string;
  customBusiness: CustomBusiness;  
};

type QuickFilter = {
  name: string;
  applyLink: string;
  image: string;
  type: "url";
};

type Query = {
  query: string;
  link: string;
};

type Banner = {
  header: string;
  left: string;
};

type Queries = {
  original: string;
  normalized: string;
  processed: string;
  queryType: string;
};

export type SearchResponse = {
  requestId: string;
  searchId: string;
  filters: Filter[];
  size: number;
  pagination: Pagination;
  products: Product[];
  suggestions: Query[];
  banners: Banner[];
  quickFilters: QuickFilter[];
  queries: Queries;
};

export type Sort =
  | "relevance"
  | "pid"
  | "ascPrice"
  | "descPrice"
  | "descDate"
  | "ascSold"
  | "descSold"
  | "ascReview"
  | "descReview"
  | "descDiscount";
