<template>
  <section class="account account--edit">
    <div class="account--edit__header">
      <h1 class="account--edit__title title">Elige tu nombre de usuario</h1>
      <div class="account--edit__text paragraph">
        <p>
          Tu nombre de usuario es tu identidad en Waldo.click®. Elige uno que
          sea fácil de recordar y que represente bien tu actividad o negocio.
          Recuerda que una vez que lo cambies, no podrás modificarlo por 90
          días.
        </p>
      </div>
    </div>
    <div v-if="isPro" class="account--edit__form">
      <FormUsername />
    </div>
    <div v-else class="account--edit__form">
      <MemoDefault
        :icon="Crown"
        text="Personaliza tu nombre de usuario y construye tu marca personal con una cuenta PRO. Crea una identidad única y memorable para tus compradores potenciales."
        link="/cuenta"
        button-text="Volver a mi cuenta"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Crown } from "lucide-vue-next";
import FormUsername from "@/components/FormUsername.vue";
import MemoDefault from "@/components/MemoDefault.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();
const isPro = computed(() => user.value?.pro_status === "active");
</script>
