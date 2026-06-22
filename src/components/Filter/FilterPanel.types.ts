export interface FilterState {
  search: string;
  priceMin: string;
  priceMax: string;
  rating: number;
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating" | "downloads";
}

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  priceMin: "",
  priceMax: "",
  rating: 0,
  sortBy: "relevance",
};
