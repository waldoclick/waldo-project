<template>
  <header
    ref="header"
    class="header header--default"
    :class="{ 'header--default--hidden': isHeaderHidden }"
  >
    <div class="header--default__left">
      <button
        class="header--default__hamburger"
        aria-label="Abrir menú"
        @click="emit('toggle-sidebar')"
      >
        <Menu :size="24" />
      </button>
    </div>
    <div class="header--default__right">
      <ToolbarDefault v-if="user" />
      <DropdownUser v-if="user" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useScroll } from "@vueuse/core";
import { Menu } from "lucide-vue-next";
import ToolbarDefault from "@/components/ToolbarDefault.vue";
import DropdownUser from "@/components/DropdownUser.vue";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const header = ref<HTMLElement | null>(null);

// Obtener el usuario de Strapi
const user = useStrapiUser();

// Scroll handling para headroomjs behavior
const lastScrollPosition = ref(0);
const isHeaderHidden = ref(false);

const { y: scrollY } = useScroll(window);

watch(scrollY, (newY) => {
  // Determinar dirección del scroll y actualizar visibilidad del header
  const scrollingDown = newY > lastScrollPosition.value;
  isHeaderHidden.value = scrollingDown && newY > 80 ? true : false;

  lastScrollPosition.value = newY;
});
</script>
