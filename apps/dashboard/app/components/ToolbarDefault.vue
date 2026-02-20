<template>
  <div class="toolbar toolbar--default">
    <DropdownApps />
    <DropdownSales />
    <DropdownPendings />
    <button
      v-if="fullscreenAllowed"
      type="button"
      class="toolbar--default__trigger"
      :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
      @click="toggleFullscreen"
    >
      <Minimize2
        v-if="isFullscreen"
        :size="20"
        class="toolbar--default__trigger__icon"
      />
      <Maximize2 v-else :size="20" class="toolbar--default__trigger__icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Maximize2, Minimize2 } from "lucide-vue-next";
import DropdownApps from "@/components/DropdownApps.vue";
import DropdownSales from "@/components/DropdownSales.vue";
import DropdownPendings from "@/components/DropdownPendings.vue";

const isFullscreen = ref(false);
/** Fullscreen solo disponible cuando no estamos en iframe y el navegador lo permite */
const fullscreenAllowed = ref(false);

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const toggleFullscreen = async () => {
  try {
    await (!document.fullscreenElement
      ? document.documentElement.requestFullscreen()
      : document.exitFullscreen());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("permissions policy") && !msg.includes("Permission")) {
      console.error("Error toggling fullscreen:", err);
    }
  }
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  fullscreenAllowed.value =
    typeof document.fullscreenEnabled === "boolean" &&
    document.fullscreenEnabled &&
    typeof window !== "undefined" &&
    window.self === window.top;
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>
