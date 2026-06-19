import { ref } from "vue";
import type { Ad } from "@/types/ad";

export interface AdSuggestion {
  slug: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  priceLabel: string;
}

const RECENTS_KEY = "waldo_recent_searches";
const RECENTS_MAX = 5;

export const useSearchSuggestions = () => {
  const apiClient = useApiClient();

  const adSuggestions = ref<AdSuggestion[]>([]);
  const recents = ref<string[]>([]);
  let suggestTimer: ReturnType<typeof setTimeout> | null = null;

  const loadSuggestions = (q: string) => {
    if (suggestTimer) clearTimeout(suggestTimer);
    if (!q.trim()) {
      adSuggestions.value = [];
      return;
    }
    suggestTimer = setTimeout(async () => {
      try {
        const res = await apiClient<{ data: Ad[] }>("ads/catalog", {
          method: "GET",
          params: {
            filters: { name: { $containsi: q.trim() } },
            pagination: { pageSize: 3 },
          } as unknown as Record<string, unknown>,
        });
        adSuggestions.value = (res.data ?? []).map((ad) => {
          const cat =
            typeof ad.category === "object" && ad.category !== null
              ? (ad.category as { name: string; color?: string })
              : null;
          return {
            slug: ad.slug,
            name: ad.name,
            categoryName: cat?.name ?? "",
            categoryColor: cat?.color ?? "#a9772e",
            priceLabel: new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: ad.currency || "CLP",
            }).format(ad.price || 0),
          };
        });
      } catch {
        adSuggestions.value = [];
      }
    }, 250);
  };

  const loadRecents = () => {
    if (!import.meta.client) return;
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      recents.value = raw
        ? (JSON.parse(raw) as string[]).slice(0, RECENTS_MAX)
        : [];
    } catch {
      recents.value = [];
    }
  };

  const pushRecent = (term: string) => {
    const value = term.trim();
    if (!value) return;
    const next = [value, ...recents.value.filter((t) => t !== value)].slice(
      0,
      RECENTS_MAX,
    );
    recents.value = next;
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const clearRecents = () => {
    recents.value = [];
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      // ignore storage failures
    }
  };

  return {
    adSuggestions,
    recents,
    loadSuggestions,
    loadRecents,
    pushRecent,
    clearRecents,
  };
};
