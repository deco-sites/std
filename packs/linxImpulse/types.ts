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

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  url: string;
  images: ImageSizes;
  brand: string;
  installment: {
    count: number;
    price: number;
  };
  status: string;
  categories: Category[];
  details: {
    [key: string]: string | string[] | Record<string, string> | undefined;
  };
  skus: Sku[];
  trackingUrl: string;
};
