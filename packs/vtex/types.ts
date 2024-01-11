import type { Account } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { FnContext } from "deco/types.ts";
import type { Manifest } from "../../live.gen.ts";

/** @description Equivalent to sku ID in VTEX platform */
export type ProductID = string;

export interface OrderForm {
  orderFormId: string;
  salesChannel: string;
  loggedIn: boolean;
  isCheckedIn: boolean;
  storeId: null;
  checkedInPickupPointId: null;
  allowManualPrice: boolean;
  canEditData: boolean;
  userProfileId: null;
  userType: null;
  ignoreProfileData: boolean;
  value: number;
  messages: Message[];
  items: OrderFormItem[];
  selectableGifts: unknown[];
  totalizers: Totalizer[];
  shippingData: ShippingData;
  clientProfileData: ClientProfileData | null;
  paymentData: PaymentData;
  marketingData: MarketingData;
  sellers: Seller[];
  clientPreferencesData: ClientPreferencesData;
  commercialConditionData: null;
  storePreferencesData: StorePreferencesData;
  giftRegistryData: null;
  openTextField: null;
  invoiceData: null;
  customData: null;
  itemMetadata: ItemMetadata;
  hooksData: null;
  ratesAndBenefitsData: RatesAndBenefitsData;
  subscriptionData: null;
  merchantContextData: null;
  itemsOrdination: null;
}

export interface ClientProfileData {
  email: string;
  firstName: null;
  lastName: null;
  document: null;
  documentType: null;
  phone: null;
  corporateName: null;
  tradeName: null;
  corporateDocument: null;
  stateInscription: null;
  corporatePhone: null;
  isCorporate: boolean;
  profileCompleteOnLoading: boolean;
  profileErrorOnLoading: boolean;
  customerClass: null;
}

export interface ClientPreferencesData {
  locale: string;
  optinNewsLetter: null;
}

export interface ItemMetadata {
  items: ItemMetadataItem[];
}

export interface ItemMetadataItem {
  id: string;
  seller: string;
  name: string;
  skuName: string;
  productId: string;
  refId: string;
  ean: null | string;
  imageUrl: string;
  detailUrl: string;
  assemblyOptions: AssemblyOption[];
}

export interface AssemblyOption {
  id: Name;
  name: Name;
  required: boolean;
  inputValues: Schema;
  composition: null;
}

export enum Name {
  AlternativeSubstitute = "ALTERNATIVE_SUBSTITUTE",
  Substituto = "Substituto",
}

export interface Schema {
  Sku: Ean;
  Price: Ean;
  Qtde?: Ean;
  EAN: Ean;
  Measuremt_unit: Ean;
  Unit_multiplier: Ean;
  Quantity: Ean;
}

export interface Ean {
  maximumNumberOfCharacters: number;
  domain: unknown[];
}

export interface OrderFormItem {
  uniqueId: string;
  id: string;
  productId: string;
  productRefId: string;
  refId: string;
  ean: null | string;
  name: string;
  skuName: string;
  modalType: null | string;
  parentItemIndex: null;
  parentAssemblyBinding: null;
  assemblies: unknown[];
  priceValidUntil: Date;
  tax: number;
  price: number;
  listPrice: number;
  manualPrice: null;
  manualPriceAppliedBy: null;
  sellingPrice: number;
  rewardValue: number;
  isGift: boolean;
  additionalInfo: AdditionalInfo;
  preSaleDate: null;
  productCategoryIds: string;
  productCategories: { [key: string]: string };
  quantity: number;
  seller: string;
  sellerChain: string[];
  imageUrl: string;
  detailUrl: string;
  components: Component[];
  bundleItems: unknown[];
  attachments: unknown[];
  attachmentOfferings: AttachmentOffering[];
  offerings: unknown[];
  priceTags: PriceTag[];
  availability: string;
  measurementUnit: string;
  unitMultiplier: number;
  manufacturerCode: null;
  priceDefinition: PriceDefinition;
}

