<template>
  <section class="hero hero--home">
    <span class="hero--home__glow" aria-hidden="true"></span>
    <div class="hero--home__container">
      <!-- LEFT -->
      <div class="hero--home__content">
        <span class="hero--home__eyebrow">
          <IconPackage :size="15" class="hero--home__eyebrow__icon" />
          Marketplace de activos industriales
        </span>
        <h1 class="hero--home__title">
          <span class="hero--home__title__mark">Anuncia</span> o
          <span class="hero--home__title__mark">busca</span> activos
          industriales, rápido y fácil.
        </h1>
        <p class="hero--home__text">
          Cientos de equipos, vehículos, repuestos e insumos —nuevos y usados—
          en minería, construcción, agricultura, energía y más.
        </p>

        <!-- search -->
        <div ref="wrapRef" class="hero--home__search">
          <label class="hero--home__search__field">
            <IconSearch :size="19" class="hero--home__search__field__icon" />
            <input
              v-model="query"
              type="text"
              maxlength="40"
              placeholder="Busca un aviso o categoría…"
              class="hero--home__search__field__input"
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
              class="hero--home__search__field__clear"
              @mousedown.prevent="query = ''"
            >
              <IconX :size="16" />
            </button>
          </label>
          <button
            type="button"
            class="hero--home__search__button"
            @click="onSearch"
          >
            Buscar
          </button>
        </div>

        <!-- autocomplete dropdown — teleported to body to escape overflow:hidden -->
        <Teleport to="body">
          <div
            v-if="acOpen && (dropdownStyle.top || dropdownStyle.bottom)"
            class="hero--home__search__dropdown"
            :style="dropdownStyle"
          >
            <template v-if="hasQuery">
              <a
                v-for="s in adSuggestions"
                :key="s.slug"
                class="hero--home__search__dropdown__row"
                @mousedown.prevent="pickSuggestion(s)"
              >
                <span
                  class="hero--home__search__dropdown__row__dot"
                  :style="{ background: s.categoryColor }"
                />
                <span class="hero--home__search__dropdown__row__main">
                  <span
                    class="hero--home__search__dropdown__row__main__title"
                    >{{ s.name }}</span
                  >
                  <span class="hero--home__search__dropdown__row__main__sub">{{
                    s.categoryName
                  }}</span>
                </span>
                <span class="hero--home__search__dropdown__row__meta">{{
                  s.priceLabel
                }}</span>
              </a>
              <a
                class="hero--home__search__dropdown__row hero--home__search__dropdown__row--search"
                @mousedown.prevent="onSearch"
              >
                <IconSearch
                  :size="17"
                  class="hero--home__search__dropdown__row__lead"
                />
                <span class="hero--home__search__dropdown__row__text">
                  Buscar <strong>"{{ query }}"</strong> en el buscador
                </span>
              </a>
            </template>

            <template v-else>
              <span class="hero--home__search__dropdown__label"
                >Explora por categoría</span
              >
              <a
                v-for="cat in visibleCats"
                :key="cat.slug"
                class="hero--home__search__dropdown__row"
                @mousedown.prevent="pickCategory(cat)"
              >
                <span
                  class="hero--home__search__dropdown__row__dot"
                  :style="{ background: cat.color || '#a9772e' }"
                />
                <span class="hero--home__search__dropdown__row__name">{{
                  cat.name
                }}</span>
                <span class="hero--home__search__dropdown__row__meta">{{
                  cat.count ?? 0
                }}</span>
              </a>
            </template>
          </div>
        </Teleport>

        <!-- trust badges -->
        <div class="hero--home__badges">
          <span class="hero--home__badges__item">
            <IconCheck :size="16" class="hero--home__badges__item__icon" />
            Publica 3 avisos gratis
          </span>
          <span class="hero--home__badges__item">
            <IconCheck :size="16" class="hero--home__badges__item__icon" />
            13 categorías industriales
          </span>
          <span class="hero--home__badges__item">
            <IconCheck :size="16" class="hero--home__badges__item__icon" />
            Equipos nuevos y usados
          </span>
        </div>
      </div>

      <!-- RIGHT: featured listing carousel -->
      <div v-if="currentAd" class="hero--home__carousel">
        <div class="hero--home__card">
          <span class="hero--home__card__plate" aria-hidden="true"></span>
          <NuxtLink
            :to="`/anuncios/${currentAd.slug}`"
            class="hero--home__card__inner"
          >
            <div class="hero--home__card__media">
              <NuxtImg
                v-if="cardImage"
                :src="cardImage"
                :alt="currentAd.name"
                width="430"
                height="296"
                loading="eager"
                format="webp"
                remote
              />
              <span class="hero--home__card__media__badge">
                <IconStar
                  :size="13"
                  class="hero--home__card__media__badge__icon"
                />
                Destacado
              </span>
            </div>
            <div class="hero--home__card__body">
              <div class="hero--home__card__body__top">
                <span class="hero--home__card__body__cat">
                  <span
                    class="hero--home__card__body__cat__dot"
                    :style="{ backgroundColor: cardCategory.color }"
                  ></span>
                  {{ cardCategory.name }}
                </span>
                <span class="hero--home__card__body__condition">
                  {{ cardCondition }}
                </span>
              </div>
              <h3 class="hero--home__card__body__title">
                {{ currentAd.name }}
              </h3>
              <span class="hero--home__card__body__meta">
                <IconPin
                  :size="14"
                  class="hero--home__card__body__meta__icon"
                />
                {{ cardMeta }}
              </span>
              <span class="hero--home__card__body__divider"></span>
              <div class="hero--home__card__body__footer">
                <span class="hero--home__card__body__price">
                  <span class="hero--home__card__body__price__label"
                    >Precio</span
                  >
                  <span class="hero--home__card__body__price__value">
                    {{ cardPrice }}
                  </span>
                </span>
                <span class="hero--home__card__body__action">
                  Ver aviso
                  <IconArrow
                    :size="15"
                    class="hero--home__card__body__action__icon"
                  />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- controls -->
        <div v-if="hasMultiple" class="hero--home__controls">
          <button
            type="button"
            aria-label="Destacado anterior"
            class="hero--home__controls__nav"
            @click="prev"
          >
            <IconChevronLeft :size="18" />
          </button>
          <div class="hero--home__controls__dots">
            <button
              v-for="(ad, index) in featuredAds"
              :key="ad.id"
              type="button"
              :aria-label="`Ir a destacado ${index + 1}`"
              class="hero--home__controls__dot"
              :class="{ 'is-active': index === currentIndex }"
              @click="goTo(index)"
            ></button>
          </div>
          <button
            type="button"
            aria-label="Siguiente destacado"
            class="hero--home__controls__nav"
            @click="next"
          >
            <IconChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Package as IconPackage,
  Search as IconSearch,
  Check as IconCheck,
  Star as IconStar,
  MapPin as IconPin,
  ArrowRight as IconArrow,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  X as IconX,
} from "lucide-vue-next";
import { useImageProxy } from "@/composables/useImage";
import type { Ad } from "@/types/ad";
import type { FilterCategory } from "@/types/filter";

