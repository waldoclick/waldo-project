import { useCallback, useState } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { getUserReservations, StrapiAdReservation } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useUserReservations(userId: number) {
  const { adReservations: resPrefs, setAdReservationsPreferences } =
    usePreferencesStore();
  const [filter, setFilter] = useState<'used' | 'free'>('used');

  const fetchFn = useCallback(
    (params: {
      page: number;
      pageSize: number;
      sort: string;
      search?: string;
    }) => {
      const filters =
        filter === 'used'
          ? { ad: { $notNull: true } }
          : { ad: { $null: true } };
      return getUserReservations(userId, { ...params, filters });
    },
    [userId, filter]
  );

  const paginatedData = usePaginatedData<StrapiAdReservation>({
    fetchFn,
    preferences: resPrefs,
    setPreferences: setAdReservationsPreferences,
    defaultSortBy: 'createdAt:desc',
  });

  return {
    ...paginatedData,
    filter,
    setFilter,
  };
}
