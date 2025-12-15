<template>
  <article
    ref="cardElement"
    class="card card--announcement"
    role="article"
    aria-labelledby="announcement-title"
  >
    <!-- Tag con cantidad de imágenes -->
    <div
      v-if="galleryCount > 0"
      class="card--announcement__image-count"
      aria-label="Cantidad de imágenes del anuncio"
    >
      <IconImage :size="14" />
      <span>{{ galleryCount }}</span>
    </div>

    <div
      v-if="isFeatured"
      class="card--announcement__featured"
      role="status"
      aria-label="Estado del anuncio"
    >
      Destacado
    </div>
    <div class="card--announcement__image">
      <NuxtLink
        :to="`/anuncios/${all.slug}`"
        :title="all.name"
        :aria-label="'Ver detalles de ' + all.name"
      >
        <NuxtImg
          :src="getFirstImage"
          :alt="'Imagen del anuncio: ' + all.name"
          :title="all.name"
          width="400"
          height="300"
          loading="lazy"
          format="webp"
          remote
        />
      </NuxtLink>
    </div>

    <div class="card--announcement__info">
      <nav
        class="card--announcement__info__categories"
        aria-label="Categoría del anuncio"
      >
        <NuxtLink
          :to="`/anuncios?category=${getCategory.slug}`"
          :title="'Ver anuncios en categoría ' + getCategory.name"
          :aria-label="
            'Ver todos los anuncios en la categoría ' + getCategory.name
          "
        >
          {{ getCategory.name }}
          <!-- - {{ all.remaining_days }} -->
        </NuxtLink>
      </nav>
      <h3 id="announcement-title" class="card--announcement__info__name">
        <NuxtLink
          :to="`/anuncios/${all.slug}`"
          :title="all.name"
          :aria-label="'Ver detalles de ' + all.name"
        >
          {{ stringTruncate(all.name, 60) }}
        </NuxtLink>
      </h3>
      <div
        class="card--announcement__info__price"
        aria-label="Precio del anuncio"
      >
        <NuxtLink
          :to="`/anuncios/${all.slug}`"
          :title="'Ver detalles del precio: ' + formattedCurrency"
          :aria-label="'Precio: ' + formattedCurrency + ' más IVA'"
        >
          <strong>{{ formattedCurrency }}</strong>
          <span aria-hidden="true"> + IVA</span>
        </NuxtLink>
      </div>
      <div
        v-if="user && route.params.slug !== getUser.username && getUser.pro"
        class="card--announcement__info__by"
        aria-label="Información del vendedor"
      >
        <span aria-hidden="true">Por: </span>
        <NuxtLink
          :to="`/${getUser.username}`"
          :title="'Ver perfil de ' + getUser.firstname + ' ' + getUser.lastname"
          :aria-label="
            'Ver perfil del vendedor: ' +
            getUser.firstname +
            ' ' +
            getUser.lastname
          "
        >
          {{ getUser.firstname }}
          <!-- {{ getUser.lastname }} -->
        </NuxtLink>
      </div>
      <NuxtLink
        v-if="!user"
        to="/login"
        class="card--announcement__info__reminder"
        aria-label="Iniciar sesión para ver información del vendedor"
      >
        Inicia sesión para ver al anunciante
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRuntimeConfig } from "#app";
import { useRoute } from "vue-router";
import type { Announcement } from "~/types/ad";
import { useImageProxy } from "@/composables/useImage";
import { Image as IconImage } from "lucide-vue-next";

// Accede a la configuración de runtime
const config = useRuntimeConfig();
const user = useStrapiUser();
const route = useRoute();

// Use the image proxy composable
const { transformUrl } = useImageProxy();

// Props
const props = defineProps({
  all: {
    type: Object as () => Announcement,
    default: () => ({}),
  },
});

// Helper methods
const stringTruncate = (str: string, length: number): string => {
  return str.length > length ? str.slice(0, Math.max(0, length)) + "..." : str;
};

const priceFormattedCurrency = (price: number, currency: string): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
  }).format(price);
};

const formattedCurrency = computed(() => {
  const value = props.all.price;
  const money = props.all.currency;

  const config: Intl.NumberFormatOptions = {
    style: "currency",
    currency: money,
  };

  const format = "es-CL";
  return new Intl.NumberFormat(format, config).format(value || 0);
});

const getUser = computed(() => {
  return props.all.user || {};
});

const getFirstImage = computed(() => {
  const gallery = props.all.gallery;

  if (gallery && gallery.length > 0) {
    const firstImage = gallery[0]?.formats?.medium?.url || gallery[0]?.url;
    return transformUrl(firstImage);
  }
  return "";
});

const isFeatured = computed(() => {
  return props.all.ad_featured_reservation ? true : false;
});

const getCategory = computed(() => {
  const category = props.all.category || {};

  // Excluir las fechas y devolver valores por defecto si no existen
  const { name = "Unknown", slug = "unknown", color = "#000" } = category;

  return { name, slug, color };
});

const galleryCount = computed(() => {
  const gallery = props.all.gallery;
  return gallery && Array.isArray(gallery) ? gallery.length : 0;
});

// Referencia al elemento card
const cardElement = ref(null);

// Establecer variables CSS iniciales
onMounted(() => {
  if (cardElement.value && cardElement.value.style) {
    cardElement.value.style.setProperty(
      "--announcement-category-color",
      getCategory.value.color
    );
  }
});
</script>
