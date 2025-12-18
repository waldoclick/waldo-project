<template>
  <div class="sidebar sidebar--account">
    <div class="sidebar--account__info">
      <div class="sidebar--account__avatar">
        <AvatarDefault size="large" />
      </div>
      <div v-if="user" class="sidebar--account__name">
        {{ user.firstname }}
        {{ user.lastname }}
      </div>
      <div v-if="user" class="sidebar--account__email">
        {{ user.email }}
      </div>
      <nuxt-link
        v-if="route.path !== '/cuenta/perfil'"
        to="/cuenta/perfil"
        class="sidebar--account__profile"
        title="Ver datos personales"
      >
        Ver datos personales
      </nuxt-link>
      <!-- {{ getUbication }} -->
      <div v-show="getUbication" class="sidebar--account__location">
        <IconMapPin :size="20" />
        {{ getUbication }}
      </div>
      <div v-if="user" class="sidebar--account__showcase">
        <nuxt-link :to="`/${user.username}`" :title="`@${user.username}`">
          @{{ user.username }}
        </nuxt-link>
      </div>
      <div v-if="user" class="sidebar--account__link">
        <nuxt-link :to="`/${user.username}`" title="Ver mi perfil público">
          Ver mi perfil público
        </nuxt-link>
      </div>
    </div>
    <ul class="sidebar--account__menu">
      <li class="sidebar--account__menu__item">
        <nuxt-link :to="`/cuenta/`" title="Mi cuenta">
          <IconUser :size="20" />
          <span>Mi cuenta</span>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <nuxt-link :to="`/cuenta/mis-anuncios/`" title="Mis anuncios">
          <IconPackage :size="20" />
          <span>Mis anuncios</span>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <nuxt-link :to="`/cuenta/mis-ordenes/`" title="Mis órdenes">
          <IconShoppingCart :size="20" />
          <span>Mis órdenes</span>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <nuxt-link to="/cuenta/perfil" title="Mi perfil">
          <IconUserCircle :size="20" />
          <span>Mi perfil</span>
        </nuxt-link>
      </li>
      <!-- <li class="sidebar--account__menu__item">
        <nuxt-link to="/cuenta/username" title="Nombre de usuario">
          <IconAtSign :size="20" />
          <span>Nombre de usuario</span>
          <b>PRO</b>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <nuxt-link to="/cuenta/avatar" title="Foto de perfil">
          <IconCamera :size="20" />
          <span>Foto de perfil</span>
          <b>PRO</b>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <nuxt-link to="/cuenta/cover" title="Portada">
          <IconImage :size="20" />
          <span>Portada</span>
          <b>PRO</b>
        </nuxt-link>
      </li> -->
      <li class="sidebar--account__menu__item">
        <nuxt-link to="/cuenta/cambiar-contrasena" title="Cambiar contraseña">
          <IconLock :size="20" />
          <span>Cambiar contraseña</span>
        </nuxt-link>
      </li>
      <li class="sidebar--account__menu__item">
        <a title="Cerrar sesión" @click.prevent="confirmation">
          <IconLogOut :size="20" />
          <span>Cerrar sesión</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
const { Swal } = useSweetAlert2();
import type { User } from "~/types/user";
import {
  MapPin as IconMapPin,
  User as IconUser,
  Package as IconPackage,
  UserCircle as IconUserCircle,
  AtSign as IconAtSign,
  Camera as IconCamera,
  Image as IconImage,
  Lock as IconLock,
  LogOut as IconLogOut,
  ShoppingCart as IconShoppingCart,
} from "lucide-vue-next";

// components
import AvatarDefault from "@/components/AvatarDefault";

// Obtener el usuario desde Strapi
const user = useStrapiUser<User>();
const { logout } = useStrapiAuth();
const router = useRouter();

// Computed property para la ubicación
const getUbication = computed(() => {
  if (!user.value || !user.value.commune || !user.value.commune.region)
    return "";
  return `${user.value.commune.name}, ${user.value.commune.region.name}`;
});

// Método para confirmar cierre de sesión
const confirmation = async () => {
  Swal.fire({
    text: "¿Estás seguro de cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, quiero salir",
    cancelButtonText: "No",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  });
};

// Acceso a la ruta actual
const route = useRoute();
</script>
