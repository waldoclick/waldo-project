<template>
  <div class="lightbox lightbox--search" :class="{ 'is-open': isOpen }">
    <div class="lightbox--search__backdrop" @mousedown="close" />
    <div class="lightbox--search__box" @mousedown.stop>
      <!-- search bar -->
      <div class="lightbox--search__bar">
        <IconSearch :size="21" class="lightbox--search__bar__icon" />
        <input
          ref="inputRef"
          v-model="query"
          class="lightbox--search__bar__input"
          type="text"
          placeholder="Busca un aviso o categoría…"
          @keydown.enter="runSearch"
          @keydown.esc="close"
        />
        <button
          v-if="query"
          title="Limpiar"
          type="button"
          class="lightbox--search__bar__clear"
          @click="query = ''"
        >
          <IconX :size="17" />
        </button>
        <button type="button" class="lightbox--search__bar__esc" @click="close">
          Esc
        </button>
      </div>

      <!-- Results -->
      <div class="lightbox--search__panel">
        <!-- Query state: ads from API -->
        <div v-if="hasQuery" class="lightbox--search__group">
          <a
            v-for="s in adSuggestions"
            :key="s.slug"
            class="lightbox--search__row"
            @mousedown.prevent="pickSuggestion(s)"
          >
            <span
              class="lightbox--search__row__dot"
              :style="{ background: s.categoryColor }"
            />
            <span class="lightbox--search__row__main">
              <span class="lightbox--search__row__main__title">{{
                s.name
              }}</span>
              <span class="lightbox--search__row__main__sub">{{
                s.categoryName
              }}</span>
            </span>
            <span class="lightbox--search__row__meta">{{ s.priceLabel }}</span>
          </a>
          <a
            class="lightbox--search__row lightbox--search__row--search"
            @mousedown.prevent="runSearch"
          >
            <IconSearch :size="18" class="lightbox--search__row__lead--amber" />
            <span class="lightbox--search__row__search">
              Buscar <strong>"{{ query }}"</strong>
            </span>
          </a>
        </div>

        <!-- Empty state -->
        <div v-else class="lightbox--search__group">
          <template v-if="recents.length > 0">
            <div class="lightbox--search__head">
              <span class="lightbox--search__head__label"
                >Últimas búsquedas</span
              >
              <button
                type="button"
                class="lightbox--search__head__clear"
                @click="clearRecents"
              >
                Borrar
              </button>
            </div>
            <a
              v-for="term in recents"
              :key="term"
              class="lightbox--search__row"
              @mousedown.prevent="pickRecent(term)"
            >
              <IconClock :size="16" class="lightbox--search__row__lead" />
              <span class="lightbox--search__row__term">{{ term }}</span>
              <IconArrow :size="15" class="lightbox--search__row__trail" />
            </a>
          </template>

          <span
            class="lightbox--search__head__label lightbox--search__head__label--cats"
            >Explora por categoría</span
          >
          <a
            v-for="cat in categories"
            :key="cat.slug"
            class="lightbox--search__row"
            @mousedown.prevent="pickCategory(cat)"
          >
            <span
              class="lightbox--search__row__dot"
              :style="dotStyle(cat.color)"
            />
            <span class="lightbox--search__row__name">{{ cat.name }}</span>
            <span class="lightbox--search__row__meta">{{
              cat.count ?? 0
            }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useAppStore } from "@/stores/app.store";
import { useFilterStore } from "@/stores/filter.store";
import type { FilterCategory } from "@/types/filter";
import type { Ad } from "@/types/ad";
import {
  Search as IconSearch,
  X as IconX,
  Clock as IconClock,
  ArrowUpRight as IconArrow,
} from "lucide-vue-next";

const RECENTS_KEY = "waldo_recent_searches";
const RECENTS_MAX = 5;

const router = useRouter();

const appStore = import.meta.client
  ? useAppStore()
  : ({} as ReturnType<typeof useAppStore>);
const filterStore = import.meta.client
  ? useFilterStore()
  : ({} as ReturnType<typeof useFilterStore>);

const isOpen = computed(() => appStore.isSearchLightboxActive);

const query = ref("");
const categories = ref<FilterCategory[]>([]);
const recents = ref<string[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);

const hasQuery = computed(() => query.value.trim().length > 0);

const dotStyle = (color?: string) => ({ background: color || "#a9772e" });

interface AdSuggestion {
  slug: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  priceLabel: string;
}

const adSuggestions = ref<AdSuggestion[]>([]);
const apiClient = useApiClient();
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

const pickSuggestion = (s: AdSuggestion) => {
  router.push(`/anuncios/${s.slug}`);
  close();
};

const loadRecents = () => {
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

const close = () => {
  appStore.closeSearchLightbox();
};

const runSearch = () => {
  const value = query.value.trim().slice(0, 40);
  if (!value) return;
  pushRecent(value);
  router.push({
    path: "/anuncios",
    query: { s: value.toLowerCase(), page: 1 },
  });
  close();
};

const pickRecent = (term: string) => {
  query.value = term;
  runSearch();
};

const pickCategory = (cat: FilterCategory) => {
  router.push({ path: "/anuncios", query: { category: cat.slug, page: 1 } });
  close();
};

watch(query, (q) => {
  loadSuggestions(q);
});

// Lightbox open lifecycle: load reference data, focus the input, reset query.
watch(isOpen, async (open) => {
  if (!open) return;
  loadRecents();
  if (categories.value.length === 0) {
    categories.value = (await filterStore.loadFilterCategories()) ?? [];
  }
  await nextTick();
  inputRef.value?.focus();
});

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) close();
};

// onMounted: UI-only — attaches the global ESC listener (no API call here).
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
