import { useCallback } from 'react';
import { usePaginatedData } from './usePaginatedData';
import { getRegionCommunes, StrapiCommune } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useRegionCommunes(regionId: number) {
  const { communes: communesPrefs, setCommunesPreferences } =
    usePreferencesStore();

  const fetchFn = useCallback(
    (params: {
      page: number;
      pageSize: number;
      sort: string;
      search?: string;
    }) => getRegionCommunes(regionId, params),
    [regionId]
  );

  return usePaginatedData<StrapiCommune>({
    fetchFn,
    preferences: communesPrefs,
    setPreferences: setCommunesPreferences,
    defaultSortBy: 'name:asc',
  });
}
