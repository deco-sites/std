export type ImageSizes = {
  [key: string]: string;
};

export type Category = {
  id: string;
  name: string;
  parents: string[];
  used?: boolean;
};

export type Sku = {
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
  images: ImageSizes;
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
  sku: string;
  specs: Record<string, unknown>;
  customBusiness?: Record<string, unknown>;
};

interface ProductCommon {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  url: string;
  images: ImageSizes;
  installment: {
    count: number;
    price: number;
  };
  status: string;
  categories: Category[];
  brand: string;
  details: {
    [key: string]: string | string[] | Record<string, string> | undefined;
  };
}

export type ProductLinxImpulseRecommendations = ProductCommon & {
  skus: Sku[];
  trackingUrl: string;
};

export type ProductLinxImpulse = ProductCommon & {
  skus: {
    sku: string;
    specs?: Record<string, unknown>;
    properties: Sku;
  }[];
  collectInfo?: {
    productId?: string;
    skuList?: string[];
  };
  clickUrl?: string;
  cId?: string;
  iId?: number;
  specs?: Record<string, unknown>;
  created?: string;
};

export type Sort =
  | ""
  | "descDiscount"
  | "relevance"
  | "ascPrice"
  | "descPrice"
  | "descDate"
  | "descSold"
  | "pid"
  | "descReview"
  | "ascReview"
  | "ascSold";

interface Suggestions {
  query: string;
  link: string;
}

interface FilterValue {
  label: string;
  size: number;
  idO: string;
  id: number;
  applyLink: string;
}

interface Filter {
  id: number;
  attribute: string;
  type: string;
  fType: number;
  values: FilterValue[];
}

interface Pagination {
  first: string;
  last: string;
  next?: string;
}

interface SortOption {
  label: string;
  name: string;
  type: string;
  applyLink: string;
}

interface Queries {
  original: string;
  normalized: string;
  processed: string;
  queryType: string;
}

export interface SearchProductsResponse {
  requestId: string;
  searchId: string;
  suggestions?: Suggestions[];
  filters: Filter[];
  size: number;
  pagination: Pagination;
  products: ProductLinxImpulse[];
  sort: SortOption[];
  queries: Queries;
}

export interface SelectedFacet {
  key: string;
  value: string;
}

export interface SearchParams {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  hideUnavailableItems: boolean;
}
