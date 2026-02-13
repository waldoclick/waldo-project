import { usePaginatedData } from './usePaginatedData';
import { getOrders, StrapiOrder } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useOrders() {
  const { orders: ordersPrefs, setOrdersPreferences } = usePreferencesStore();

  return usePaginatedData<StrapiOrder>({
    fetchFn: getOrders,
    preferences: ordersPrefs,
    setPreferences: setOrdersPreferences,
    defaultSortBy: 'createdAt:desc',
  });
}
