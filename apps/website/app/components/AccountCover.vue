<template>
  <section class="account account--edit" aria-labelledby="cover-photo-title">
    <div class="account--edit__header">
      <h1 id="cover-photo-title" class="account--edit__title title">
        Personaliza tu portada
      </h1>
      <div class="account--edit__text paragraph">
        <p>
          ¡Dale un toque único a tu perfil! Una portada personalizada es la
          primera impresión que otros usuarios tendrán de ti en Waldo.click®.
          Sube una imagen que represente tu actividad o negocio y haz que tu
          perfil sea más atractivo y profesional.
        </p>
      </div>
    </div>
    <div
      v-if="isPro"
      class="account--edit__form"
      aria-describedby="cover-photo-title"
    >
      <UploadCover />
    </div>
    <div v-else class="account--edit__form">
      <MemoDefault
        :icon="Crown"
        text="Mejora tu experiencia en Waldo.click® con una cuenta PRO y personaliza tu perfil con una portada única. Destaca entre los demás vendedores y aumenta la visibilidad de tus anuncios."
        link="/cuenta"
        button-text="Volver a mi cuenta"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Crown } from "lucide-vue-next";
import UploadCover from "@/components/UploadCover.vue";
import MemoDefault from "@/components/MemoDefault.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();
const isPro = computed(() => user.value?.pro_status === "active");
</script>
