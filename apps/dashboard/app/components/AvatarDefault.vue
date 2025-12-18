<template>
  <div class="avatar" :class="`avatar--${size}`">
    <NuxtImg
      v-if="(user as any)?.pro && (user as any)?.avatar"
      :src="getAvatarUrl"
      :alt="getInitials"
      class="avatar__image"
      loading="lazy"
      decoding="async"
    />
    <span v-else>{{ getInitials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Define las propiedades del componente
const props = defineProps<{
  size?: string;
  user?: any;
}>();

// Define las propiedades con valores por defecto
const size = props.size ?? "small";

// Validar el tamaño
const validSizes = ["small", "medium", "large"];
if (!validSizes.includes(size)) {
  throw new Error(`Invalid size prop: ${size}`);
}

// Obtener el usuario logueado
const loggedUser = useStrapiUser();

// Computed para obtener las iniciales
const getInitials = computed(() => {
  const user = props.user || loggedUser.value;
  const firstname = (user as any)?.firstname || "";
  const lastname = (user as any)?.lastname || "";
  if (!firstname && !lastname) {
    const email = (user as any)?.email || "";
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
  const avatar = (user.value as any)?.avatar;
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

  return avatar.formats?.[format]?.url || avatar.url;
});
</script>
