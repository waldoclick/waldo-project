<template>
  <section class="create create--announcement">
    <!-- profile: {{ isProfileComplete}} -->
    <div class="create--announcement__container">
      <ClientOnly>
        <div class="create--announcement__steps">
          <div class="step step--pack">
            <FormPack
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
// Importa el componente FormPack
import FormPack from "@/components/FormPack.vue";

import { useAdStore } from "@/stores/ad.store";
import { useMeStore } from "@/stores/me.store";

const adStore = useAdStore();
const step = computed(() => adStore.step);
const router = useRouter(); // Inicializar useRouter
const route = useRoute(); // Inicializar useRoute

const meStore = useMeStore();
const isProfileComplete = await meStore.isProfileComplete();

const maxStep = 1; // Solo un paso

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

async function handleFormSubmitted(values) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Estás seguro de que deseas comprar el pack?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, comprar",
    cancelButtonText: "No, cancelar",
  });

  if (result.isConfirmed) {
    // Incrementar el valor de step
    const newStep = adStore.step + 1;

    if (newStep > maxStep) {
      adStore.updateStep(maxStep); // Asegurarse de que el paso no exceda maxStep
      router.push("/anunciar/resumen"); // Redireccionar a /resumen si el nuevo paso es mayor que maxStep
    } else {
      adStore.updateStep(newStep);
      router.push({ query: { ...route.query, step: newStep } }); // Actualizar la URL con el nuevo step
    }
  }
}
</script>
