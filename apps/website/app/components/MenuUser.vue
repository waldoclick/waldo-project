<template>
  <div ref="menuRef" :class="isBlack" class="menu menu--user">
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
        <span class="menu--user__button__greetings__label">Hola</span>
        <span class="menu--user__button__greetings__name">
          {{ user?.firstname }}
        </span>
      </div>

      <ChevronDown
        :size="16"
        class="menu--user__button__chevron"
        :class="{ 'is-open': isOpen }"
      />
    </button>

    <nav class="menu--user__menu" :class="{ 'is-open': isOpen }">
      <div class="menu--user__menu__head">
        <div class="menu--user__menu__head__avatar">
          <AvatarDefault />
        </div>
        <div class="menu--user__menu__head__greetings">
          <span class="menu--user__menu__head__greetings__label">Hola</span>
          <span class="menu--user__menu__head__greetings__name">
            {{ user?.firstname }}
          </span>
        </div>
        <button
          title="Cerrar"
          type="button"
          class="menu--user__menu__head__close"
          @click="menuOpen"
        >
          <IconX :size="17" />
        </button>
      </div>

      <div class="menu--user__menu__body">
        <ul v-if="isManager" class="menu--user__menu__links">
          <li @click="menuOpen">
            <NuxtLink
              :to="isDashboard ? '/' : '/dashboard'"
              :title="isDashboard ? 'Ir al sitio' : 'Ver dashboard'"
              >{{ isDashboard ? "Ir al sitio" : "Ver dashboard" }}</NuxtLink
            >
          </li>
        </ul>
        <ul class="menu--user__menu__links">
          <li @click="menuOpen">
            <NuxtLink to="/cuenta" title="Mi cuenta">Mi cuenta</NuxtLink>
          </li>
          <li @click="menuOpen">
            <NuxtLink to="/cuenta/mis-anuncios/" title="Mis anuncios">
              <span>Mis anuncios</span>
            </NuxtLink>
          </li>
          <li @click="menuOpen">
            <NuxtLink to="/cuenta/perfil" title="Mi perfil">Mi perfil</NuxtLink>
          </li>
          <li @click="menuOpen">
            <NuxtLink
              to="/cuenta/cambiar-contrasena"
              title="Cambiar contraseña"
            >
              <span>Cambiar contraseña</span>
            </NuxtLink>
          </li>
        </ul>
        <ul class="menu--user__menu__links">
          <li @click="menuOpen">
            <NuxtLink to="/packs" title="Comprar packs">
              <span>Comprar packs</span>
            </NuxtLink>
          </li>
          <li @click="menuOpen">
            <NuxtLink to="/preguntas-frecuentes" title="Preguntas frecuentes">
              <span>Preguntas frecuentes</span>
            </NuxtLink>
          </li>
          <li @click="menuOpen">
            <NuxtLink
              to="/politicas-de-privacidad"
              title="Políticas de privacidad"
            >
              <span>Políticas de privacidad</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="menu--user__menu__divider"></div>

      <div class="menu--user__menu__footer">
        <button
          title="Cerrar sesión"
          type="button"
          class="menu--user__menu__logout"
          @click.prevent="handleLogout"
        >
          <LogOut :size="16" class="menu--user__menu__logout__icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
const { Swal } = useSweetAlert2();
import AvatarDefault from "@/components/AvatarDefault.vue";
import type { User } from "@/types/user";
import { X as IconX, ChevronDown, LogOut } from "lucide-vue-next";

const user = useSessionUser<User>();
const { logout } = useLogout();
const route = useRoute();

const isManager = computed(
  () => user.value?.role?.type?.toLowerCase() === "manager",
);
const isDashboard = computed(() => route.path.startsWith("/dashboard"));

const props = defineProps<{
  black?: boolean;
}>();

const black = props.black ?? false;

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const isBlack = computed(() => {
  return black ? "is-black" : "";
});

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

// onMounted: UI-only — attaches click-outside listener to close user menu dropdown
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleLogout = async () => {
  Swal.fire({
    text: "¿Estás seguro de cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, quiero salir",
    cancelButtonText: "No",
  }).then(async ({ isConfirmed }: { isConfirmed: boolean }) => {
    if (isConfirmed) {
      try {
        await logout();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  });
};
</script>
