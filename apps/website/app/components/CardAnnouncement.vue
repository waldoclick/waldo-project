<template>
  <article
    class="card card--announcement"
    :class="{ 'card--announcement--sold': sold }"
    role="article"
  >
    <NuxtLink
      :to="`/anuncios/${all.slug}`"
      :title="all.name"
      :aria-label="'Ver detalles de ' + all.name"
      class="card--announcement__media"
    >
      <NuxtImg
        v-if="getFirstImage"
        :src="getFirstImage"
        :alt="'Imagen del anuncio: ' + all.name"
        :title="all.name"
        width="400"
        height="300"
        loading="lazy"
        format="webp"
        remote
      />
      <span
        v-if="sold"
        class="card--announcement__media__veil"
        aria-hidden="true"
      ></span>
      <span
        v-if="sold"
        class="card--announcement__media__sold"
        role="status"
        aria-label="Anuncio vendido"
      >
        <IconCheck
          :size="12"
          class="card--announcement__media__sold__icon"
        />
        Vendido
      </span>
      <span
        v-if="!sold && galleryCount > 0"
        class="card--announcement__media__count"
        aria-label="Cantidad de imágenes del anuncio"
      >
        <IconImage :size="13" />
        {{ photosLabel }}
      </span>
      <span
        v-if="!sold && isFeatured"
        class="card--announcement__media__featured"
        role="status"
        aria-label="Anuncio destacado"
      >
        <IconStar
          :size="12"
          class="card--announcement__media__featured__icon"
        />
        Destacado
      </span>
    </NuxtLink>

    <div class="card--announcement__body">
      <NuxtLink
        :to="`/anuncios?category=${getCategory.slug}`"
        :title="'Ver anuncios en categoría ' + getCategory.name"
        class="card--announcement__body__cat"
      >
        <span
          class="card--announcement__body__cat__dot"
          :style="{ backgroundColor: getCategory.color }"
        ></span>
        {{ getCategory.name }}
      </NuxtLink>

      <h3 class="card--announcement__body__title">
        <NuxtLink
          :to="`/anuncios/${all.slug}`"
          :title="all.name"
          :aria-label="'Ver detalles de ' + all.name"
        >
          {{ stringTruncate(all.name, 60) }}
        </NuxtLink>
      </h3>

      <span
        v-if="!sold && metaLine"
        class="card--announcement__body__meta"
        aria-label="Detalles del anuncio"
      >
        <IconPin :size="13" class="card--announcement__body__meta__icon" />
        {{ metaLine }}
      </span>

      <div
        class="card--announcement__body__price"
        aria-label="Precio del anuncio"
      >
        <strong>{{ formattedCurrency }}</strong>
        <span v-if="!sold" aria-hidden="true">+ IVA</span>
      </div>

      <template v-if="!sold">
        <NuxtLink
          v-if="!user"
          to="/login"
          class="card--announcement__body__reminder"
          aria-label="Iniciar sesión para ver al anunciante"
        >
          <IconLock
            :size="13"
            class="card--announcement__body__reminder__icon"
          />
          Inicia sesión para ver al anunciante
        </NuxtLink>
        <NuxtLink
          v-else-if="
            route.params.slug !== getUser.username &&
            getUser.pro_status === 'active'
          "
          :to="`/${getUser.username}`"
          class="card--announcement__body__seller"
          :title="'Ver perfil de ' + getUser.firstname"
          aria-label="Información del vendedor"
        >
          <IconUser :size="14" class="card--announcement__body__seller__icon" />
          {{ getUser.firstname }}
        </NuxtLink>
      </template>

      <span
        v-if="sold && soldWhen"
        class="card--announcement__body__sold"
        aria-label="Fecha de venta"
      >
        Vendido {{ soldWhen }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { Ad } from "~/types/ad";
import { useImageProxy } from "@/composables/useImage";
import {
  Image as IconImage,
  Star as IconStar,
  MapPin as IconPin,
  Lock as IconLock,
  User as IconUser,
  Check as IconCheck,
} from "lucide-vue-next";

const user = useSessionUser();
const route = useRoute();

// Use the image proxy composable
const { transformUrl } = useImageProxy();

// Props
const props = defineProps({
  all: {
    type: Object as () => Ad,
    default: () => ({}),
  },
  sold: {
    type: Boolean,
    default: false,
  },
  soldWhen: {
    type: String,
    default: "",
  },
});

// Helper methods
const stringTruncate = (str: string, length: number): string => {
  return str.length > length ? str.slice(0, Math.max(0, length)) + "..." : str;
};

const formattedCurrency = computed(() => {
  const value = props.all.price;
  const money = props.all.currency;

  const config: Intl.NumberFormatOptions = {
    style: "currency",
    currency: money,
  };

  return new Intl.NumberFormat("es-CL", config).format(value || 0);
});

const getUser = computed(() => {
  return props.all.user || {};
});

const getFirstImage = computed(() => {
  const gallery = props.all.gallery;

  if (gallery && gallery.length > 0) {
    const firstImage =
      gallery[0]?.formats?.medium?.url || gallery[0]?.url || "";
    return transformUrl(firstImage);
  }
  return "";
});

const isFeatured = computed(() => {
  return props.all.ad_featured_reservation ? true : false;
});

const getCategory = computed(() => {
  const category =
    typeof props.all.category === "object" && props.all.category !== null
      ? props.all.category
      : {};

  const {
    name = "Unknown",
    slug = "unknown",
    color = "#8a8794",
  } = category as { name?: string; slug?: string; color?: string };

  return { name, slug, color };
});

const getCondition = computed(() => {
  const condition = props.all.condition;
  if (typeof condition === "object" && condition !== null) {
    return condition.name || "";
  }
  return "";
});

const metaLine = computed(() => {
  const parts: string[] = [];
  const commune = props.all.commune;
  if (typeof commune === "object" && commune !== null) {
    parts.push(commune.name);
  }
  if (props.all.year) parts.push(String(props.all.year));
  if (getCondition.value) parts.push(getCondition.value);
  return parts.join(" · ");
});

const galleryCount = computed(() => {
  const gallery = props.all.gallery;
  return gallery && Array.isArray(gallery) ? gallery.length : 0;
});

const photosLabel = computed(() => {
  const count = galleryCount.value;
  return `${count} ${count === 1 ? "foto" : "fotos"}`;
});
</script>
