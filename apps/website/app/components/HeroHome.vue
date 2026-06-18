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
        <form class="hero--home__search" @submit.prevent="onSearch">
          <label class="hero--home__search__field">
            <IconSearch :size="19" class="hero--home__search__field__icon" />
            <input
              v-model="query"
              type="text"
              maxlength="40"
              placeholder="Busca un aviso o categoría…"
              class="hero--home__search__field__input"
            />
          </label>
          <button type="submit" class="hero--home__search__button">
            Buscar
          </button>
        </form>

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
import { ref, computed } from "vue";
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
} from "lucide-vue-next";
import { useImageProxy } from "@/composables/useImage";
import type { Ad } from "@/types/ad";

const props = defineProps<{
  featuredAds?: Ad[];
}>();

const router = useRouter();
const { transformUrl } = useImageProxy();

// Search
const query = ref("");
const onSearch = () => {
  const term = query.value.slice(0, 40).toLowerCase().trim();
  router.push({
    path: "/anuncios",
    query: term ? { s: term } : {},
  });
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
