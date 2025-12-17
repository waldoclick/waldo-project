import { useCallback } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { getUserAds, StrapiAd } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useUserAds(userId: number) {
  const { ads: adsPrefs, setAdsPreferences } = usePreferencesStore();

  const fetchFn = useCallback(
    (params: {
      page: number;
      pageSize: number;
      sort: string;
      search?: string;
    }) => getUserAds(userId, params),
    [userId]
  );

  return usePaginatedData<StrapiAd>({
    fetchFn,
    preferences: adsPrefs,
    setPreferences: setAdsPreferences,
    defaultSortBy: 'createdAt:desc',
  });
}
