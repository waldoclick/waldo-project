import { usePaginatedData } from './usePaginatedData';
import {
  getUsedFeaturedReservations,
  getFreeFeaturedReservations,
  StrapiAdFeaturedReservation,
} from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

type FeatureType = 'used' | 'free';

interface UseFeaturesOptions {
  type: FeatureType;
}

export function useFeatures({ type }: UseFeaturesOptions) {
  const store = usePreferencesStore();

  const getPreferences = () => {
    switch (type) {
      case 'used':
        return {
          prefs: store.usedFeatures,
          setPrefs: store.setUsedFeaturesPreferences,
        };
      case 'free':
        return {
          prefs: store.freeFeatures,
          setPrefs: store.setFreeFeaturesPreferences,
        };
    }
  };

  const getFetchFn = () => {
    switch (type) {
      case 'used':
        return getUsedFeaturedReservations;
      case 'free':
        return getFreeFeaturedReservations;
    }
  };

  const { prefs, setPrefs } = getPreferences();
  const fetchFn = getFetchFn();

  return usePaginatedData<StrapiAdFeaturedReservation>({
    fetchFn,
    preferences: prefs,
    setPreferences: setPrefs,
    defaultSortBy: 'createdAt:desc',
  });
}