export interface AdditionalInfo {
  dimension: null;
  brandName: null | string;
  brandId: null | string;
  offeringInfo: null;
  offeringType: null;
  offeringTypeId: null;
}

export interface AttachmentOffering {
  name: Name;
  required: boolean;
  schema: Schema;
}

export interface Component {
  uniqueId: string;
  id: string;
  productId: null;
  productRefId: null;
  refId: string;
  ean: string;
  name: string;
  skuName: null;
  modalType: null;
  parentItemIndex: null;
  parentAssemblyBinding: null;
  assemblies: unknown[];
  priceValidUntil: null;
  tax: number;
  price: number;
  listPrice: null;
  manualPrice: null;
  manualPriceAppliedBy: null;
  sellingPrice: number;
  rewardValue: number;
  isGift: boolean;
  additionalInfo: AdditionalInfo;
  preSaleDate: null;
  productCategoryIds: null;
  productCategories: AvailableAssociations;
  quantity: number;
  seller: null;
  sellerChain: null[];
  imageUrl: null;
  detailUrl: null;
  components: unknown[];
  bundleItems: unknown[];
  attachments: unknown[];
  attachmentOfferings: unknown[];
  offerings: unknown[];
  priceTags: PriceTag[];
  availability: null;
  measurementUnit: string;
  unitMultiplier: number;
  manufacturerCode: null;
  priceDefinition: PriceDefinition;
}

export interface PriceDefinition {
  calculatedSellingPrice: number;
  total: number;
  sellingPrices: SellingPrice[];
}

export interface SellingPrice {
  value: number;
  quantity: number;
}

export interface PriceTag {
  name: string;
  value: number;
  rawValue: number;
  isPercentual: boolean;
  identifier: string;
  owner: string;
}

export type AvailableAssociations = Record<string, string>;

export interface MarketingData {
  utmSource: string;
  utmMedium: null;
  utmCampaign: string;
  // @ts-ignore this should work.
  utmipage: null;
  utmiPart: null;
  utmiCampaign: null;
  coupon: null;
  marketingTags: string[];
}

export interface Message {
  code: null | string;
  text: string;
  status: string;
  fields: Fields;
}

export interface Fields {
  ean?: string;
  itemIndex?: string;
  skuName?: string;
}

export interface PaymentData {
  updateStatus: string;
  installmentOptions: InstallmentOption[];
  paymentSystems: PaymentSystem[];
  payments: unknown[];
  giftCards: unknown[];
  giftCardMessages: unknown[];
  availableAccounts: unknown[];
  availableTokens: unknown[];
  availableAssociations: AvailableAssociations;
}

export interface InstallmentOption {
  paymentSystem: string;
  bin: null;
  paymentName: null;
  paymentGroupName: null;
  value: number;
  installments: CartInstallment[];
}

export interface CartInstallment {
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
  sellerMerchantInstallments?: Installment[];
  id?: ID;
}

export enum ID {
  Carrefourbrfood = "CARREFOURBRFOOD",
}

export interface PaymentSystem {
  id: number;
  name: string;
  groupName: string;
  validator: Validator;
  stringId: string;
  template: string;
  requiresDocument: boolean;
  displayDocument: boolean;
  isCustom: boolean;
  description: null | string;
  requiresAuthentication: boolean;
  dueDate: Date;
  availablePayments: null;
}

export interface Validator {
  regex: null | string;
  mask: null | string;
  cardCodeRegex: CardCodeRegex | null;
  cardCodeMask: null | string;
  weights: number[] | null;
  useCvv: boolean;
  useExpirationDate: boolean;
  useCardHolderName: boolean;
  useBillingAddress: boolean;
}

export enum CardCodeRegex {
  The093$ = "^[0-9]{3}$",
  The094$ = "^[0-9]{4}$",
}

export interface RatesAndBenefitsData {
  rateAndBenefitsIdentifiers: RateAndBenefitsIdentifier[];
  teaser: unknown[];
}

