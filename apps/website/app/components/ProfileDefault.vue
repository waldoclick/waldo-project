<template>
  <section class="profile profile--default">
    <div class="profile--default__container">
      <div class="profile--default__sidebar">
        <SidebarProfile :user="user" />
      </div>
      <div class="profile--default__content">
        <!-- Memo para usuarios sin cuenta pro -->
        <!-- <MemoPro v-if="isProfileOwner && !user.pro" /> -->

        <!-- Memo para usuarios pro sin avatar o cover -->
        <!-- <MemoDefault
          v-if="isProfileOwner && user.pro && (!user.avatar || !user.cover)"
          :icon="IconImage"
          text="¡Felicidades! Ya eres usuario PRO. Ahora puedes personalizar tu perfil agregando una foto de perfil y una imagen de portada para destacar aún más."
          button-text="Personalizar perfil"
          link="/cuenta"
        /> -->

        <!-- Memo para el propietario del perfil -->
        <MemoDefault
          v-if="isProfileOwner"
          :icon="IconLock"
          text="Tu perfil es privado. Solo tú puedes ver tus anuncios."
          link="#"
        />

        <!-- Memo para visitantes -->
        <MemoDefault
          v-if="!isProfileOwner"
          :icon="IconLock"
          text="Este perfil es privado. Los anuncios solo son visibles para el propietario."
          link="#"
        />

        <!-- List -->
        <div
          v-if="isProfileOwner && ads && ads.length > 0"
          class="profile--default__content__list"
        >
          <template v-for="ad in ads" :key="ad.id">
            <CardAnnouncement :all="ad as any" />
          </template>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="isProfileOwner"
          class="profile--default__content__emptystate"
        >
          <EmptyState>
            <template #message> No hay anuncios </template>
          </EmptyState>
        </div>

        <!-- Pagination -->
        <div
          v-if="isProfileOwner && pagination && pagination.pageCount > 1"
          class="profile--default__content__paginate"
        >
          <client-only>
            <div class="paginate">
              <vue-awesome-paginate
                v-model="pagination.page"
                :total-items="pagination.total"
                :items-per-page="pagination.pageSize"
                :max-pages-shown="5"
                @click="onClickHandler"
              />
            </div>
          </client-only>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import type { Ad } from "@/types/ad";
import type { User } from "@/types/user";
import { Lock as IconLock, Image as IconImage } from "lucide-vue-next";
import { computed } from "vue";

// components
import SidebarProfile from "./SidebarProfile.vue";
import CardAnnouncement from "./CardAnnouncement.vue";
import EmptyState from "./EmptyState.vue";
import MemoDefault from "./MemoDefault.vue";
import MemoPro from "./MemoPro.vue";

// props
const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  ads: {
    type: Array as PropType<Ad[]>,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
});

// Local state
const router = useRouter();
const route = useRoute();
const currentUser = useStrapiUser();

const isProfileOwner = computed(() => {
  return currentUser.value?.id === props.user.id;
});

const onClickHandler = (page: number) => {
  window.scrollTo(0, 0);

  // Modificar el parámetro 'page' en la URL
  router.push({
    query: {
      ...route.query, // Mantener los demás parámetros
      page: page.toString(), // Cambiar solo el parámetro 'page'
    },
  });
};
</script>
