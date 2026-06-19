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
    <div class="header--default__inner">
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
        <div v-if="showMenu" class="header--default__menu">
          <MenuDefault />
        </div>
      </div>
      <div class="header--default__right">
        <div v-if="searchIcon" class="header--default__search">
          <SearchIcon :white="isTrasparent && isTop" />
        </div>
        <span class="header--default__divider" aria-hidden="true"></span>
        <div
          v-if="
            user &&
            !route.path.startsWith('/anunciar') &&
            route.path !== '/pagar'
          "
          class="header--default__announcement"
        >
          <nuxt-link
            title="Anunciar ahora"
            to="/anunciar"
            class="btn btn--announcement"
          >
            <ClientOnly>
              <IconPencil v-if="adStore.hasFormInProgress" :size="16" />
              <IconPlus v-else :size="16" />
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
import SearchIcon from "@/components/SearchIcon.vue";
import { useScroll } from "@vueuse/core";
import {
  Pencil as IconPencil,
  Plus as IconPlus,
  Menu as IconMenu,
} from "lucide-vue-next";
import { useAdStore } from "@/stores/ad.store";
import { useAppStore } from "@/stores/app.store";

const route = useRoute();
const header = ref<HTMLElement | null>(null);

// Obtener el usuario de Strapi
const user = useSessionUser();

// Define las propiedades del componente
// searchIcon defaults to true via withDefaults: a bare boolean prop declared
// type-only resolves to `false` when absent, so `?? true` would never fire.
const props = withDefaults(
  defineProps<{
    isTrasparent?: boolean | string;
    showMenu?: boolean;
    searchIcon?: boolean;
  }>(),
  {
    isTrasparent: false,
    showMenu: true,
    searchIcon: true,
  },
);

// Search-icon trigger for the lightbox — on by default site-wide, hidden only
// where the design omits it (account area, which navigates via its sidebar).
const isTrasparent = props.isTrasparent;
const showMenu = props.showMenu;
const searchIcon = props.searchIcon;

// Scroll handling
const lastScrollPosition = ref(0);
const isHeaderHidden = ref(false);
const isTop = ref(true);

const { y: scrollY } = useScroll(window);

const adStore = import.meta.client
  ? useAdStore()
  : ({} as ReturnType<typeof useAdStore>);
const appStore = import.meta.client
  ? useAppStore()
  : ({} as ReturnType<typeof useAppStore>);

watch(scrollY, (newY) => {
  // Check if we're at the top
  isTop.value = newY < 50;

  // Determine scroll direction and update header visibility
  const scrollingDown = newY > lastScrollPosition.value;
  isHeaderHidden.value = scrollingDown && newY > 80 ? true : false;

  lastScrollPosition.value = newY;
});
</script>
