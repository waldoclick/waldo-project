import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PreferencesState, OrdersPreferences } from './types';

const defaultOrdersPreferences: OrdersPreferences = {
  pageSize: 25,
  sortBy: 'createdAt:desc',
  searchTerm: '',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Estado inicial
      orders: defaultOrdersPreferences,

      // Acciones
      setOrdersPreferences: (preferences: Partial<OrdersPreferences>) => {
        set((state) => ({
          orders: {
            ...state.orders,
            ...preferences,
          },
        }));
      },
    }),
    {
      name: 'preferences-storage', // nombre para localStorage
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);
