<template>
  <div ref="menuRef" class="header-icons__dropdown-wrap">
    <button
      ref="triggerRef"
      type="button"
      class="header-icons__trigger"
      title="Servicios"
      @click="open = !open"
    >
      <Grid3X3 :size="20" class="header-icons__trigger-icon" />
    </button>
    <div
      v-if="open"
      ref="panelRef"
      class="header-icons__panel header-icons__panel--services"
    >
      <h3 class="header-icons__panel-title">Servicios</h3>
      <div class="header-icons__panel-divider" />
      <div class="header-icons__services-grid">
        <a
          v-for="service in services"
          :key="service.name"
          :href="service.url"
          target="_blank"
          rel="noopener noreferrer"
          class="header-icons__service-item"
          @click="open = false"
        >
          <span class="header-icons__service-icon">
            <component
              :is="lucideIcons[service.icon]"
              :size="32"
              class="header-icons__service-icon-lucide"
            />
          </span>
          <span class="header-icons__service-label">{{ service.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  Grid3X3,
  Globe,
  Search,
  LayoutGrid,
  BarChart2,
  Rocket,
  Building2,
  TriangleAlert,
  Activity,
  MessageCircle,
  ShieldCheck,
  Layers,
} from "lucide-vue-next";

const services = useServices();

const lucideIcons: Record<string, any> = {
  Globe,
  Search,
  LayoutGrid,
  BarChart2,
  Rocket,
  Building2,
  TriangleAlert,
  Activity,
  MessageCircle,
  ShieldCheck,
  Layers,
};

const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

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
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
