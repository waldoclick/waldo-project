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
                {{ item.total_ads }}
                {{ Number(item.total_ads) === 1 ? "anuncio" : "anuncios" }} x
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePackStore } from "@/stores/pack.store";

const packStore = usePackStore();
const { packs, loadPacks } = usePacksList();
const selectedPack = ref<number | null>(null);

// onMounted: loads packs via usePacksList (TTL-cached), then initializes local selectedPack ref from store
onMounted(async () => {
  await loadPacks();

  // Get initial pack value from store
  selectedPack.value = packStore.pack || null;

  // Update store with initial selection
  packStore.updatePack(selectedPack.value);
});

const changePayment = () => {
  packStore.updatePack(selectedPack.value);
};

// Function to format price to Chilean Pesos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};
</script>
