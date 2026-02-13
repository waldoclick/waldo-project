<template>
  <!-- <client-only> -->
  <header
    ref="header"
    class="header header--default"
    :class="{
      'header--default--white': !isTrasparent,
      'header--default--hidden': isHeaderHidden,
      'header--default--scrolled': !isTop,
      'header--default--scrolled-dark': !isTop && isTrasparent,
      'header--default--scrolled-light': !isTop && !isTrasparent,
    }"
  >
    <div class="header--default__left">
      <div class="header--default__lateral">
        <button
          title="Abrir/Cerrar menú mobile"
          class="mobile--bar__trigger"
          @click="appStore.toggleMobileMenu()"
        >
          <IconMenu :size="32" class="mobile--bar_open" />
        </button>
        <!-- <MobileBar /> -->
      </div>
      <div class="header--default__logo">
        <LogoWhite v-if="isTrasparent" />
        <LogoBlack v-else />
      </div>
      <div v-if="showSearch" class="header--default__form">
        <SearchDefault type="header" />
      </div>
      <div v-if="showMenu" class="header--default__menu">
        <MenuDefault />
      </div>
    </div>
    <div class="header--default__right">
      <div class="header--default__search">
        <SearchIcon :white="isTrasparent && isTop" />
      </div>
      <div
        v-if="user && route.path !== '/anunciar'"
        class="header--default__announcement"
      >
        <nuxt-link
          title="Anunciar ahora"
          to="/anunciar"
          class="btn btn--announcement"
        >
          <ClientOnly>
            <IconPencil v-if="adStore.hasFormInProgress" :size="16" />
          </ClientOnly>
          <span>Anunciar ahora</span>
        </nuxt-link>
      </div>
      <div v-if="!user" class="header--default__auth">
        <MenuAuth :white="isTrasparent && isTop" />
      </div>
      <div v-if="user" class="header--default__user">
        <MenuUser />
      </div>
      <div v-if="user" class="header--default__avatar">
        <AvatarDefault />
      </div>
    </div>
  </header>
  <!-- </client-only> -->
</template>

<script setup lang="ts">
import LogoWhite from "@/components/LogoWhite.vue";
import LogoBlack from "@/components/LogoBlack.vue";
import MenuAuth from "@/components/MenuAuth.vue";
import MenuDefault from "@/components/MenuDefault.vue";
import MenuUser from "@/components/MenuUser.vue";
import SearchDefault from "@/components/SearchDefault.vue";
import SearchIcon from "@/components/SearchIcon.vue";
import MobileBar from "@/components/MobileBar.vue";
import AvatarDefault from "@/components/AvatarDefault.vue";
import { useScroll } from "@vueuse/core";
import { Pencil as IconPencil } from "lucide-vue-next";
import { useAdStore } from "@/stores/ad.store";
import { useAppStore } from "@/stores/app.store";
import { Menu as IconMenu } from "lucide-vue-next";

const route = useRoute();
const header = ref<HTMLElement | null>(null);

// Obtener el usuario de Strapi
const user = useStrapiUser();

// Define las propiedades del componente
const props = defineProps<{
  isTrasparent?: boolean | string;
  showSearch?: boolean;
  showMenu?: boolean;
  bgColor?: string;
}>();

// Define las propiedades con valores por defecto
const isTrasparent = props.isTrasparent ?? false;
const showSearch = props.showSearch ?? false;
const showMenu = props.showMenu ?? false;
const bgColor = props.bgColor ?? "#ffffff";

// Scroll handling
const lastScrollPosition = ref(0);
const isHeaderHidden = ref(false);
const isTop = ref(true);

const { y: scrollY } = useScroll(window);

const adStore = useAdStore();
const appStore = useAppStore();

watch(scrollY, (newY) => {
  // Check if we're at the top
  isTop.value = newY < 50;

  // Determine scroll direction and update header visibility
  const scrollingDown = newY > lastScrollPosition.value;
  isHeaderHidden.value = scrollingDown && newY > 80 ? true : false;

  lastScrollPosition.value = newY;
});
</script>
