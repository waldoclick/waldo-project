<template>
  <section class="account account--main" aria-labelledby="account-title">
    <span class="account--main__eyebrow">Panel</span>
    <h1 id="account-title" class="account--main__greeting">
      Hola, {{ user?.firstname }} 👋
    </h1>
    <p class="account--main__intro">
      Este es el resumen de tu cuenta. Revisa lo que necesita tu atención y cómo
      rinden tus anuncios.
    </p>

    <div class="account--main__kpis">
      <!-- TODO 05-09: wire totalViews to /ads/me/views-total -->
      <div class="account--main__kpi">
        <div class="account--main__kpi__head">
          <span class="account--main__kpi__label">Vistas totales</span>
          <IconEye :size="18" />
        </div>
        <div class="account--main__kpi__value">{{ totalViews }}</div>
        <span class="account--main__kpi__sub">en anuncios activos</span>
      </div>
      <div class="account--main__kpi">
        <div class="account--main__kpi__head">
          <span class="account--main__kpi__label">Contactos recibidos</span>
          <IconPhone :size="18" />
        </div>
        <div class="account--main__kpi__value">{{ totalContacts }}</div>
        <span class="account--main__kpi__sub">llamadas y mensajes</span>
      </div>
      <div class="account--main__kpi">
        <div class="account--main__kpi__head">
          <span class="account--main__kpi__label">Anuncios activos</span>
          <IconPackage :size="18" />
        </div>
        <div class="account--main__kpi__value">{{ activeCount }}</div>
        <span class="account--main__kpi__sub">de {{ totalCount }} publicados</span>
      </div>
    </div>

    <div class="account--main__attention">
      <div class="account--main__attention__head">
        <h2 class="account--main__attention__title">Necesita tu atención</h2>
        <span
          v-if="rejectedCount > 0"
          class="account--main__attention__count"
          >{{ rejectedCount }}</span
        >
      </div>

      <div v-if="rejectedCount > 0" class="account--main__attention__list">
        <div class="account--main__attention__row account--main__attention__row--error">
          <span class="account--main__attention__row__icon">
            <IconCircleAlert :size="24" />
          </span>
          <div class="account--main__attention__row__body">
            <div class="account--main__attention__row__top">
              <span class="account--main__attention__row__title">
                Tienes {{ rejectedCount }}
                {{ rejectedCount === 1 ? "anuncio rechazado" : "anuncios rechazados" }}
              </span>
              <span class="account--main__attention__badge account--main__attention__badge--rejected">Rechazado</span>
            </div>
            <p class="account--main__attention__row__note">
              Revisa el motivo del rechazo y corrige tu anuncio para volver a publicarlo.
            </p>
          </div>
          <nuxt-link
            to="/cuenta/mis-anuncios"
            class="account--main__attention__action"
          >
            <IconCircleAlert :size="15" />
            Ver motivo
          </nuxt-link>
        </div>
      </div>

      <div v-else class="account--main__attention__ok">
        <span class="account--main__attention__ok__icon">
          <IconCheckCheck :size="24" />
        </span>
        <div>
          <span class="account--main__attention__ok__title">Todo al día</span>
          <p class="account--main__attention__ok__note">
            No tienes anuncios por vencer ni rechazados. Tus publicaciones están en
            orden.
          </p>
        </div>
      </div>
    </div>

    <div class="account--main__upsell">
      <div class="account--main__upsell__glow" />
      <div class="account--main__upsell__body">
        <span class="account--main__upsell__pill">Ahorra hasta 98%</span>
        <h3 class="account--main__upsell__title">Publica más, paga menos</h3>
        <p class="account--main__upsell__text">
          Compra un pack de avisos y úsalos cuando quieras. Cada anuncio se publica
          por 45 días.
        </p>
      </div>
      <nuxt-link to="/packs" class="account--main__upsell__buy">
        Comprar packs
        <IconArrowRight :size="16" />
      </nuxt-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAsyncData } from "nuxt/app";
import {
  Eye as IconEye,
  Phone as IconPhone,
  Package as IconPackage,
  CheckCheck as IconCheckCheck,
  CircleAlert as IconCircleAlert,
  ArrowRight as IconArrowRight,
} from "lucide-vue-next";
import type { User } from "@/types/user";

const user = useSessionUser<User>();
const userStore = useUserStore();

const { data: counts } = await useAsyncData(
  "account-panel-counts",
  () => userStore.loadUserAdCounts(),
  {
    default: () => ({
      published: 0,
      review: 0,
      expired: 0,
      rejected: 0,
      banned: 0,
    }),
  },
);

// TODO 05-09: wire to real /ads/me aggregation
const totalViews = 0;
const totalContacts = 0;

const activeCount = computed(() => counts.value.published);
const totalCount = computed(
  () =>
    counts.value.published +
    counts.value.review +
    counts.value.expired +
    counts.value.rejected +
    counts.value.banned,
);
const rejectedCount = computed(() => counts.value.rejected);
</script>
