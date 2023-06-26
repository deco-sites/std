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

type Pagination = {
  first: string;
  last: string;
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
  specs: Record<string, any>;
  properties: {
    status: string;
    oldPrice: number;
    price: number;
    url: string;
    images: Image;
  };
  customBusiness: Record<string, any>;
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

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  url: string;
  images: Image;
  installment: any[];
  status: string;
  clickUrl: string;
  categories: Category[];
  tags: any[];
  specs: Record<string, any>;
  created: string;
  brand: string;
  collectInfo: {
    skuList: any[];
    productId: string;
  };
  cId: string;
  iId: number;
  skus: Sku[];
  details: {
    categoryName: string[];
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
