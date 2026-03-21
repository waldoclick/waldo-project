<template>
  <section class="account account--edit" aria-labelledby="profile-photo-title">
    <div class="account--edit__header">
      <h1 id="profile-photo-title" class="account--edit__title title">
        Elige tu foto de perfil
      </h1>
      <div class="account--edit__text paragraph">
        <p>
          ¡Haz que tu perfil destaque! Un avatar personalizado ayuda a crear
          confianza y hace que tu presencia en Waldo.click® sea más memorable.
          Sube una foto que te represente y ayuda a otros usuarios a reconocerte
          fácilmente.
        </p>
      </div>
    </div>
    <div
      v-if="isPro"
      class="account--edit__form"
      aria-describedby="profile-photo-title"
    >
      <UploadAvatar />
    </div>
    <div v-else class="account--edit__form">
      <MemoDefault
        :icon="Crown"
        text="Destaca tu presencia con un avatar personalizado. Las cuentas PRO pueden subir su propia imagen de perfil para generar más confianza y reconocimiento en la comunidad."
        link="/cuenta"
        button-text="Volver a mi cuenta"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Crown } from "lucide-vue-next";
import UploadAvatar from "@/components/UploadAvatar.vue";
import MemoDefault from "@/components/MemoDefault.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();
const isPro = computed(() => user.value?.pro_status === "active");
</script>
