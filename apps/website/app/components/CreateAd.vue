<template>
  <section class="create create--announcement">
    <div class="create--announcement__container">
      <ClientOnly>
        <AlertDefault
          v-if="!isProfileComplete"
          :title="`Tu perfil aún está incompleto`"
          :text="`Completa tu perfil antes de crear tu primer anuncio`"
          :button="`Editar mi perfil`"
          :to="`/cuenta/perfil/editar`"
        />

        <div v-else class="create--announcement__steps">
          <div class="step step--1">
            <FormCreateOne @form-submitted="handleFormSubmitted" />
          </div>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import FormCreateOne from "@/components/FormCreateOne.vue";
import { useAdStore } from "@/stores/ad.store";
import { useMeStore } from "@/stores/me.store";

const adStore = useAdStore();
const router = useRouter();

const meStore = useMeStore();
const isProfileComplete = ref(false);

// onMounted: UI-only — verifies profile completeness; meStore pre-loaded by parent page
onMounted(async () => {
  isProfileComplete.value = await meStore.isProfileComplete();
});

function handleFormSubmitted(_values?: unknown) {
  adStore.updateStep(2);
  router.push("/anunciar/datos-del-producto");
}
</script>
