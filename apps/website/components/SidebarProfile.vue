<template>
  <div
    :class="isPro == true || isPublic == false ? 'pro' : ''"
    class="sidebar sidebar--profile"
  >
    <div class="sidebar--profile__wrapper">
      <div class="sidebar--profile__user">
        <div class="sidebar--profile__avatar">
          <AvatarDefault size="large" :user="props.user" />
        </div>
        <!-- <pre>{{ getUser }}</pre> -->
        <h1 class="sidebar--profile__name">
          {{ getFullName }}
        </h1>
        <div class="sidebar--profile__announcements">
          {{ publishedAdsMessage }}
        </div>
      </div>

      <div v-if="userAuth" class="sidebar--profile__info">
        <CardInfo
          v-if="getUbication"
          :title="`Ubicación`"
          :description="getUbication"
          :truncate-text="true"
        />

        <CardInfo
          v-if="getUser.phone && getUser.phone !== null"
          :title="`Teléfono de contacto`"
          :description="getUser.phone"
          :link="`tel:${getUser.phone}`"
          :truncate-text="true"
        />
        <CardInfo
          v-if="getUser.email"
          :title="`Correo electrónico`"
          :description="getUser.email"
          :link="`mailto:${getUser.email}`"
          :truncate-text="true"
        />
        <CardInfo
          v-if="getUser.username"
          :title="`Link de perfil vendedor`"
          :description="`Waldo.click/${getUser.username}`"
          :link="`/${getUser.username}`"
          :truncate-text="true"
          :show-copy-button="true"
        />
      </div>

      <div v-else>
        <div class="sidebar--profile__reminder">
          <ReminderDefault />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ReminderDefault from "@/components/ReminderDefault";
import AvatarDefault from "@/components/AvatarDefault";
import CardInfo from "@/components/CardInfo";

// Props
const props = defineProps({
  user: {
    type: [Array, Object],
    default: () => ({}),
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isPro: {
    type: Boolean,
    default: true,
  },
});

const userAuth = useStrapiUser();

const getUser = computed(() => props.user || "");

const getFullName = computed(() => {
  // const firstname = props.user?.firstname || "";
  // const lastname = props.user?.lastname || "";
  // return `${firstname} ${lastname}`.trim();
  return props.user?.firstname || "";
});

const getUbication = computed(() => {
  const communeName = props.user?.commune?.name || "";
  const regionName = props.user?.commune?.region?.name || "";
  return `${communeName}, ${regionName}`.trim();
});

const publishedAdsMessage = computed(() => {
  const count = getUser.value.publishedAdsCount || 0;
  if (count === 0) {
    return "No tiene anuncios publicados";
  } else if (count === 1) {
    return "1 anuncio publicado";
  } else {
    return `${count} anuncios publicados`;
  }
});
</script>
