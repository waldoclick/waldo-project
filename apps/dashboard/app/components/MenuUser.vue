<template>
  <div ref="menuRef" class="menu menu--user">
    <button
      title="Menú de usuario"
      :class="{ 'is-open': isOpen }"
      class="menu--user__button"
      @click="menuOpen"
    >
      <div class="menu--user__button__avatar">
        <AvatarDefault />
      </div>

      <div class="menu--user__button__greetings">
        Hola
        <div class="menu--user__button__greetings__name">
          {{ user?.firstname }}
        </div>
      </div>

      <div class="menu--user__button__icon" @click.stop="menuOpen">
        <IconMenu v-if="!isOpen" :size="24" class="menu-open" />
        <IconX v-else :size="24" class="menu-close" />
      </div>
    </button>

    <nav class="menu--user__menu" :class="{ 'is-open': isOpen }">
      <ul class="menu--user__menu__links">
        <li @click="menuOpen">
          <NuxtLink to="/cuenta/perfil" title="Mi perfil">Mi perfil</NuxtLink>
        </li>
        <li @click="menuOpen">
          <NuxtLink to="/cuenta/perfil/editar" title="Editar perfil">
            <span>Editar perfil</span>
          </NuxtLink>
        </li>
        <li @click="menuOpen">
          <NuxtLink to="/cuenta/cambiar-contrasena" title="Cambiar contraseña">
            <span>Cambiar contraseña</span>
          </NuxtLink>
        </li>
      </ul>
      <ul class="menu--user__menu__links">
        <li @click="menuOpen">
          <button
            title="Cerrar sesión"
            type="button"
            @click.prevent="handleLogout"
          >
            <span>Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert2 } from "@/composables/useSweetAlert2";
import AvatarDefault from "@/components/AvatarDefault.vue";
import { Menu as IconMenu, X as IconX } from "lucide-vue-next";

const { Swal } = useSweetAlert2();

// Obtener el usuario de Strapi
const user = useStrapiUser();
const { logout } = useStrapiAuth();

// Estado del menú y referencia
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Métodos del componente
const menuOpen = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    isOpen.value
  ) {
    isOpen.value = false;
  }
};

// Event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const router = useRouter();

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
        await logout();
        router.push("/auth/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  });
};
</script>