export interface RateAndBenefitsIdentifier {
  id: string;
  name: string;
  featured: boolean;
  description: string;
  matchedParameters: MatchedParameters;
  additionalInfo: null;
}

export interface MatchedParameters {
  "Seller@CatalogSystem": string;
  "productCluster@CatalogSystem"?: string;
  "zipCode@Shipping"?: string;
  slaIds?: string;
}

export interface Seller {
  id: string;
  name: string;
  logo: string;
}

export interface ShippingData {
  address: Address;
  logisticsInfo: LogisticsInfo[];
  selectedAddresses: Address[];
  availableAddresses: Address[];
  pickupPoints: PickupPoint[];
}

export interface Address {
  addressType: string;
  receiverName: null;
  addressId: string;
  isDisposable: boolean;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  street: string;
  number: null | string;
  neighborhood: string;
  complement: null | string;
  reference: null;
  geoCoordinates: number[];
}

export interface LogisticsInfo {
  itemIndex: number;
  selectedSla: SelectedSla | null;
  selectedDeliveryChannel: SelectedDeliveryChannel;
  addressId: string;
  slas: Sla[];
  shipsTo: string[];
  itemId: string;
  deliveryChannels: DeliveryChannel[];
}

export interface DeliveryChannel {
  id: SelectedDeliveryChannel;
}

export enum SelectedDeliveryChannel {
  Delivery = "delivery",
  PickupInPoint = "pickup-in-point",
}

export enum SelectedSla {
  ClickRetireRJS = "Click & Retire (RJS)",
  Normal = "Normal",
}

export interface Sla {
  id: SelectedSla;
  deliveryChannel: SelectedDeliveryChannel;
  name: SelectedSla;
  deliveryIds: DeliveryID[];
  shippingEstimate: string;
  shippingEstimateDate: null;
  lockTTL: null;
  availableDeliveryWindows: AvailableDeliveryWindow[];
  deliveryWindow: null;
  price: number;
  listPrice: number;
  tax: number;
  pickupStoreInfo: PickupStoreInfo;
  pickupPointId: null | string;
  pickupDistance: number | null;
  polygonName: string;
  transitTime: string;
}

export interface AvailableDeliveryWindow {
  startDateUtc: Date;
  endDateUtc: Date;
  price: number;
  lisPrice: number;
  tax: number;
}

export interface DeliveryID {
  courierId: string;
  warehouseId: string;
  dockId: string;
  courierName: string;
  quantity: number;
  kitItemDetails: unknown[];
}

export interface PickupStoreInfo {
  isPickupStore: boolean;
  friendlyName: null | string;
  address: Address | null;
  additionalInfo: null | string;
  dockId: null;
}

export interface PickupPoint {
  friendlyName: string;
  address: Address;
  additionalInfo: string;
  id: string;
  businessHours: BusinessHour[];
}

export interface BusinessHour {
  DayOfWeek: number;
  OpeningTime: string;
  ClosingTime: string;
}

export interface StorePreferencesData {
  countryCode: string;
  saveUserData: boolean;
  timeZone: string;
  currencyCode: string;
  currencyLocale: number;
  currencySymbol: string;
  currencyFormatInfo: CurrencyFormatInfo;
}

export interface CurrencyFormatInfo {
  currencyDecimalDigits: number;
  currencyDecimalSeparator: string;
  currencyGroupSeparator: string;
  currencyGroupSize: number;
  startsWithCurrencySymbol: boolean;
}

export interface Totalizer {
  id: string;
  name: string;
  value: number;
  alternativeTotals?: Totalizer[];
}

export interface OrderFormItemInput {
  id?: number;
  index?: number;
  quantity?: number;
  seller?: string;
  uniqueId?: string;
  // options?: AssemblyOptionInput[]
}

export interface LegacySearchArgs {
  query?: string;
  page: number;
  count: number;
  type: "product_search" | "facets";
  selectedFacets?: SelectedFacet[];
  sort?: LegacySort;
}