const props = defineProps<{
  featuredAds?: Ad[];
  categories?: FilterCategory[];
}>();

const router = useRouter();
const { transformUrl } = useImageProxy();

// Search + autocomplete
const query = ref("");
const acOpen = ref(false);
const wrapRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const hasQuery = computed(() => query.value.trim().length > 0);
const visibleCats = computed(() => (props.categories ?? []).slice(0, 8));

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
  acOpen.value = false;
  router.push(`/anuncios/${s.slug}`);
};

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
  router.push({
    path: "/anuncios",
    query: term ? { s: term } : {},
  });
};

const pickCategory = (cat: FilterCategory) => {
  acOpen.value = false;
  router.push({ path: "/anuncios", query: { category: cat.slug, page: 1 } });
};

// Carousel
const featuredAds = computed(() => props.featuredAds ?? []);
const hasMultiple = computed(() => featuredAds.value.length > 1);
const currentIndex = ref(0);

const currentAd = computed<Ad | null>(
  () => featuredAds.value[currentIndex.value] ?? null,
);

const next = () => {
  if (featuredAds.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % featuredAds.value.length;
};
const prev = () => {
  if (featuredAds.value.length === 0) return;
  currentIndex.value =
    (currentIndex.value - 1 + featuredAds.value.length) %
    featuredAds.value.length;
};
const goTo = (index: number) => {
  currentIndex.value = index;
};

// Card derived data
const cardImage = computed(() => {
  const gallery = currentAd.value?.gallery;
  if (gallery && gallery.length > 0) {
    const first = gallery[0]?.formats?.medium?.url || gallery[0]?.url || "";
    return first ? transformUrl(first) : "";
  }
  return "";
});

const cardCategory = computed(() => {
  const category = currentAd.value?.category;
  if (typeof category === "object" && category !== null) {
    return {
      name: category.name || "",
      color: category.color || "#8a8794",
    };
  }
  return { name: "", color: "#8a8794" };
});

const cardCondition = computed(() => {
  const condition = currentAd.value?.condition;
  if (typeof condition === "object" && condition !== null) {
    return condition.name || "";
  }
  return "";
});

const cardMeta = computed(() => {
  const ad = currentAd.value;
  if (!ad) return "";
  const parts: string[] = [];
  if (typeof ad.commune === "object" && ad.commune !== null) {
    parts.push(ad.commune.name);
  }
  if (ad.year) parts.push(String(ad.year));
  return parts.join(" · ");
});

const cardPrice = computed(() => {
  const ad = currentAd.value;
  if (!ad) return "";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: ad.currency || "CLP",
  }).format(ad.price || 0);
});
</script>
