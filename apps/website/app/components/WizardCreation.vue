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
              :src="currentStep?.image"
              :alt="currentStep?.title"
              width="320"
              height="280"
            />
          </Transition>
        </div>
        <div class="wizard--creation__content">
          <h2 id="wizard-creation-title" class="wizard--creation__title">
            {{ currentStep?.title }}
          </h2>
          <p class="wizard--creation__subtitle">
            {{ currentStep?.subtitle }}
          </p>
          <ul v-if="currentStep?.items?.length" class="wizard--creation__list">
            <li
              v-for="(item, i) in currentStep?.items"
              :key="i"
              class="wizard--creation__item"
            >
              <IconCheck :size="16" class="wizard--creation__icon" />
              <span>{{ item }}</span>
            </li>
          </ul>
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

import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { X as IconX, Check as IconCheck } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentStepIndex = ref(0);

const steps = [
  {
    title: "Publicación y visibilidad",
    subtitle: "Define cómo quieres publicar tu anuncio",
    items: [
      "Selecciona el tipo de aviso que usarás, su duración y si deseas aumentar su visibilidad con un destacado.",
      "Puedes usar uno de tus anuncios disponibles.",
      "Comprar un anuncio individual.",
      "Comprar un pack de múltiples anuncios.",
      "Los de pago duran 45 días; los gratuitos, 15 días.",
      "Puedes añadir un destacado para aparecer en las primeras posiciones de búsqueda.",
      "Si corresponde, puedes solicitar boleta o factura.",
      "Si eliges factura, debes tener tu perfil empresarial completo.",
    ],
    image: "/images/wizard-creation-1.png",
  },
  {
    title: "Información general del anuncio",
    subtitle: "Describe qué estás publicando",
    items: [
      "Completa los datos principales del anuncio. Esta información no podrá modificarse una vez publicado.",
      "Escribe un título claro y descriptivo.",
      "Selecciona la categoría correcta.",
      "Define el precio y la moneda (CLP o USD).",
      "Redacta una descripción detallada y precisa (máx. 280 caracteres).",
      "Estos datos impactan directamente en la visibilidad en búsquedas, la tasa de contacto y la confianza del comprador.",
    ],
    image: "/images/wizard-creation-2.png",
  },
  {
    title: "Datos de contacto y ubicación",
    subtitle: "Confirma tus datos de contacto",
    items: [
      "Verifica que tu información esté correcta para que los compradores puedan contactarte sin fricciones.",
      "Email de contacto.",
      "Teléfono (con código país).",
      "Región y comuna.",
      "Dirección y número.",
      "Estos datos no se publican todos necesariamente, pero permiten contacto efectivo y generan confianza en el comprador.",
      "Revisa cuidadosamente antes de continuar.",
    ],
    image: "/images/wizard-creation-3.png",
  },
  {
    title: "Ficha técnica del producto",
    subtitle: "Completa la ficha técnica del equipo",
    items: [
      "Entrega información técnica precisa para mejorar tu posicionamiento en búsquedas y facilitar la decisión de compra.",
      "Condición del equipo.",
      "Fabricante y modelo.",
      "Número de serie.",
      "Año de fabricación.",
      "Peso y dimensiones (ancho, alto, profundidad).",
      "Mientras más completa la ficha, mejor ranking en resultados, menos consultas innecesarias y mayor probabilidad de cierre.",
    ],
    image: "/images/wizard-creation-4.png",
  },
  {
    title: "Imágenes del anuncio",
    subtitle: "Añade imágenes de calidad",
    items: [
      "Las imágenes son determinantes para atraer compradores. Debes incluir al menos una.",
      "Es obligatorio subir mínimo 1 imagen.",
      "Usa fotos nítidas, bien iluminadas y desde distintos ángulos.",
      "Evita fotos borrosas e imágenes con marcas de agua externas.",
      "Más y mejores imágenes = mayor tasa de contacto.",
    ],
    image: "/images/wizard-creation-5.png",
  },
  {
    title: "Revisión y confirmación",
    subtitle: "Revisa y confirma tu publicación",
    items: [
      "Verifica todos los datos antes de publicar. Una vez confirmado, el anuncio quedará activo según la modalidad elegida.",
      "Revisa tipo de anuncio y total a pagar, si incluye destacado, información general, datos personales, ficha técnica e imágenes.",
      "Puedes editar cada sección antes de confirmar.",
      "Una vez publicado no podrás modificar los datos principales.",
      "El anuncio quedará activo por 45 días.",
    ],
    image: "/images/wizard-creation-6.png",
  },
];

const currentStep = computed(() => steps[currentStepIndex.value]);

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
