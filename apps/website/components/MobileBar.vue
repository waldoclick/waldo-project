<template>
  <div class="menu mobile--bar">
    <div
      :class="['mobile--bar__mobile', { open: isMobileMenuOpen }]"
      @click="handleMenuClick"
    >
      <div class="mobile--bar__mobile__wrapper">
        <div class="mobile--bar__mobile__header">
          <div class="mobile--bar__mobile__header__left">
            <button
              title="Cerrar menú mobile"
              class="mobile--bar__mobile__header__close"
              :class="{ open: isMobileMenuOpen }"
              @click="appStore.closeMobileMenu()"
            >
              <IconX :size="32" />
            </button>

            <div class="mobile--bar__mobile__header__logo">
              <LogoBlack />
            </div>
          </div>

          <div class="mobile--bar__mobile__header__right">
            <div class="mobile--bar__mobile__header__search">
              <SearchIcon :white="false" />
            </div>

            <div v-if="me" class="mobile--bar__mobile__header__avatar">
              <AvatarDefault />
            </div>
          </div>
        </div>

        <div v-if="!me" class="mobile--bar__mobile__login">
          <nuxt-link
            to="/login"
            class="btn btn btn--register"
            title="Iniciar sesión"
          >
            Iniciar sesión
          </nuxt-link>
          <nuxt-link
            to="/registro"
            class="btn btn--announcement"
            title="Registrate"
          >
            Registrate
          </nuxt-link>
        </div>

        <div class="mobile--bar__mobile__links">
          <nuxt-link to="/" title="Inicio">Inicio</nuxt-link>
          <nuxt-link :to="{ path: '/anuncios' }" title="Anuncios">
            Anuncios
          </nuxt-link>
          <nuxt-link to="/preguntas-frecuentes" title="Preguntas frecuentes">
            Preguntas frecuentes
          </nuxt-link>
          <nuxt-link
            to="/politicas-de-privacidad"
            title="Políticas de privacidad"
          >
            Políticas de privacidad
          </nuxt-link>
          <nuxt-link to="/contacto" title="Contáctanos">Contáctanos</nuxt-link>
        </div>

        <div
          v-if="me"
          class="mobile--bar__mobile__links mobile--bar__mobile__links--user"
        >
          <nuxt-link
            :to="`/cuenta/`"
            title="Mi cuenta"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconUser :size="20" />
            <span>Mi cuenta</span>
          </nuxt-link>

          <nuxt-link
            :to="`/cuenta/mis-anuncios/`"
            title="Mis anuncios"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconPackage :size="20" />
            <span>Mis anuncios</span>
          </nuxt-link>

          <nuxt-link
            to="/cuenta/perfil"
            title="Mi perfil"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconUserCircle :size="20" />
            <span>Mi perfil</span>
          </nuxt-link>

          <!-- <nuxt-link
            to="/cuenta/username"
            title="Nombre de usuario"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconAtSign :size="20" />
            <span>Nombre de usuario</span>
            <b>PRO</b>
          </nuxt-link>

          <nuxt-link
            to="/cuenta/avatar"
            title="Foto de perfil"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconCamera :size="20" />
            <span>Foto de perfil</span>
            <b>PRO</b>
          </nuxt-link>

          <nuxt-link
            to="/cuenta/cover"
            title="Portada"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconImage :size="20" />
            <span>Portada</span>
            <b>PRO</b>
          </nuxt-link> -->

          <nuxt-link
            to="/cuenta/cambiar-contrasena"
            title="Cambiar contraseña"
            @click.native="appStore.closeMobileMenu()"
          >
            <IconLock :size="20" />
            <span>Cambiar contraseña</span>
          </nuxt-link>

          <a title="Cerrar sesión" @click.prevent="handleLogout">
            <IconLogOut :size="20" />
            <span>Cerrar sesión</span>
          </a>
        </div>

        <div v-if="route.path !== '/anunciar'" class="mobile--bar__mobile__ad">
          <nuxt-link
            to="/anunciar"
            class="btn btn--announcement"
            title="Anunciar ahora"
          >
            <span>Anunciar ahora</span>
          </nuxt-link>
        </div>
      </div>
    </div>
    <div
      :class="{ open: isMobileMenuOpen }"
      class="mobile--bar__backdrop"
      @click="appStore.closeMobileMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const { Swal } = useSweetAlert2();
import { useRouter, useRoute } from "vue-router";
import {
  Menu as IconMenu,
  X as IconX,
  User as IconUser,
  Package as IconPackage,
  UserCircle as IconUserCircle,
  AtSign as IconAtSign,
  Camera as IconCamera,
  Image as IconImage,
  Lock as IconLock,
  LogOut as IconLogOut,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app.store";
import { storeToRefs } from "pinia";

import AvatarDefault from "@/components/AvatarDefault.vue";
import SearchIcon from "@/components/SearchIcon.vue";
import LogoBlack from "@/components/LogoBlack.vue";

const me = useStrapiUser();
const { logout } = useStrapiAuth();
const appStore = useAppStore();
const { isMobileMenuOpen } = storeToRefs(appStore);

const router = useRouter();
const route = useRoute();

const handleLogout = async () => {
  Swal.fire({
    text: "¿Estás seguro de cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, quiero salir",
    cancelButtonText: "No",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        appStore.closeMobileMenu();
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  });
};

function handleMenuClick(event: Event) {
  const target = event.target as HTMLElement;
  if (
    target.closest("a") ||
    target.closest("button") ||
    target.closest(".nuxt-link")
  ) {
    appStore.closeMobileMenu();
  }
}
</script>