export type LegacySort =
  | "OrderByPriceDESC"
  | "OrderByPriceASC"
  | "OrderByTopSaleDESC"
  | "OrderByReviewRateDESC"
  | "OrderByNameASC"
  | "OrderByNameDESC"
  | "OrderByReleaseDateDESC"
  | "OrderByBestDiscountDESC"
  | "OrderByScoreDESC"
  | "";

export type Fuzzy = "0" | "1" | "auto";

export interface SearchArgs {
  query?: string;
  page: number;
  count: number;
  type: "product_search" | "facets";
  sort?: Sort;
  selectedFacets?: SelectedFacet[];
  fuzzy?: Fuzzy;
  hideUnavailableItems?: boolean;
  locale?: string;
  segment?: Partial<Segment>;
}

export interface SelectedFacet {
  key: string;
  value: string;
}

export type Sort =
  | "price:desc"
  | "price:asc"
  | "orders:desc"
  | "name:desc"
  | "name:asc"
  | "release:desc"
  | "discount:desc"
  | "";

export interface Suggestion {
  searches: Search[];
}

export interface Search {
  term: string;
  count: number;
}

export interface ProductSearchResult {
  /**
   * @description Total of products.
   */
  recordsFiltered: number;
  products: Product[];
  pagination: Pagination;
  sampling: boolean;
  options: Options;
  translated: boolean;
  locale: string;
  query: string;
  operator: "and" | "or";
  fuzzy: string;
  correction?: Correction;
}

export interface Correction {
  misspelled: boolean;
}

export interface Options {
  sorts: {
    field: string;
    order: string;
    active?: boolean;
    proxyURL: string;
  }[];
  counts: Count[];
}

export interface Count {
  count: number;
  proxyURL: string;
}

export interface Pagination {
  count: number;
  current: Page;
  before: Page[];
  after: Page[];
  perPage: number;
  next: Page;
  previous: Page;
  first: Page;
  last: Page;
}

export interface Page {
  index: number;
  proxyUrl: string;
}

export interface First {
  index: number;
}

export interface Suggestion {
  searches: Search[];
}

export interface Search {
  term: string;
  count: number;
}

export interface IProduct {
  productId: string;
  productName: string;
  brand: string;
  brandId: number;
  brandImageUrl?: string;
  cacheId?: string;
  linkText: string;
  productReference: string;
  categoryId: string;
  clusterHighlights: Record<string, unknown>;
  productClusters: Record<string, string>;
  categories: string[];
  categoriesIds: string[];
  link: string;
  description: string;
  skuSpecifications?: SkuSpecification[];
  priceRange: PriceRange;
  specificationGroups: SpecificationGroup[];
  properties: Array<{ name: string; values: string[] }>;
  selectedProperties: Array<{ key: string; value: string }>;
  releaseDate: string;
  origin?: string;
}

export type Product = IProduct & {
  items: Item[];
  clusterHighlights: Array<{ id: string; name: string }>;
  productClusters: Array<{ id: string; name: string }>;
};

export type LegacyProduct = IProduct & {
  metaTagDescription: string;
  productTitle: string;
  items: LegacyItem[];
  allSpecifications: string[];
};

export type LegacyFacets = {
  Departments: LegacyFacet[];
  Brands: LegacyFacet[];
  SpecificationFilters: Record<string, LegacyFacet[]>;
};

export interface PageType {
  id: string | null;
  name: string | null;
  url: string | null;
  title: string | null;
  metaTagDescription: string | null;
  pageType:
    | "Brand"
    | "Category"
    | "Department"
    | "SubCategory"
    | "Product"
    | "Collection"
    | "Cluster"
    | "NotFound"
    | "FullText"
    | "Search";
}

export interface Category {
  id: number;
  name: string;
  hasChildren: boolean;
  children: Category[];
  url: string;
  Title?: string;
  MetaTagDescription?: string;
}

