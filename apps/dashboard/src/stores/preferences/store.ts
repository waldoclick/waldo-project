import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PreferencesState,
  OrdersPreferences,
  PendingAdsPreferences,
  ActiveAdsPreferences,
  ArchivedAdsPreferences,
  RejectedAdsPreferences,
  UsedReservationsPreferences,
  FreeReservationsPreferences,
  UsedFeaturesPreferences,
  FreeFeaturesPreferences,
  CategoriesPreferences,
} from './types';

const defaultOrdersPreferences: OrdersPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultPendingAdsPreferences: PendingAdsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultActiveAdsPreferences: ActiveAdsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultArchivedAdsPreferences: ArchivedAdsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultRejectedAdsPreferences: RejectedAdsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultUsedReservationsPreferences: UsedReservationsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultFreeReservationsPreferences: FreeReservationsPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultUsedFeaturesPreferences: UsedFeaturesPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultFreeFeaturesPreferences: FreeFeaturesPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

const defaultCategoriesPreferences: CategoriesPreferences = {
  pageSize: 25,
  sortBy: 'name:asc',
  searchTerm: '',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Estado inicial
      orders: defaultOrdersPreferences,
      pendingAds: defaultPendingAdsPreferences,
      activeAds: defaultActiveAdsPreferences,
      archivedAds: defaultArchivedAdsPreferences,
      rejectedAds: defaultRejectedAdsPreferences,
      usedReservations: defaultUsedReservationsPreferences,
      freeReservations: defaultFreeReservationsPreferences,
      usedFeatures: defaultUsedFeaturesPreferences,
      freeFeatures: defaultFreeFeaturesPreferences,
      categories: defaultCategoriesPreferences,

      // Acciones
      setOrdersPreferences: (preferences: Partial<OrdersPreferences>) => {
        set((state) => ({
          orders: {
            ...state.orders,
            ...preferences,
          },
        }));
      },
      setPendingAdsPreferences: (
        preferences: Partial<PendingAdsPreferences>
      ) => {
        set((state) => ({
          pendingAds: {
            ...state.pendingAds,
            ...preferences,
          },
        }));
      },
      setActiveAdsPreferences: (preferences: Partial<ActiveAdsPreferences>) => {
        set((state) => ({
          activeAds: {
            ...state.activeAds,
            ...preferences,
          },
        }));
      },
      setArchivedAdsPreferences: (
        preferences: Partial<ArchivedAdsPreferences>
      ) => {
        set((state) => ({
          archivedAds: {
            ...state.archivedAds,
            ...preferences,
          },
        }));
      },
      setRejectedAdsPreferences: (
        preferences: Partial<RejectedAdsPreferences>
      ) => {
        set((state) => ({
          rejectedAds: {
            ...state.rejectedAds,
            ...preferences,
          },
        }));
      },
      setUsedReservationsPreferences: (
        preferences: Partial<UsedReservationsPreferences>
      ) => {
        set((state) => ({
          usedReservations: {
            ...state.usedReservations,
            ...preferences,
          },
        }));
      },
      setFreeReservationsPreferences: (
        preferences: Partial<FreeReservationsPreferences>
      ) => {
        set((state) => ({
          freeReservations: {
            ...state.freeReservations,
            ...preferences,
          },
        }));
      },
      setUsedFeaturesPreferences: (
        preferences: Partial<UsedFeaturesPreferences>
      ) => {
        set((state) => ({
          usedFeatures: {
            ...state.usedFeatures,
            ...preferences,
          },
        }));
      },
      setFreeFeaturesPreferences: (
        preferences: Partial<FreeFeaturesPreferences>
      ) => {
        set((state) => ({
          freeFeatures: {
            ...state.freeFeatures,
            ...preferences,
          },
        }));
      },
      setCategoriesPreferences: (
        preferences: Partial<CategoriesPreferences>
      ) => {
        set((state) => ({
          categories: {
            ...state.categories,
            ...preferences,
          },
        }));
      },
    }),
    {
      name: 'preferences-storage', // nombre para localStorage
      partialize: (state) => ({
        orders: state.orders,
        pendingAds: state.pendingAds,
        activeAds: state.activeAds,
        archivedAds: state.archivedAds,
        rejectedAds: state.rejectedAds,
        usedReservations: state.usedReservations,
        freeReservations: state.freeReservations,
        usedFeatures: state.usedFeatures,
        freeFeatures: state.freeFeatures,
        categories: state.categories,
      }),
    }
  )
);
