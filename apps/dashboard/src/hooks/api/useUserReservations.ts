import { useCallback } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { getUserReservations, StrapiAdReservation } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useUserReservations(userId: number) {
  const { adReservations: resPrefs, setAdReservationsPreferences } =
    usePreferencesStore();

  const fetchFn = useCallback(
    (params: {
      page: number;
      pageSize: number;
      sort: string;
      search?: string;
    }) => getUserReservations(userId, params),
    [userId]
  );

  return usePaginatedData<StrapiAdReservation>({
    fetchFn,
    preferences: resPrefs,
    setPreferences: setAdReservationsPreferences,
    defaultSortBy: 'createdAt:desc',
  });
}
