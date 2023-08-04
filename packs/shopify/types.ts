import {
  CountryCode,
  CurrencyCode,
  OrderCancelReason,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "./enums.ts";

type Attribute = {
  key: string;
  value?: string;
};

type MailingAddress = {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  countryCodeV2?: CountryCode;
  firstName?: string;
  formattedArea?: string;
  id: string;
  lastName?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  phone?: string;
  province?: string;
  provinceCode?: string;
  zip?: string;
};

type MoneyV2 = {
  amount: number;
  currencyCode: CurrencyCode;
};

type AppliedGiftCard = {
  amountUsed: MoneyV2;
  balance: MoneyV2;
  id: string;
  lastCharacters: string;
  presentmentAmountUsed: MoneyV2;
};

type ShippingRate = {
  handle: string;
  price: MoneyV2;
  title: string;
};

type AvailableShippingRates = {
  ready: boolean;
  shippingRates?: ShippingRate[];
};

type CheckoutBuyerIdentity = {
  countryCode: CountryCode;
};

type Order = {
  billingAddress?: MailingAddress;
  cancelReason?: OrderCancelReason;
  canceledAt?: Date;
  currencyCode: CurrencyCode;
  currentSubtotalPrice: MoneyV2;
  currentTotalDuties?: MoneyV2;
  currentTotalPrice: MoneyV2;
  currentTotalTax: MoneyV2;
  customAttributes: Attribute[];
  customerLocale?: string;
  customerUrl?: string;
  edited: boolean;
  email?: string;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  id: string;
  name: string;
  orderNumber: number;
  originalTotalDuties?: MoneyV2;
  originalTotalPrice: MoneyV2;
  phone?: string;
  processedAt: Date;
  shippingAddress?: MailingAddress;
};

type Checkout = {
  appliedGiftCards: AppliedGiftCard[];
  availableShippingRates?: AvailableShippingRates;
  buyerIdentity: CheckoutBuyerIdentity;
  completedAt?: Date;
  createdAt: Date;
  currencyCode: CurrencyCode;
  customAttributes: Attribute[];
  email?: string;
  id: string;
  lineItemsSubtotalPrice: MoneyV2;
  note: string;
  order: Order;
  orderStatusUrl: string;
  paymentDue: MoneyV2;
  ready: boolean;
  requireShipping: boolean;
  shippingAddress: MailingAddress;
};

type Customer = {
  acceptsMarketing: boolean;
  createdAt: Date;
  defaultAddress: MailingAddress;
  displayName: string;
  email: string;
  firstName: string;
  id: string;
  checkout: Checkout;
};

type CartBuyerIdentity = {
  countryCode: string;
  customer: Customer;
};

export type Cart = {
  attribute?: Attribute;
  attributes?: Attribute[];
  buyerIdentity?: CartBuyerIdentity;
  id: string;
};
