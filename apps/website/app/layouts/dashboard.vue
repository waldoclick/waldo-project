<template>
  <div
    class="layout layout--dashboard"
    :class="{ 'layout--dashboard--open': isSidebarOpen }"
  >
    <div class="layout--dashboard__menu">
      <div class="layout--dashboard__menu__logo">
        <NuxtLink to="/dashboard" title="Waldo.click">
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
          <MenuDefaultDashboard
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
          <MenuArticles
            v-else-if="activeMenu === 'articles'"
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
      <MenuMobileDashboard
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefaultDashboard
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefaultDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const resolveActiveMenu = (
  path: string,
): "default" | "articles" | "users" | "maintenance" | "integrations" => {
  if (path.startsWith("/dashboard/articles")) return "articles";
  if (path.startsWith("/dashboard/users")) return "users";
  if (path.startsWith("/dashboard/maintenance")) return "maintenance";
  if (path.startsWith("/dashboard/integrations")) return "integrations";
  return "default";
};

const isSidebarOpen = ref(false);
const activeMenu = ref<
  "default" | "articles" | "users" | "maintenance" | "integrations"
>(resolveActiveMenu(route.path));

watch(
  () => route.path,
  (path) => {
    activeMenu.value = resolveActiveMenu(path);
  },
);
</script>
