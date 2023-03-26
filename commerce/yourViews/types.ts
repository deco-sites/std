export interface Ratings {
  HasErrors: boolean;
  Element: Rating[];
  ErrorList: unknown[];
  Total: number;
  CurrentPage: number;
}

export interface Rating {
  ProductId: string;
  TotalRatings: number;
  Rating: number;
}

export interface Reviews {
  HasErrors: boolean;
  Element: Review[];
  ErrorList: unknown[];
  Total: number;
  CurrentPage: number;
}

export interface Review {
  ReviewId: number;
  Rating: number;
  Review: string;
  Date: Date;
  User: User;
  Product: Product;
  Likes: number;
  Dislikes: number;
  CustomFields: CustomField[];
}

export interface CustomField {
  Name: string;
  Values: string[];
}

export interface Product {
  YourviewsProductId: number;
  ProductId: string;
  Name: string;
  Url: string;
  Image: string;
}

export interface User {
  YourviewsUserId: number;
  Name: string;
  Email: string;
}
