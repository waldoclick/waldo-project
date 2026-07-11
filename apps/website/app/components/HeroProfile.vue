<template>
  <section class="hero hero--profile">
    <div class="hero--profile__container">
      <NuxtLink to="/anuncios" class="hero--profile__back">
        <IconArrowLeft :size="15" />
        Volver al marketplace
      </NuxtLink>

      <!-- Portada contenida (siempre) + avatar -->
      <div
        class="hero--profile__cover"
        :class="{ 'hero--profile__cover--pro': isPro }"
        :style="coverStyle"
      >
        <img
          v-if="coverImage"
          class="hero--profile__cover__img"
          :src="coverImage"
          alt="Portada del anunciante"
        />
        <div
          v-else-if="isPro"
          class="hero--profile__cover__deco"
          aria-hidden="true"
        >
          <span class="hero--profile__cover__deco__label"
            >portada · 1200 × 200</span
          >
        </div>
      </div>
      <span
        class="hero--profile__avatar"
        :class="
          isPro ? 'hero--profile__avatar--pro' : 'hero--profile__avatar--basic'
        "
      >
        <AvatarDefault size="large" :user="u" />
      </span>

      <!-- Identidad -->
      <div class="hero--profile__head">
        <div class="hero--profile__head__main">
          <div class="hero--profile__head__title">
            <h1 class="hero--profile__head__name">{{ displayName }}</h1>
            <span
              v-if="isPro"
              class="hero--profile__head__badge hero--profile__head__badge--pro"
            >
              <IconStar :size="11" />
              PRO
            </span>
            <span
              v-if="isVerified"
              class="hero--profile__head__badge hero--profile__head__badge--verified"
            >
              <IconCheck :size="12" />
              Verificado
            </span>
            <span
              v-else
              class="hero--profile__head__badge hero--profile__head__badge--unverified"
            >
              Sin verificar
            </span>
          </div>
          <div class="hero--profile__head__meta">
            <span v-if="atUser" class="hero--profile__head__meta__user">{{
              atUser
            }}</span>
            <span v-if="location" class="hero--profile__head__meta__item">
              <IconPin :size="14" />
              {{ location }}<template v-if="region"> · {{ region }}</template>
            </span>
            <span v-if="memberYear" class="hero--profile__head__meta__item">
              <IconCalendar :size="14" />
              Miembro desde {{ memberYear }}
            </span>
            <span class="hero--profile__head__meta__type">{{ typeLabel }}</span>
          </div>
        </div>

        <!-- Contacto -->
        <div class="hero--profile__head__contact">
          <template v-if="isLoggedIn">
            <a
              v-if="waLink"
              :href="waLink"
              target="_blank"
              rel="noopener"
              class="hero--profile__head__contact__wa"
            >
              <IconWhatsapp :size="17" />
              Escribir por WhatsApp
            </a>
            <div class="hero--profile__head__contact__row">
              <a
                v-if="telLink"
                :href="telLink"
                class="hero--profile__head__contact__call"
              >
                <IconPhone :size="15" />
                Llamar
              </a>
              <button
                type="button"
                class="hero--profile__head__contact__share"
                title="Compartir perfil"
                @click="copyLink"
              >
                <IconCheck v-if="copied" :size="16" />
                <IconLink v-else :size="16" />
              </button>
            </div>
          </template>
          <button
            v-else
            type="button"
            class="hero--profile__head__contact__login"
            @click="openLogin"
          >
            <IconLock :size="14" />
            Inicia sesión para contactar
          </button>
        </div>
      </div>

      <!-- Nota perfil estándar (no personalizado) -->
      <div v-if="!isPro" class="hero--profile__note">
        <IconInfo :size="15" />
        Perfil estándar · este anunciante no ha personalizado su página.
      </div>

      <!-- Métricas -->
      <div class="hero--profile__metrics">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="hero--profile__metrics__item"
        >
          <span class="hero--profile__metrics__item__value">{{
            metric.value
          }}</span>
          <span class="hero--profile__metrics__item__label">{{
            metric.label
          }}</span>
        </div>
      </div>

      <!-- Opera en -->
      <div v-if="catChips.length > 0" class="hero--profile__opera">
        <span class="hero--profile__opera__label">Opera en</span>
        <span
          v-for="chip in catChips"
          :key="chip.slug"
          class="hero--profile__opera__chip"
        >
          <span
            class="hero--profile__opera__chip__dot"
            :style="{ background: chip.dotBg }"
          ></span>
          {{ chip.name }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  ArrowLeft as IconArrowLeft,
  Star as IconStar,
  MapPin as IconPin,
  Calendar as IconCalendar,
  MessageCircle as IconWhatsapp,
  Phone as IconPhone,
  Link as IconLink,
  Check as IconCheck,
  Lock as IconLock,
  Info as IconInfo,
} from "lucide-vue-next";
import AvatarDefault from "@/components/AvatarDefault.vue";
import { useImageProxy } from "@/composables/useImage";
import { getCategoryHue } from "@/utils/categoryHue";
import { useAppStore } from "@/stores/app.store";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  ads: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
});

