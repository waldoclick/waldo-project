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
import {
  useSearchSuggestions,
  type AdSuggestion,
} from "@/composables/useSearchSuggestions";
import type { FilterCategory } from "@/types/filter";
import {
  Search as IconSearch,
  X as IconX,
  Clock as IconClock,
  ArrowUpRight as IconArrow,
} from "lucide-vue-next";

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
const inputRef = ref<HTMLInputElement | null>(null);

const hasQuery = computed(() => query.value.trim().length > 0);

const dotStyle = (color?: string) => ({ background: color || "#a9772e" });

const {
  adSuggestions,
  recents,
  loadSuggestions,
  loadRecents,
  pushRecent,
  clearRecents,
} = useSearchSuggestions();

const pickSuggestion = (s: AdSuggestion) => {
  router.push(`/anuncios/${s.slug}`);
  close();
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
