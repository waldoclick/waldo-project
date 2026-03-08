<template>
  <section class="create create--announcement">
    <!-- profile: {{ isProfileComplete}} -->
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
          <div v-if="step === 1" class="step step--1">
            <FormCreateOne @form-submitted="handleFormSubmitted" />
          </div>
          <div v-if="step === 2" class="step step--2">
            <FormCreateTwo
              @form-submitted="handleFormSubmitted"
              @form-back="handleFormBack"
            />
          </div>
          <div v-if="step === 3" class="step step--3">
            <FormCreateThree
              @form-submitted="handleFormSubmitted"
              @form-back="handleFormBack"
            />
          </div>
          <div v-if="step === 4" class="step step--4">
            <FormCreateFour
              @form-submitted="handleFormSubmitted"
              @form-back="handleFormBack"
            />
          </div>
          <div v-if="step === 5" class="step step--5">
            <FormCreateFive
              @form-submitted="handleFormSubmitted"
              @form-back="handleFormBack"
            />
          </div>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
// Importa los componentes
import FormCreateOne from "@/components/FormCreateOne.vue";
import FormCreateTwo from "@/components/FormCreateTwo.vue";
import FormCreateThree from "@/components/FormCreateThree.vue";
import FormCreateFour from "@/components/FormCreateFour.vue";
import FormCreateFive from "@/components/FormCreateFive.vue";
// import AlertDefault from '@/components/AlertDefault.vue'
import { useAdStore } from "@/stores/ad.store";
import { useMeStore } from "@/stores/me.store";

const adStore = useAdStore();
const step = computed(() => adStore.step);
const router = useRouter();

const meStore = useMeStore();
const isProfileComplete = ref(false);

const maxStep = 5;

const stepRoutes: Record<number, string> = {
  1: "/anunciar",
  2: "/anunciar/datos-del-producto",
  3: "/anunciar/datos-personales",
  4: "/anunciar/ficha-de-producto",
  5: "/anunciar/galeria-de-imagenes",
};

// onMounted: UI-only — verifies profile completeness; meStore pre-loaded by parent page
onMounted(async () => {
  // Verify profile completeness from pre-loaded me data
  isProfileComplete.value = await meStore.isProfileComplete();
});

function handleFormBack(_values?: unknown) {
  const newStep = adStore.step > 1 ? adStore.step - 1 : 1;
  adStore.updateStep(newStep);
  router.push(stepRoutes[newStep] ?? "/anunciar");
}

function handleFormSubmitted(_values?: unknown) {
  const newStep = adStore.step + 1;

  if (newStep > maxStep) {
    adStore.updateStep(maxStep);
    router.push("/anunciar/resumen");
  } else {
    adStore.updateStep(newStep);
    router.push(stepRoutes[newStep] ?? "/anunciar");
  }
}
</script>
