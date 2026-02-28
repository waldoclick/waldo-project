<template>
  <div
    :class="{ 'is-open': isOpen }"
    class="wizard wizard--creation"
    role="dialog"
    aria-modal="true"
    aria-labelledby="wizard-creation-title"
  >
    <div
      class="wizard--creation__backdrop"
      aria-hidden="true"
      @click="handleClose"
    />
    <div class="wizard--creation__box">
      <button
        title="Cerrar"
        type="button"
        class="wizard--creation__close"
        @click="handleClose"
      >
        <IconX :size="24" />
      </button>

      <div class="wizard--creation__body">
        <div class="wizard--creation__image">
          <Transition name="fade" mode="out-in">
            <img
              :key="currentStepIndex"
              :src="steps[currentStepIndex].image"
              :alt="steps[currentStepIndex].title"
              width="320"
              height="280"
            />
          </Transition>
        </div>
        <div class="wizard--creation__content">
          <h2 id="wizard-creation-title" class="wizard--creation__title">
            {{ steps[currentStepIndex].title }}
          </h2>
          <div class="wizard--creation__text">
            <p>{{ steps[currentStepIndex].text }}</p>
            <p v-if="steps[currentStepIndex].textSecondary">
              {{ steps[currentStepIndex].textSecondary }}
            </p>
          </div>
          <div class="wizard--creation__nav">
            <button
              type="button"
              class="btn btn--secondary wizard--creation__nav-prev"
              :disabled="currentStepIndex === 0"
              @click="prevStep"
            >
              Anterior
            </button>
            <span class="wizard--creation__step">
              Paso {{ currentStepIndex + 1 }} de {{ steps.length }}
            </span>
            <button
              v-if="currentStepIndex < steps.length - 1"
              type="button"
              class="btn btn--primary wizard--creation__nav-next"
              @click="nextStep"
            >
              Siguiente
            </button>
            <button
              v-else
              type="button"
              class="btn btn--primary wizard--creation__nav-next"
              @click="handleClose"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "WizardCreation",
});

import { ref, watch, onMounted, onUnmounted } from "vue";
import { X as IconX } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentStepIndex = ref(0);

const steps = [
  {
    title: "Te damos la bienvenida a crear un anuncio",
    text: "En pocos pasos podrás publicar tu aviso en Waldo.click® y conectar con compradores de activos industriales. Te guiaremos paso a paso para que tu anuncio quede completo y visible.",
    textSecondary:
      "Si ya sabes cómo funciona el formulario para crear anuncios, puedes cerrar este mensaje y comenzar directamente.",
    image: "/images/wizard-creation-1.png",
  },
  {
    title: "Elige cómo publicar",
    text: "Selecciona si usarás un aviso gratuito, uno de pago que ya tengas reservado o si comprarás un aviso o pack. También puedes añadir un destacado para que tu anuncio tenga más visibilidad y, si lo necesitas, solicitar factura.",
    image: "/images/wizard-creation-2.png",
  },
  {
    title: "Describe tu anuncio",
    text: "Escribe un título claro, elige la categoría, indica el precio y la moneda (CLP o USD) y añade una descripción detallada. Recuerda que una vez publicado no podrás editar estos datos.",
    image: "/images/wizard-creation-3.png",
  },
  {
    title: "Confirma tus datos de contacto",
    text: "Revisa o completa tu email, teléfono, región, comuna y dirección. Así los compradores podrán contactarte con facilidad.",
    image: "/images/wizard-creation-4.png",
  },
  {
    title: "Completa la ficha del producto",
    text: "Indica la condición del equipo, fabricante, modelo, año y medidas (peso, ancho, alto, profundidad). Esta información te ayuda a aparecer mejor en las búsquedas.",
    image: "/images/wizard-creation-5.png",
  },
  {
    title: "Añade imágenes",
    text: "Sube fotos claras y relevantes de tu equipo. Es obligatorio incluir al menos una imagen. Cuantas más y mejores sean, más atractivo será tu anuncio.",
    image: "/images/wizard-creation-6.png",
  },
];

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      currentStepIndex.value = 0;
    }
  },
);

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value -= 1;
  }
}

function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value += 1;
  }
}

function handleClose() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.isOpen) return;
  if (event.key === "Escape") handleClose();
  if (event.key === "ArrowLeft") prevStep();
  if (event.key === "ArrowRight") nextStep();
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
