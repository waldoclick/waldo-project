<template>
  <div
    class="layout layout--dashboard"
    :class="{ 'layout--dashboard--open': isSidebarOpen }"
  >
    <div class="layout--dashboard__menu">
      <div class="layout--dashboard__menu__logo">
        <NuxtLink to="/" title="Waldo.click">
          <NuxtImg
            loading="lazy"
            decoding="async"
            src="/images/logo-black.svg"
            alt="Waldo.click"
            title="Waldo.click"
          />
        </NuxtLink>
      </div>
      <div class="layout--dashboard__menu__panels">
        <div class="layout--dashboard__menu__rail">
          <MenuMain :active-menu="activeMenu" />
        </div>
        <div class="layout--dashboard__menu__nav">
          <MenuDefault
            v-if="activeMenu === 'default'"
            @close="isSidebarOpen = false"
          />
          <MenuUsers
            v-else-if="activeMenu === 'users'"
            @close="isSidebarOpen = false"
          />
          <MenuMaintenance
            v-else-if="activeMenu === 'maintenance'"
            @close="isSidebarOpen = false"
          />
          <MenuIntegrations
            v-else-if="activeMenu === 'integrations'"
            @close="isSidebarOpen = false"
          />
        </div>
      </div>
    </div>
    <div class="layout--dashboard__mobile">
      <MenuMobile
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import MenuDefault from "@/components/MenuDefault.vue";
import MenuUsers from "@/components/MenuUsers.vue";
import MenuMaintenance from "@/components/MenuMaintenance.vue";
import MenuIntegrations from "@/components/MenuIntegrations.vue";
import MenuMain from "@/components/MenuMain.vue";
import MenuMobile from "@/components/MenuMobile.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const route = useRoute();

const resolveActiveMenu = (
  path: string,
): "default" | "users" | "maintenance" | "integrations" => {
  if (path.startsWith("/users")) return "users";
  if (path.startsWith("/maintenance")) return "maintenance";
  if (path.startsWith("/integrations")) return "integrations";
  return "default";
};

const isSidebarOpen = ref(false);
const activeMenu = ref<"default" | "users" | "maintenance" | "integrations">(
  resolveActiveMenu(route.path),
);

watch(
  () => route.path,
  (path) => {
    activeMenu.value = resolveActiveMenu(path);
  },
);
</script>
