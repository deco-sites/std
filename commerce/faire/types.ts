export interface FaireSearchResult {
  pagination_data: PaginationData;
  request_id: string;
  total_primary_results: number;
  show_brand_off_faire_toggle: boolean;
  formatted_total_primary_results_count: string;
  product_tiles: ProductTile[];
  brands_by_token: { [key: string]: BrandsByToken };
  brand_tiles_related_to_search: BrandTilesRelatedToSearch[];
  filter_sections: FilterSection[];
  related_search_terms: any[];
  empty_suggestion_brands: any[];
  visual_filter_options: any[];
  badges: AvailableFilters;
  brand_related_product_tiles: any[];
  fallback_product_tiles: any[];
  suggested_categories_broad_query: any[];
  retrieval_queries: any[];
  brand_related_products: any[];
  ranking_debug_info_for_products: any[];
  products: any[];
  fallback_products: any[];
  brand_tokens: any[];
  available_filters: AvailableFilters;
  brand_off_faire_related_brands_info: any[];
}

export interface AvailableFilters {
}

export interface BrandTilesRelatedToSearch {
  brand: Brand;
  lead_time_text: string;
  images: Image[];
}

export interface Brand {
  token: string;
  name: string;
  description: string;
  ships_from_country: BasedIn;
  is_first_order: boolean;
  has_new_products: boolean;
  profile_image: Image;
  squared_image: Image;
  minimum_order_amount: Min;
  is_highlighted_brand_for_promotional_event: boolean;
  is_top_shop?: boolean;
  zip_code_protection_enabled: boolean;
  based_in: BasedIn;
  hide_chat: boolean;
  show_location_badging: ShowLocationBadging;
  active_products_count: number;
  based_in_country_message: BasedInCountryMessage;
  highlighted_apparel_seasons_for_promotional_event: any[];
}

export enum BasedIn {
  Chn = "CHN",
  Usa = "USA",
}

export interface BasedInCountryMessage {
  desktop_message: Message;
  mobile_message: Message;
}

export enum Message {
  UnitedStates = "United States",
}

export interface Min {
  amount_cents: number;
  currency: Currency;
}

export enum Currency {
  Usd = "USD",
}

export interface Image {
  token: string;
  width: number;
  height: number;
  sequence?: number;
  url: string;
  tags: string[];
  type?: ProfileImageType;
}

export enum ProfileImageType {
  Hero = "HERO",
  Product = "PRODUCT",
}

export enum ShowLocationBadging {
  DoNotShow = "DO_NOT_SHOW",
}

export interface BrandsByToken {
  token: string;
  name: string;
  forbids_online_only_retailers: boolean;
  minimum_order_amount: Min;
  ships_from_country: BasedIn;
  based_in: BasedIn;
  is_highlighted_brand_for_promotional_event: boolean;
  is_top_shop?: boolean;
  active_products_count: number;
  based_in_country_message: BasedInCountryMessage;
  profile_image: Image;
}

export interface FilterSection {
  selection_type: string;
  field_name: string;
  display_name: string;
  formatted_display_name: string;
  short_display_name: string;
  searchable: boolean;
  field_function: string;
  pill_text: string;
  search_label_text?: string;
  options: Option[];
  range_filters: any[];
  option_groups: any[];
}

export interface Option {
  key: string;
  display_name: string;
  global_display_name: string;
  is_selected: boolean;
  selection_state: SelectionState;
  results_count: number;
  sub_options: Option[];
  customizations: any[];
}

export enum SelectionState {
  Unselected = "UNSELECTED",
}

export interface PaginationData {
  page_number: number;
  page_size: number;
  page_count: number;
  total_results: number;
}

export interface ProductTile {
  product: Product;
  badge_list: BadgeList;
  best_image: Image;
  quick_add: QuickAdd;
  min_option_retail_price: Min;
  has_active_brand_promo: boolean;
  is_highlighted_product_for_promotional_event: boolean;
  case_size_text?: string;
  based_in_country: BasedIn;
  show_location_badging: ShowLocationBadging;
  images: Image[];
  min_option_brand_code?: string;
  expected_shipping_date?: string;
}

export interface BadgeList {
  badges: Badge[];
}

export interface Badge {
  priority: number;
  type: BadgeType;
  display_to_user: boolean;
  style: Style;
}

export interface Style {
  position: Position;
  badge_message: BadgeMessage;
  badge_message_key: BadgeMessageKey;
}

export enum BadgeMessage {
  HighSellThrough = "High sell-through",
}

export enum BadgeMessageKey {
  BadgesHighSellThrough = "badges.high_sell_through",
}

export enum Position {
  Middle = "MIDDLE",
}

export enum BadgeType {
  HighSellThrough = "HIGH_SELL_THROUGH",
}

export interface Product {
  token: string;
  name: string;
  brand_token: string;
  is_new: boolean;
  maker_best_seller: boolean;
  per_style_min_order_quantity: number;
  state: State;
  description?: string;
  taxonomy_type: TaxonomyType;
  preorderable: boolean;
  is_promoted: boolean;
  board_tokens: any[];
  promoted_by: any[];
  expected_ship_date?: number;
  expected_ship_window_days?: number;
}

export enum State {
  ForSale = "FOR_SALE",
}

export interface TaxonomyType {
  token: string;
  name: string;
  group_name: string;
  clean_name: string;
  target_customer: TargetCustomer;
  target_customer_display_name: TargetCustomerDisplayName;
}

export enum TargetCustomer {
  AdultMen = "ADULT_MEN",
  AdultUnisex = "ADULT_UNISEX",
  AdultWomen = "ADULT_WOMEN",
  KidsUnisex = "KIDS_UNISEX",
  PetsDogs = "PETS_DOGS",
}

export enum TargetCustomerDisplayName {
  AdultsMen = "Adults - Men",
  AdultsUnisex = "Adults - Unisex",
  AdultsWomen = "Adults - Women",
  KidsUnisex = "Kids - Unisex",
  PetsDogs = "Pets - Dogs",
}

export interface QuickAdd {
  quick_add_text: QuickAddText;
  mobile_quick_add_text: MobileQuickAddText;
  quick_add_option?: QuickAddOption;
}

export enum MobileQuickAddText {
  CaseOf1 = "Case of 1",
  MoreOptions = "More Options",
  PrePacksAvailable = "Pre-Packs Available",
}

export interface QuickAddOption {
  option_token: string;
  option_unit_multiplier: number;
  option_min_order_quantity: number;
  option_available_units?: number;
}

export enum QuickAddText {
  ChooseOptions = "Choose Options",
  QuickAddPack = "+ Quick Add Pack",
}
