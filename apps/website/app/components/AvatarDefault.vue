<template>
  <NuxtLink
    to="/cuenta"
    class="avatar"
    :class="`avatar--${size}`"
    :title="getInitials"
  >
    <NuxtImg
      v-if="user?.pro_status === 'active' && user?.avatar"
      :src="getAvatarUrl"
      :alt="getInitials"
      class="avatar__image"
      loading="lazy"
      decoding="async"
      remote
    />
    <span v-else>{{ getInitials }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { User } from "@/types/user";
import { useImageProxy } from "@/composables/useImage";

// Define las propiedades del componente
const props = defineProps<{
  size?: string;
  user?: User;
}>();

// Define las propiedades con valores por defecto
const size = props.size ?? "small";

// Validar el tamaño
const validSizes = ["small", "medium", "large"];
if (!validSizes.includes(size)) {
  throw new Error(`Invalid size prop: ${size}`);
}

// Obtener el usuario logueado
const loggedUser = useStrapiUser<User>();
const { transformUrl } = useImageProxy();

// Computed para obtener las iniciales
const getInitials = computed(() => {
  const user = props.user || loggedUser.value;
  const firstname = user?.firstname || "";
  const lastname = user?.lastname || "";
  if (!firstname && !lastname) {
    const email = user?.email || "";
    return email ? email.slice(0, 2).toUpperCase() : "WA";
  }
  return `${firstname.charAt(0).toUpperCase()}${lastname
    .charAt(0)
    .toUpperCase()}`;
});

// Computed para obtener el usuario actual
const user = computed(() => props.user || loggedUser.value);

// Computed para obtener la URL del avatar
const getAvatarUrl = computed(() => {
  const avatar = user.value?.avatar;
  if (!avatar) return "";

  // Usar el formato según el tamaño del avatar
  const format =
    size === "small"
      ? "small"
      : size === "medium"
        ? "medium"
        : size === "large"
          ? "large"
          : "thumbnail";

  return transformUrl(avatar.formats[format]?.url || avatar.url);
});
</script>
