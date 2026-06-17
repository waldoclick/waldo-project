<template>
  <div class="sidebar sidebar--account">
    <div class="sidebar--account__info">
      <div v-if="user" class="sidebar--account__name">
        {{ user.firstname }} {{ user.lastname }}
      </div>
      <div v-show="getUbication" class="sidebar--account__location">
        <IconMapPin :size="14" />
        {{ getUbication }}
      </div>
      <nuxt-link
        v-if="user"
        :to="`/${user.username}`"
        class="sidebar--account__public"
        title="Ver mi perfil público"
      >
        <IconExternalLink :size="15" />
        Ver mi perfil público
      </nuxt-link>
    </div>

    <div class="sidebar--account__divider" />

    <nav class="sidebar--account__nav">
      <nuxt-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="sidebar--account__nav__item"
        :class="{
          'sidebar--account__nav__item--active': isActive(item),
        }"
        :title="item.label"
      >
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </nuxt-link>
    </nav>

    <div class="sidebar--account__credits">
      <div class="sidebar--account__credits__head">
        <span class="sidebar--account__credits__label"
          >Créditos disponibles</span
        >
        <IconTicket :size="16" />
      </div>
      <div class="sidebar--account__credits__amount">
        <!-- TODO 05-09: wire real credits -->
        <span class="sidebar--account__credits__number">{{ credits }}</span>
        <span class="sidebar--account__credits__free">+3 gratis</span>
      </div>
      <nuxt-link to="/packs" class="sidebar--account__credits__buy">
        Comprar packs
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { User } from "~/types/user";
import {
  MapPin as IconMapPin,
  ExternalLink as IconExternalLink,
  LayoutDashboard as IconLayoutDashboard,
  Package as IconPackage,
  Receipt as IconReceipt,
  UserRound as IconUserRound,
  Lock as IconLock,
  Ticket as IconTicket,
} from "lucide-vue-next";

const route = useRoute();
const user = useSessionUser<User>();

const getUbication = computed(() => {
  if (!user.value || !user.value.commune || !user.value.commune.region)
    return "";
  return `${user.value.commune.name} · ${user.value.commune.region.name}`;
});

// TODO 05-09: wire real credits count
const credits = 0;

interface NavItem {
  label: string;
  to: string;
  icon: unknown;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { label: "Panel", to: "/cuenta/", icon: IconLayoutDashboard, exact: true },
  { label: "Mis anuncios", to: "/cuenta/mis-anuncios/", icon: IconPackage },
  { label: "Mis órdenes", to: "/cuenta/mis-ordenes/", icon: IconReceipt },
  { label: "Mi perfil", to: "/cuenta/perfil", icon: IconUserRound },
  {
    label: "Cambiar contraseña",
    to: "/cuenta/cambiar-contrasena",
    icon: IconLock,
  },
];

const isActive = (item: NavItem) => {
  const path = route.path.replace(/\/$/, "");
  const to = item.to.replace(/\/$/, "");
  return item.exact ? path === to : path.startsWith(to);
};
</script>