const me = useSessionUser();
const appStore = useAppStore();
const { transformUrl } = useImageProxy();

const u = computed(() => props.user || {});
const isLoggedIn = computed(() => !!me.value);
const isPro = computed(() => u.value.pro_status === "active");
// TODO(backend): no existe un campo de verificación de anunciante todavía.
const isVerified = computed(() => u.value.verified === true);

const displayName = computed(() => {
  if (u.value.is_company && u.value.business_name) return u.value.business_name;
  const full = `${u.value.firstname || ""} ${u.value.lastname || ""}`.trim();
  return full || u.value.username || "";
});

const atUser = computed(() => (u.value.username ? `@${u.value.username}` : ""));
const location = computed(() => u.value.commune?.name || "");
const region = computed(() => u.value.commune?.region?.name || "");
const typeLabel = computed(() => (u.value.is_company ? "Empresa" : "Persona"));

const memberYear = computed(() =>
  u.value.createdAt ? new Date(u.value.createdAt).getFullYear() : null,
);

// El color de la portada sale del hue de la categoría principal del anunciante
// (su primer aviso), igual que los chips. Como en el diseño (pSeller.coverHue).
const primaryCategory = computed(() => {
  const first = props.ads.find((ad) => ad?.category?.name);
  return first?.category?.name || "Minería";
});
const coverHue = computed(() => getCategoryHue(primaryCategory.value));

const coverImage = computed(() => {
  if (!isPro.value) return "";
  const cover = u.value.cover;
  if (!cover) return "";
  return transformUrl(cover.formats?.large?.url || cover.url);
});

// Sin imagen de portada: PRO -> degradado por hue; básico -> wash pálido.
const coverStyle = computed(() => {
  if (coverImage.value) return {};
  return {
    background: isPro.value
      ? `linear-gradient(118deg, ${coverHue.value.baseColor} 0%, ${coverHue.value.onColor} 80%)`
      : coverHue.value.wash,
  };
});

const phone = computed(() => u.value.phone || "");
const waLink = computed(() =>
  phone.value ? `https://wa.me/${phone.value.replace(/\D/g, "")}` : "",
);
const telLink = computed(() => (phone.value ? `tel:${phone.value}` : ""));

// TODO(backend): "Vendidos" y "Vistas totales" no tienen dato aún.
const metrics = computed(() => [
  {
    value: props.total,
    label: props.total === 1 ? "Aviso activo" : "Avisos activos",
  },
  { value: u.value.sold_count ?? 0, label: "Vendidos" },
  { value: memberYear.value ?? "—", label: "Miembro desde" },
  {
    value: (u.value.total_views ?? 0).toLocaleString("es-CL"),
    label: "Vistas totales",
  },
]);

// "Opera en": categorías únicas de los avisos cargados, punto por hue.
const catChips = computed(() => {
  const seen = new Map();
  for (const ad of props.ads) {
    const category = ad?.category;
    if (
      category &&
      typeof category === "object" &&
      category.name &&
      !seen.has(category.slug || category.name)
    ) {
      seen.set(category.slug || category.name, {
        name: category.name,
        slug: category.slug || category.name,
        dotBg: getCategoryHue(category.name).baseColor,
      });
    }
  }
  return [...seen.values()];
});

const copied = ref(false);
const copyLink = async () => {
  if (!import.meta.client) return;
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    copied.value = false;
  }
};

const openLogin = () => {
  appStore.openLoginLightbox();
};
</script>
