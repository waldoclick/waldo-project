<template>
  <section class="account account--main" aria-labelledby="account-title">
    <span class="account--main__eyebrow">Panel</span>
    <h1 id="account-title" class="account--main__greeting">
      Hola, {{ user?.firstname }} <span aria-hidden="true">👋</span>
    </h1>
    <p class="account--main__intro">
      Este es el resumen de tu cuenta. Revisa lo que necesita tu atención y cómo
      rinden tus anuncios.
    </p>

    <div class="account--main__kpis">
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
        <span class="account--main__kpi__sub"
          >de {{ totalCount }} publicados</span
        >
      </div>
    </div>

    <div class="account--main__attention">
      <div class="account--main__attention__head">
        <h2 class="account--main__attention__title">Necesita tu atención</h2>
        <span
          v-if="attentionItems.length"
          class="account--main__attention__count"
          >{{ attentionItems.length }}</span
        >
      </div>

      <div v-if="attentionItems.length" class="account--main__attention__list">
        <div
          v-for="item in attentionItems"
          :key="item.key"
          class="account--main__attention__row"
          :class="`account--main__attention__row--${item.variant}`"
        >
          <span
            class="account--main__attention__row__icon"
            :style="{ background: item.color }"
          >
            <component :is="item.icon" :size="24" />
          </span>
          <div class="account--main__attention__row__body">
            <div class="account--main__attention__row__top">
              <span class="account--main__attention__row__title">{{
                item.title
              }}</span>
              <span
                class="account--main__attention__badge"
                :class="`account--main__attention__badge--${item.variant}`"
                >{{ item.badge }}</span
              >
            </div>
            <p class="account--main__attention__row__note">{{ item.note }}</p>
          </div>
          <button
            v-if="item.actionType === 'stats'"
            type="button"
            class="account--main__attention__action"
            @click="openStatsForAd(item.adRef)"
          >
            <component :is="item.actionIcon" :size="15" />
            {{ item.actionLabel }}
          </button>
          <nuxt-link
            v-else
            :to="item.to"
            class="account--main__attention__action"
          >
            <component :is="item.actionIcon" :size="15" />
            {{ item.actionLabel }}
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
            No tienes anuncios por vencer ni rechazados. Tus publicaciones están
            en orden.
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
          Compra un pack de avisos y úsalos cuando quieras. Cada anuncio se
          publica por 45 días.
        </p>
      </div>
      <nuxt-link to="/packs" class="account--main__upsell__buy">
        Comprar packs
        <IconArrowRight :size="16" />
      </nuxt-link>
    </div>

    <StatsAdModal :open="statsOpen" :ad="statsAd" @close="statsOpen = false" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAsyncData } from "nuxt/app";
import {
  Eye as IconEye,
  Phone as IconPhone,
  Package as IconPackage,
  CheckCheck as IconCheckCheck,
  CircleAlert as IconCircleAlert,
  ChartNoAxesColumn as IconChart,
  ArrowRight as IconArrowRight,
} from "lucide-vue-next";
import type { User } from "@/types/user";
import type { Ad } from "@/types/ad";
import type { Category } from "@/types/category";
import StatsAdModal from "@/components/StatsAdModal.vue";

const user = useSessionUser<User>();
const userStore = useUserStore();
const { getCategoryIcon } = useIcons();

const EXPIRING_THRESHOLD = 7;
const FALLBACK_COLOR = "#ece9e4";

const { data: panel } = await useAsyncData(
  "account-panel",
  async () => {
    const [counts, published, rejected, viewsTotal, contactsTotal] =
      await Promise.all([
        userStore.loadUserAdCounts(),
        userStore.loadUserAds("published", { page: 1, pageSize: 50 }),
        userStore.loadUserAds("rejected", { page: 1, pageSize: 25 }),
        userStore.loadPanelViewsTotal(),
        userStore.loadContactsTotal(),
      ]);
    return {
      counts,
      published: published?.data ?? [],
      rejected: rejected?.data ?? [],
      totalViews: viewsTotal.total,
      totalContacts: contactsTotal.total,
    };
  },
  {
    default: () => ({
      counts: { published: 0, review: 0, expired: 0, rejected: 0, banned: 0 },
      published: [] as Ad[],
      rejected: [] as Ad[],
      totalViews: 0,
      totalContacts: 0,
    }),
  },
);

const totalViews = computed(() => panel.value.totalViews);
const totalContacts = computed(() => panel.value.totalContacts);

const counts = computed(() => panel.value.counts);
const activeCount = computed(() => counts.value.published);
const totalCount = computed(
  () =>
    counts.value.published +
    counts.value.review +
    counts.value.expired +
    counts.value.rejected +
    counts.value.banned,
);

const catOf = (ad: Ad) =>
  (typeof ad.category === "object" ? ad.category : null) as Category | null;

// Stats modal state
const statsOpen = ref(false);
const statsAd = ref<{
  documentId: string;
  name: string;
  category?: string;
  status?: string;
} | null>(null);

const openStatsForAd = (adRef: {
  documentId: string;
  name: string;
  category?: string;
  status?: string;
}) => {
  statsAd.value = adRef;
  statsOpen.value = true;
};

interface AttentionItem {
  key: string;
  variant: "expiring" | "rejected";
  title: string;
  color: string;
  icon: unknown;
  badge: string;
  note: string;
  actionLabel: string;
  actionIcon: unknown;
  actionType: "stats" | "link";
  adRef: {
    documentId: string;
    name: string;
    category?: string;
    status?: string;
  };
  to: string;
}

const attentionItems = computed<AttentionItem[]>(() => {
  const expiring: AttentionItem[] = panel.value.published
    .filter(
      (a) => a.remaining_days > 0 && a.remaining_days <= EXPIRING_THRESHOLD,
    )
    .map((a) => {
      const cat = catOf(a);
      return {
        key: `pv-${a.id}`,
        variant: "expiring" as const,
        title: a.title,
        color: cat?.color ?? FALLBACK_COLOR,
        icon: getCategoryIcon(cat?.slug ?? ""),
        badge: `Vence en ${a.remaining_days} días`,
        note: "Aún no puedes renovarlo: los anuncios solo se renuevan una vez vencidos. Cuando expire lo republicas en un clic. Mientras tanto, revisa cómo va.",
        actionLabel: "Ver estadísticas",
        actionIcon: IconChart,
        actionType: "stats" as const,
        adRef: {
          documentId: a.documentId,
          name: a.title,
          category:
            typeof a.category === "object" && a.category !== null
              ? (a.category as Category).name
              : undefined,
          status: "published",
        },
        to: `/anuncios/${a.slug}`,
      };
    });

  const rejected: AttentionItem[] = panel.value.rejected.map((a) => {
    const cat = catOf(a);
    return {
      key: `rj-${a.id}`,
      variant: "rejected" as const,
      title: a.title,
      color: cat?.color ?? FALLBACK_COLOR,
      icon: getCategoryIcon(cat?.slug ?? ""),
      badge: "Rechazado",
      note:
        a.reason_for_rejection ||
        "Tu anuncio fue rechazado. Revisa y corrige para volver a publicarlo.",
      actionLabel: "Ver motivo",
      actionIcon: IconCircleAlert,
      actionType: "link" as const,
      adRef: { documentId: a.documentId, name: a.title },
      to: "/cuenta/mis-anuncios",
    };
  });

  return [...expiring, ...rejected];
});
</script>
