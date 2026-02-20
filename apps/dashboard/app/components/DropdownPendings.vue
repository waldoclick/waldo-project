<template>
  <div ref="dropdownRef" class="dropdown dropdown--pendings">
    <button
      ref="triggerRef"
      type="button"
      class="dropdown--pendings__trigger dropdown--pendings__trigger--badge"
      title="Anuncios pendientes"
      @click="open = !open"
    >
      <Bell :size="20" class="dropdown--pendings__trigger__icon" />
      <span
        v-if="pendingCount > 0"
        class="dropdown--pendings__badge"
        :class="{
          'dropdown--pendings__badge--dot': pendingCount > 10,
        }"
      >
        <template v-if="pendingCount <= 10">{{ pendingCount }}</template>
        <Circle v-else :size="8" class="dropdown--pendings__badge__dot" />
      </span>
    </button>
    <div v-if="open" ref="panelRef" class="dropdown--pendings__panel">
      <div class="dropdown--pendings__panel__head">
        <h3 class="dropdown--pendings__panel__title">Anuncios Pendientes</h3>
        <NuxtLink
          to="/anuncios/pendientes"
          class="dropdown--pendings__panel__link"
          @click="open = false"
        >
          Ver todas
          <ExternalLink
            :size="12"
            class="dropdown--pendings__panel__link__icon"
          />
        </NuxtLink>
      </div>
      <div class="dropdown--pendings__panel__body">
        <p v-if="loading" class="dropdown--pendings__panel__message">
          Cargando...
        </p>
        <div
          v-else-if="!loading && ads.length === 0"
          class="dropdown--pendings__panel__empty"
        >
          <span class="dropdown--pendings__panel__empty__icon">
            <CheckCircle2 :size="24" />
          </span>
          <p class="dropdown--pendings__panel__empty__title">Todo al día</p>
          <p class="dropdown--pendings__panel__empty__text">
            No hay anuncios pendientes de revisión
          </p>
        </div>
        <NuxtLink
          v-for="(ad, index) in ads"
          :key="ad.id"
          :to="`/anuncios/${ad.id}`"
          class="dropdown--pendings__list__item"
          :class="{
            'dropdown--pendings__list__item--border': index < ads.length - 1,
          }"
          @click="open = false"
        >
          <div class="dropdown--pendings__list__item__main">
            <span class="dropdown--pendings__list__item__title">{{
              ad.name
            }}</span>
            <span class="dropdown--pendings__list__item__meta">
              {{ ad.user?.username || ad.user?.email || "Usuario" }} •
              {{ formatTime(ad.createdAt) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Bell, CheckCircle2, Circle, ExternalLink } from "lucide-vue-next";

interface Ad {
  id: number;
  name: string;
  createdAt: string;
  user?: { username?: string; email?: string };
}

const strapi = useStrapi();

const open = ref(false);
const loading = ref(true);
const ads = ref<Ad[]>([]);
const pendingCount = ref(0);
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const fetchPendings = async () => {
  try {
    loading.value = true;
    const res = (await strapi.find("ads/pendings", {
      pagination: { page: 1, pageSize: 10 },
      sort: "createdAt:asc",
      populate: ["user"],
    })) as {
      data?: Ad[];
      meta?: { pagination?: { total?: number } };
    };
    ads.value = Array.isArray(res.data) ? res.data : [];
    pendingCount.value = res.meta?.pagination?.total ?? ads.value.length;
  } catch (error) {
    console.error("Error fetching pending ads:", error);
    ads.value = [];
    pendingCount.value = 0;
  } finally {
    loading.value = false;
  }
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    open.value
  ) {
    open.value = false;
  }
};

onMounted(() => {
  fetchPendings();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
