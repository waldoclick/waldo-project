<template>
  <div ref="menuRef" class="header-icons__dropdown-wrap">
    <button
      ref="triggerRef"
      type="button"
      class="header-icons__trigger header-icons__trigger--badge"
      title="Anuncios pendientes"
      @click="open = !open"
    >
      <Bell :size="20" class="header-icons__trigger-icon" />
      <span
        v-if="pendingCount > 0"
        class="header-icons__badge"
        :class="{
          'header-icons__badge--dot': pendingCount > 10,
        }"
      >
        <template v-if="pendingCount <= 10">{{ pendingCount }}</template>
        <Circle v-else :size="8" class="header-icons__badge-dot" />
      </span>
    </button>
    <div
      v-if="open"
      ref="panelRef"
      class="header-icons__panel header-icons__panel--list"
    >
      <div class="header-icons__panel-head">
        <h3 class="header-icons__panel-title">Anuncios Pendientes</h3>
        <NuxtLink
          to="/anuncios/pendientes"
          class="header-icons__panel-link"
          @click="open = false"
        >
          Ver todas
          <ExternalLink :size="12" class="header-icons__panel-link-icon" />
        </NuxtLink>
      </div>
      <div class="header-icons__panel-body">
        <p v-if="loading" class="header-icons__panel-message">Cargando...</p>
        <div
          v-else-if="!loading && ads.length === 0"
          class="header-icons__panel-empty"
        >
          <span class="header-icons__panel-empty-icon">
            <CheckCircle2 :size="24" />
          </span>
          <p class="header-icons__panel-empty-title">Todo al día</p>
          <p class="header-icons__panel-empty-text">
            No hay anuncios pendientes de revisión
          </p>
        </div>
        <NuxtLink
          v-for="(ad, index) in ads"
          :key="ad.id"
          :to="`/anuncios/${ad.id}`"
          class="header-icons__list-item"
          :class="{
            'header-icons__list-item--border': index < ads.length - 1,
          }"
          @click="open = false"
        >
          <div class="header-icons__list-item-main">
            <span class="header-icons__list-item-title">{{ ad.name }}</span>
            <span class="header-icons__list-item-meta">
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
const menuRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const fetchPendingAds = async () => {
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
    menuRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    open.value
  ) {
    open.value = false;
  }
};

onMounted(() => {
  fetchPendingAds();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
