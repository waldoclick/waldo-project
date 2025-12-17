import { useCallback, useState } from 'react';
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
      return getUserFeaturedReservations(userId, { ...params, filters });
    },
    [userId, filter]
  );

  const paginatedData = usePaginatedData<StrapiAdFeaturedReservation>({
    fetchFn,
    preferences: featPrefs,
    setPreferences: setAdFeaturedReservationsPreferences,
    defaultSortBy: 'createdAt:desc',
  });

  return {
    ...paginatedData,
    filter,
    setFilter,
  };
}
