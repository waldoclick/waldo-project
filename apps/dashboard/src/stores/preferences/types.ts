export interface OrdersPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface PendingAdsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface ActiveAdsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface ArchivedAdsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface RejectedAdsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface UsedReservationsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface FreeReservationsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface UsedFeaturesPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface FreeFeaturesPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface CategoriesPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface ConditionsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface FaqsPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface PacksPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

export interface PreferencesState {
  orders: OrdersPreferences;
  pendingAds: PendingAdsPreferences;
  activeAds: ActiveAdsPreferences;
  archivedAds: ArchivedAdsPreferences;
  rejectedAds: RejectedAdsPreferences;
  usedReservations: UsedReservationsPreferences;
  freeReservations: FreeReservationsPreferences;
  usedFeatures: UsedFeaturesPreferences;
  freeFeatures: FreeFeaturesPreferences;
  categories: CategoriesPreferences;
  conditions: ConditionsPreferences;
  faqs: FaqsPreferences;
  packs: PacksPreferences;
  setOrdersPreferences: (preferences: Partial<OrdersPreferences>) => void;
  setPendingAdsPreferences: (
    preferences: Partial<PendingAdsPreferences>
  ) => void;
  setActiveAdsPreferences: (preferences: Partial<ActiveAdsPreferences>) => void;
  setArchivedAdsPreferences: (
    preferences: Partial<ArchivedAdsPreferences>
  ) => void;
  setRejectedAdsPreferences: (
    preferences: Partial<RejectedAdsPreferences>
  ) => void;
  setUsedReservationsPreferences: (
    preferences: Partial<UsedReservationsPreferences>
  ) => void;
  setFreeReservationsPreferences: (
    preferences: Partial<FreeReservationsPreferences>
  ) => void;
  setUsedFeaturesPreferences: (
    preferences: Partial<UsedFeaturesPreferences>
  ) => void;
  setFreeFeaturesPreferences: (
    preferences: Partial<FreeFeaturesPreferences>
  ) => void;
  setCategoriesPreferences: (
    preferences: Partial<CategoriesPreferences>
  ) => void;
  setConditionsPreferences: (
    preferences: Partial<ConditionsPreferences>
  ) => void;
  setFaqsPreferences: (preferences: Partial<FaqsPreferences>) => void;
  setPacksPreferences: (preferences: Partial<PacksPreferences>) => void;
}
