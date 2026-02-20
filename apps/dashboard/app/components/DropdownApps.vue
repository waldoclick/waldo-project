<template>
  <div ref="dropdownRef" class="dropdown dropdown--apps">
    <button
      ref="triggerRef"
      type="button"
      class="dropdown--apps__trigger"
      title="Servicios"
      @click="open = !open"
    >
      <Grid3X3 :size="20" class="dropdown--apps__trigger__icon" />
    </button>
    <div v-if="open" ref="panelRef" class="dropdown--apps__panel">
      <h3 class="dropdown--apps__panel__title">Servicios</h3>
      <div class="dropdown--apps__panel__divider" />
      <div class="dropdown--apps__grid">
        <a
          v-for="service in services"
          :key="service.name"
          :href="service.url"
          target="_blank"
          rel="noopener noreferrer"
          class="dropdown--apps__item"
          @click="open = false"
        >
          <span class="dropdown--apps__item__icon">
            <component
              :is="lucideIcons[service.icon]"
              :size="32"
              class="dropdown--apps__item__icon__svg"
            />
          </span>
          <span class="dropdown--apps__item__label">{{ service.name }}</span>
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
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

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
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
