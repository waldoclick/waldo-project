<template>
  <div ref="wrapRef" class="search search--default">
    <label class="search--default__field">
      <IconSearch :size="19" class="search--default__field__icon" />
      <input
        v-model="query"
        type="text"
        maxlength="40"
        placeholder="Busca un aviso o categoría…"
        class="search--default__field__input"
        autocomplete="off"
        spellcheck="false"
        autocorrect="off"
        autocapitalize="off"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter.prevent="onSearch"
        @keydown.esc="acOpen = false"
        @input="onInput"
      />
      <button
        v-if="query"
        type="button"
        class="search--default__field__clear"
        @mousedown.prevent="query = ''"
      >
        <IconX :size="16" />
      </button>
    </label>
    <button type="button" class="search--default__button" @click="onSearch">
      Buscar
    </button>

    <Teleport to="body">
      <div
        v-if="acOpen && (dropdownStyle.top || dropdownStyle.bottom)"
        class="search--default__dropdown"
        :style="dropdownStyle"
      >
        <template v-if="hasQuery">
          <a
            v-for="s in adSuggestions"
            :key="s.slug"
            class="search--default__dropdown__row"
            @mousedown.prevent="pickSuggestion(s)"
          >
            <span
              class="search--default__dropdown__row__dot"
              :style="{ background: s.categoryColor }"
            />
            <span class="search--default__dropdown__row__main">
              <span class="search--default__dropdown__row__main__title">{{
                s.name
              }}</span>
              <span class="search--default__dropdown__row__main__sub">{{
                s.categoryName
              }}</span>
            </span>
            <span class="search--default__dropdown__row__meta">{{
              s.priceLabel
            }}</span>
          </a>
          <a
            class="search--default__dropdown__row search--default__dropdown__row--search"
            @mousedown.prevent="onSearch"
          >
            <IconSearch
              :size="17"
              class="search--default__dropdown__row__lead search--default__dropdown__row__lead--search"
            />
            <span class="search--default__dropdown__row__text">
              Buscar <strong>"{{ query }}"</strong> en el buscador
            </span>
          </a>
        </template>

        <template v-else>
          <template v-if="recents.length > 0">
            <div class="search--default__dropdown__head">
              <span class="search--default__dropdown__head__label"
                >Últimas búsquedas</span
              >
              <button
                type="button"
                class="search--default__dropdown__head__clear"
                @mousedown.prevent="clearRecents"
              >
                Borrar
              </button>
            </div>
            <a
              v-for="term in recents"
              :key="term"
              class="search--default__dropdown__row"
              @mousedown.prevent="pickRecent(term)"
            >
              <IconClock
                :size="16"
                class="search--default__dropdown__row__lead"
              />
              <span class="search--default__dropdown__row__term">{{
                term
              }}</span>
              <IconArrowUp
                :size="15"
                class="search--default__dropdown__row__trail"
              />
            </a>
          </template>
          <span class="search--default__dropdown__label"
            >Explora por categoría</span
          >
          <a
            v-for="cat in visibleCats"
            :key="cat.slug"
            class="search--default__dropdown__row"
            @mousedown.prevent="pickCategory(cat)"
          >
            <span
              class="search--default__dropdown__row__dot"
              :style="{ background: cat.color || '#a9772e' }"
            />
            <span class="search--default__dropdown__row__name">{{
              cat.name
            }}</span>
            <span class="search--default__dropdown__row__meta">{{
              cat.count ?? 0
            }}</span>
          </a>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Search as IconSearch,
  X as IconX,
  Clock as IconClock,
  ArrowUpRight as IconArrowUp,
} from "lucide-vue-next";
import {
  useSearchSuggestions,
  type AdSuggestion,
} from "@/composables/useSearchSuggestions";
import type { FilterCategory } from "@/types/filter";

const props = defineProps<{
  categories?: FilterCategory[];
}>();

const router = useRouter();

const query = ref("");
const acOpen = ref(false);
const wrapRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const hasQuery = computed(() => query.value.trim().length > 0);
const visibleCats = computed(() => (props.categories ?? []).slice(0, 8));

const {
  adSuggestions,
  recents,
  loadSuggestions,
  loadRecents,
  pushRecent,
  clearRecents,
} = useSearchSuggestions();

const measure = () => {
  const el = wrapRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom;
  const above = r.top;
  const need = Math.min(320, window.innerHeight * 0.6);
  const up = below < need && above > below;
  const maxH = Math.max(180, (up ? above : below) - 18);
  dropdownStyle.value = {
    position: "fixed",
    zIndex: "1000",
    left: r.left + "px",
    width: r.width + "px",
    maxHeight: maxH + "px",
    ...(up
      ? { bottom: window.innerHeight - r.top + 8 + "px" }
      : { top: r.bottom + 8 + "px" }),
  };
};

const onFocus = () => {
  loadRecents();
  measure();
  acOpen.value = true;
};

const onInput = () => {
  if (!acOpen.value) {
    measure();
    acOpen.value = true;
  }
  loadSuggestions(query.value);
};

const onBlur = () => {
  setTimeout(() => {
    acOpen.value = false;
  }, 120);
};

const onReposition = () => {
  if (acOpen.value) measure();
};

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener("scroll", onReposition, { passive: true });
    window.addEventListener("resize", onReposition, { passive: true });
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener("scroll", onReposition);
    window.removeEventListener("resize", onReposition);
  }
});

const onSearch = () => {
  acOpen.value = false;
  const term = query.value.slice(0, 40).toLowerCase().trim();
  if (term) pushRecent(term);
  router.push({ path: "/anuncios", query: term ? { s: term } : {} });
};

const pickSuggestion = (s: AdSuggestion) => {
  acOpen.value = false;
  router.push(`/anuncios/${s.slug}`);
};

const pickRecent = (term: string) => {
  query.value = term;
  onSearch();
};

const pickCategory = (cat: FilterCategory) => {
  acOpen.value = false;
  router.push({ path: "/anuncios", query: { category: cat.slug, page: 1 } });
};
</script>