export interface LegacyFacet {
  Quantity: number;
  Name: string;
  Link: string;
  LinkEncoded: string;
  Map: string;
  Value: string;
  Children: LegacyFacet[];
}

export interface Image {
  imageId: string;
  imageLabel: string | null;
  imageTag: string;
  imageUrl: string;
  imageText: string;
}

export interface Installment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  PaymentSystemName: string;
  PaymentSystemGroupName: string;
  Name: string;
}

export type LegacyItem = Omit<Item, "variations"> & {
  variations: string[];
} & Record<string, string[]>;

export interface Item {
  itemId: string;
  name: string;
  nameComplete: string;
  complementName: string;
  ean: string;
  referenceId?: Array<{ Key: string; Value: string }>;
  measurementUnit: string;
  unitMultiplier: number;
  modalType: unknown | null;
  images: Image[];
  Videos: string[];
  variations: Array<{
    name: string;
    values: string[];
  }>;
  sellers: Seller[];
  attachments: Array<{
    id: number;
    name: string;
    required: boolean;
    domainValues: string;
  }>;
  isKit: boolean;
  kitItems?: Array<{
    itemId: string;
    amount: number;
  }>;
}

export interface TeasersParametersLegacy {
  "<Name>k__BackingField": string;
  "<Value>k__BackingField": string;
}

export interface TeasersConditionsLegacy {
  "<MinimumQuantity>k__BackingField": number;
  "<Parameters>k__BackingField": TeasersParametersLegacy[];
}

export interface TeasersEffectLegacy {
  "<Parameters>k__BackingField": TeasersParametersLegacy[];
}

export interface TeasersLegacy {
  "<Name>k__BackingField": string;
  "<GeneralValues>k__BackingField": unknown;
  "<Conditions>k__BackingField": TeasersConditionsLegacy;
  "<Effects>k__BackingField": TeasersEffectLegacy;
}

export interface TeasersParameters {
  name: string;
  value: string;
}

export interface TeasersConditions {
  minimumQuantity: number;
  parameters: TeasersParameters[];
}

export interface TeasersEffect {
  parameters: TeasersParameters[];
}

export interface Teasers {
  name: string;
  generalValues?: unknown;
  conditions: TeasersConditions;
  effects: TeasersEffect;
}

export interface CommertialOffer {
  DeliverySlaSamplesPerRegion: Record<
    string,
    { DeliverySlaPerTypes: unknown[]; Region: unknown | null }
  >;
  Installments: Installment[];
  DiscountHighLight: unknown[];
  GiftSkuIds: string[];
  Teasers: TeasersLegacy[];
  teasers?: Teasers[];
  BuyTogether: unknown[];
  ItemMetadataAttachment: unknown[];
  Price: number;
  ListPrice: number;
  spotPrice: number;
  PriceWithoutDiscount: number;
  RewardValue: number;
  PriceValidUntil: string;
  AvailableQuantity: number;
  Tax: number;
  DeliverySlaSamples: Array<{
    DeliverySlaPerTypes: unknown[];
    Region: unknown | null;
  }>;
  GetInfoErrorMessage: unknown | null;
  CacheVersionUsedToCallCheckout: string;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommertialOffer;
}

export interface SkuSpecification {
  field: SKUSpecificationField;
  values: SKUSpecificationValue[];
}
export interface SKUSpecificationValue {
  name: string;
  id?: string;
  fieldId?: string;
  originalName?: string;
}

export interface SKUSpecificationField {
  name: string;
  originalName?: string;
  id?: string;
}

export interface Price {
  highPrice: number | null;
  lowPrice: number | null;
}

export interface PriceRange {
  sellingPrice: Price;
  listPrice: Price;
}

export interface SpecificationGroup {
  name: string;
  originalName: string;
  specifications: Array<{
    name: string;
    originalName: string;
    values: string[];
  }>;
}

export type FilterType = RangeFacet["type"] | BooleanFacet["type"];

