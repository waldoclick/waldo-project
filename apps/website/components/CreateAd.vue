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

<script setup>
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router"; // Importar useRouter y useRoute
// Importa los componentes
import FormCreateOne from "@/components/FormCreateOne.vue";
import FormCreateTwo from "@/components/FormCreateTwo.vue";
import FormCreateThree from "@/components/FormCreateThree.vue";
import FormCreateFour from "@/components/FormCreateFour.vue";
import FormCreateFive from "@/components/FormCreateFive.vue";
// import AlertDefault from '@/components/AlertDefault.vue'
import { useAdStore } from "@/stores/ad.store";
import { useMeStore } from "@/stores/me.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";

const adStore = useAdStore();
const adAnalytics = useAdAnalytics();
const step = computed(() => adStore.step);
const router = useRouter(); // Inicializar useRouter
const route = useRoute(); // Inicializar useRoute

const meStore = useMeStore();
const isProfileComplete = await meStore.isProfileComplete();

const maxStep = 5;

// Leer el parámetro step de la URL cuando se monte el componente
onMounted(() => {
  const stepFromUrl = Number.parseInt(route.query.step, 10);
  if (
    !Number.isNaN(stepFromUrl) &&
    stepFromUrl >= 1 &&
    stepFromUrl <= maxStep
  ) {
    adStore.updateStep(stepFromUrl);
  }
});

function handleFormBack(values) {
  const newStep = adStore.step > 1 ? adStore.step - 1 : adStore.step;
  adStore.updateStep(newStep);
  router.push({ query: { ...route.query, step: newStep } }); // Actualizar la URL con el nuevo step
}

function handleFormSubmitted(values) {
  const newStep = adStore.step + 1;

  if (newStep > maxStep) {
    adStore.updateStep(maxStep);
    router.push("/anunciar/resumen");
  } else {
    adStore.updateStep(newStep);
    router.push({ query: { ...route.query, step: newStep } });
  }
}
</script>
