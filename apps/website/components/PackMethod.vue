<template>
  <div class="payment payment--method">
    <ul class="payment--method__list">
      <!-- <pre>{{ packs }}</pre> -->
      <!-- packs -->
      <template v-for="(item, index) in packs" :key="index">
        <li
          v-if="item.total_ads > 1"
          :class="[
            'payment--method__item',
            { 'payment--method__item--active': selectedPack === item.id },
          ]"
        >
          <span v-if="item.text">{{ item.text }}</span>
          <label>
            <p>
              <input
                v-model="selectedPack"
                :value="item.id"
                type="radio"
                name="payment"
                @change="changePayment"
              />
              <strong>
                {{ item.total_ads }} anuncios x
                {{ formatPrice(item.price) }}
              </strong>
            </p>
            <p>
              Duración del anuncio:
              <strong>{{ item.total_days }} días</strong>
            </p>
          </label>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePackStore } from "@/stores/pack.store";
import { usePacksStore } from "@/stores/packs.store";

const packStore = usePackStore();
const packsStore = usePacksStore();
const packs = computed(() => packsStore.packs);
const selectedPack = ref(null);

onMounted(async () => {
  // Cargar los packs
  await packsStore.loadPacks();

  // Obtener el valor inicial del pack desde el store
  selectedPack.value = packStore.pack || null; // Asigna un valor por defecto si no hay pack seleccionado

  // Actualizar el pack en el store
  packStore.updatePack(selectedPack.value);
});

const changePayment = () => {
  packStore.updatePack(selectedPack.value);
};

// Function to format price to Chilean Pesos
const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};
</script>
