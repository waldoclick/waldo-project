import { useCallback } from 'react';
import { usePaginatedData } from './usePaginatedData';
import {
  getUserFeaturedReservations,
  StrapiAdFeaturedReservation,
} from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useUserFeaturedReservations(userId: number) {
  const {
    adFeaturedReservations: featPrefs,
    setAdFeaturedReservationsPreferences,
  } = usePreferencesStore();

  const fetchFn = useCallback(
    (params: {
      page: number;
      pageSize: number;
      sort: string;
      search?: string;
    }) => getUserFeaturedReservations(userId, params),
    [userId]
  );

  return usePaginatedData<StrapiAdFeaturedReservation>({
    fetchFn,
    preferences: featPrefs,
    setPreferences: setAdFeaturedReservationsPreferences,
    defaultSortBy: 'createdAt:desc',
  });
}
