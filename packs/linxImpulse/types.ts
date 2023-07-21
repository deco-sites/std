export type ImageSizes = {
  [key: string]: string;
};

export type Category = {
  id: string;
  name: string;
  parents: string[];
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
  customBusiness: Record<string, unknown>;
};

export interface ProductCommon {
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

export type Query = {
  query: string;
  link: string;
};
