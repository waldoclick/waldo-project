export interface OrdersPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface PreferencesState {
  orders: OrdersPreferences;
  setOrdersPreferences: (preferences: Partial<OrdersPreferences>) => void;
}