export interface FacetSearchResult {
  facets: Facet[];
  breadcrumb: Breadcrumb[];
}

export interface BaseFacet {
  name: string;
  hidden: boolean;
  key: string;
  quantity: number;
}

export interface RangeFacet extends BaseFacet {
  type: "PRICERANGE";
  values: FacetValueRange[];
}

export interface BooleanFacet extends BaseFacet {
  type: "TEXT" | "NUMBER";
  values: FacetValueBoolean[];
}

export type Facet = RangeFacet | BooleanFacet;

export interface FacetValueBoolean {
  quantity: number;
  name: string;
  key: string;
  value: string;
  selected: boolean;
  href: string;
}

export interface FacetValueRange {
  selected: boolean;
  quantity: number;
  range: {
    from: number;
    to: number;
  };
}

export interface Breadcrumb {
  href: string;
  name: string;
}

export interface SKU {
  id: number;
  quantity: number;
  seller: string;
}

export interface SimulationOrderForm {
  items: Item[];
  ratesAndBenefitsData: RatesAndBenefitsData;
  paymentData: PaymentData;
  selectableGifts: unknown[];
  marketingData?: MarketingData;
  postalCode: string;
  country: string;
  logisticsInfo: LogisticsInfo[];
  messages: Message[];
  purchaseConditions: PurchaseConditions;
  pickupPoints: PickupPoint[];
  subscriptionData?: unknown;
  totals: Total[];
  itemMetadata?: ItemMetadata;
  allowMultipleDeliveries: boolean;
}

export interface Total {
  id: string;
  name: string;
  value: number;
}

export interface PurchaseConditions {
  itemPurchaseConditions: ItemPurchaseCondition[];
}

export interface ItemPurchaseCondition {
  id: string;
  seller: string;
  sellerChain: string[];
  slas: Sla[];
  price: number;
  listPrice: number;
}

export interface DeliveryId {
  courierId: string;
  warehouseId: string;
  dockId: string;
  courierName: string;
  quantity: number;
  kitItemDetails: unknown[];
}

export interface Installment {
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
  sellerMerchantInstallments: SellerMerchantInstallment[];
}

export interface SellerMerchantInstallment {
  id: string;
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
}

export interface Teaser {
  featured: boolean;
  id: string;
  name: string;
  conditions: Conditions;
  effects: Effects;
  teaserType: string;
}

export interface Effects {
  parameters: Parameter[];
}

export interface Conditions {
  parameters: Parameter[];
  minimumQuantity: number;
}

export interface Parameter {
  name: string;
  value: string;
}

export interface PriceDefinition {
  calculatedSellingPrice: number;
  total: number;
  sellingPrices: SellingPrice[];
}

export interface SellingPrice {
  value: number;
  quantity: number;
}

export interface Offering {
  type: string;
  id: string;
  name: string;
  allowGiftMessage: boolean;
  attachmentOfferings: unknown[];
  price: number;
}

export type CrossSellingType =
  | "whosawalsosaw"
  | "whosawalsobought"
  | "whoboughtalsobought"
  | "showtogether"
  | "accessories"
  | "similars"
  | "suggestions";

export interface CrossSellingArgs {
  productId: string;
  type: CrossSellingType;
}

export interface Segment {
  campaigns: unknown | null;
  /** @description 1,2,3 etc */
  channel: string;
  priceTables: unknown | null;
  regionId: string | null;
  utm_campaign: string | null;
  utm_source: string | null;
  utmi_campaign: string | null;
  /** @description BRL, USD stc */
  currencyCode: string;
  /** @description R$, $ etc */
  currencySymbol: string;
  /** @description BRA, USA etc */
  countryCode: string;
  /** @description pt-BR, en-US etc */
  cultureInfo: string;
  channelPrivacy: "public" | "private";
}

export type StateVTEX = FnContext<
  { global: { configVTEX: Account } },
  // @ts-ignore this should work.
  Manifest
>;

export interface WishlistItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
}
