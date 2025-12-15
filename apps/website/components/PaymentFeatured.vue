<template>
  <div class="payment payment--featured">
    <div class="payment--featured__title">¿Quieres destacar este anuncio?</div>
    <div class="payment--featured__description">
      Destacando tu anuncio aparecerá de los primeros en los resultados de
      búsqueda.
    </div>
    <!-- <pre>{{ user }}</pre> -->

    <div class="payment--featured__options">
      <label
        v-if="featuredReservations.unusedCount > 0 && adStore.pack !== 'free'"
        class="payment--featured__options__item"
      >
        <input
          v-model="value"
          type="radio"
          name="value"
          value="free"
          @change="updateFeatured"
        />
        <span>{{ getFeaturedText }}</span>
      </label>
      <label class="payment--featured__options__item">
        <input
          v-model="value"
          type="radio"
          name="value"
          :value="true"
          @change="updateFeatured"
        />
        <span>Destacar por $10.000</span>
      </label>
      <label class="payment--featured__options__item">
        <input
          v-model="value"
          type="radio"
          name="value"
          :value="false"
          @change="updateFeatured"
        />
        <span>No destacar</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAdStore } from "@/stores/ad.store";

const adStore = useAdStore();
const user = useStrapiUser();
const { getAdFeaturedReservations } = useUser();
const value = ref(false);

// Obtener el valor inicial del store cuando el componente se monta
onMounted(() => {
  // Obtener valor del store, si existe
  value.value = adStore.featured;

  // Actualizar el valor en el store si aún no ha sido seleccionado
  if (!adStore.isFeaturedSelected) {
    adStore.updateFeatured(value.value);
  }
});

// Watcher para detectar cambios en el pack
watch(
  () => adStore.pack,
  (newPack) => {
    // Si el pack es "free", no se puede destacar con crédito gratis
    if (newPack === "free" && value.value === "free") {
      value.value = false;
      adStore.updateFeatured(false);
    }
  }
);

// Función para actualizar el estado de featured en el store
const updateFeatured = () => {
  // Solo actualizar el featured en el store (los eventos se manejan desde el watcher central)
  adStore.updateFeatured(value.value);
};

// Computed property para las reservas destacadas
const featuredReservations = computed(() => getAdFeaturedReservations());

const getFeaturedText = computed(() => {
  const count = featuredReservations.value.unusedCount;
  return count === 1
    ? "Usar mi último destacado gratuito"
    : `Usar 1 de mis ${count} destacados gratuitos`;
});
</script>
