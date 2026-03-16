import { defineStore } from "pinia";
import { ref } from "vue";

export interface ITavilyResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
}

interface ITavilyEntry {
  results: ITavilyResult[];
  fetchedAt: number;
}

interface SearchState {
  tavily: Record<string, ITavilyEntry>;
}

export const useSearchStore = defineStore(
  "search",
  () => {
    // State
    const tavily = ref<SearchState["tavily"]>({});

    // Getters
    function getTavily(query: string): ITavilyEntry | null {
      return tavily.value[query] ?? null;
    }

    function hasTavily(query: string): boolean {
      const entry = tavily.value[query];
      return (
        query in tavily.value && entry !== undefined && entry.results.length > 0
      );
    }

    // Actions
    function setTavily(query: string, results: ITavilyResult[]): void {
      tavily.value[query] = { results, fetchedAt: Date.now() };
    }

    function clearTavily(query?: string): void {
      if (query !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete tavily.value[query];
      } else {
        tavily.value = {};
      }
    }

    return {
      tavily,
      getTavily,
      hasTavily,
      setTavily,
      clearTavily,
    };
  },
  {
    // persist: CORRECT — search cache should survive page refresh so admins
    // don't re-fetch the same Tavily queries across navigation
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      key: "search",
    },
  },
);
