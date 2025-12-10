<template>
  <section class="hero hero--profile">
    <div v-if="user?.pro && user?.cover" class="hero--profile__image">
      <img
        class="hero--profile__image__image"
        :src="getCoverUrl || ''"
        alt="Imagen"
      />
      <div class="hero--profile__overlay"></div>
    </div>
  </section>
</template>

<script setup>
import chevronRightIcon from "/images/chevron-right-new.svg";
import { useImageProxy } from "@/composables/useImage";

// props
const props = defineProps({
  user: {
    type: [Array, Object],
    default: () => ({}),
  },
});

const me = useStrapiUser();
const { transformUrl } = useImageProxy();

const userStatus = computed(() => {
  const { user, is_owner } = isOwnProfile.value;

  if (is_owner) {
    return user.paidAdReservationsCount === 0 ? "cta" : "pro";
  } else {
    return user.paidAdReservationsCount === 0 ? "basic" : "pro";
  }
});

const isOwnProfile = computed(() => {
  const is_owner = !!me.value && me.value.id === props.user.id;
  return {
    user: is_owner ? me.value : props.user,
    is_owner,
  };
});

// Computed para obtener el usuario
const user = computed(() => props.user);

// Computed para obtener la URL del cover
const getCoverUrl = computed(() => {
  const cover = user.value?.cover;
  if (!cover) return "";

  // Usar el formato large para el cover
  const format = "large";
  return transformUrl(cover.formats[format]?.url || cover.url);
});
</script>
