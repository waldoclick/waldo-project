import { usePaginatedData } from './usePaginatedData';
import {
  getPendingAds,
  getActiveAds,
  getArchivedAds,
  getRejectedAds,
  StrapiAd,
} from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

type AdType = 'pending' | 'active' | 'archived' | 'rejected';

interface UseAdsOptions {
  type: AdType;
}

export function useAds({ type }: UseAdsOptions) {
  const store = usePreferencesStore();

  const getPreferences = () => {
    switch (type) {
      case 'pending':
        return {
          prefs: store.pendingAds,
          setPrefs: store.setPendingAdsPreferences,
        };
      case 'active':
        return {
          prefs: store.activeAds,
          setPrefs: store.setActiveAdsPreferences,
        };
      case 'archived':
        return {
          prefs: store.archivedAds,
          setPrefs: store.setArchivedAdsPreferences,
        };
      case 'rejected':
        return {
          prefs: store.rejectedAds,
          setPrefs: store.setRejectedAdsPreferences,
        };
    }
  };

  const getFetchFn = () => {
    switch (type) {
      case 'pending':
        return getPendingAds;
      case 'active':
        return getActiveAds;
      case 'archived':
        return getArchivedAds;
      case 'rejected':
        return getRejectedAds;
    }
  };

  const { prefs, setPrefs } = getPreferences();
  const fetchFn = getFetchFn();

  return usePaginatedData<StrapiAd>({
    fetchFn,
    preferences: prefs,
    setPreferences: setPrefs,
    defaultSortBy: 'createdAt:desc',
  });
}
