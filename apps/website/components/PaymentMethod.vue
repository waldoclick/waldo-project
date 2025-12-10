<template>
  <div class="payment payment--method">
    <ul class="payment--method__list">
      <!-- <pre>{{ payment }}</pre> -->

      <!-- free -->
      <li
        v-if="adReservations.unusedFreeCount > 0"
        :class="[
          'payment--method__item',
          { 'payment--method__item--active': payment === 'free' },
        ]"
      >
        <label>
          <p>
            <input
              v-model="payment"
              type="radio"
              name="payment"
              value="free"
              @change="changePayment"
            />
            <strong>{{ freeAdText }}</strong>
          </p>
          <p>
            Duración del anuncio:
            <strong>15 días</strong>
          </p>
        </label>
      </li>

      <!-- avisos pago -->
      <li
        v-if="adReservations.unusedPaidCount > 0"
        :class="[
          'payment--method__item',
          { 'payment--method__item--active': payment === 'paid' },
        ]"
      >
        <label>
          <p>
            <input
              v-model="payment"
              type="radio"
              name="payment"
              value="paid"
              @change="changePayment"
            />
            <strong>{{ paidAdText }}</strong>
          </p>
          <p>
            Duración del anuncio:
            <strong>45 días</strong>
          </p>
        </label>
      </li>

      <!-- packs -->
      <client-only>
        <li
          v-for="(item, index) in packs"
          :key="index"
          :class="[
            'payment--method__item',
            { 'payment--method__item--active': payment === item.id },
          ]"
        >
          <span v-if="item.text">{{ item.text }}</span>
          <label>
            <p>
              <input
                v-model="payment"
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
      </client-only>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { usePacksStore } from "@/stores/packs.store";

const adStore = useAdStore();
const packsStore = usePacksStore();
const user = useStrapiUser();
const { getAdReservations } = useUser();
const packs = computed(() => packsStore.packs);
const payment = ref(null);

onMounted(async () => {
  // Cargar los packs
  await packsStore.loadPacks();

  // Obtener el valor inicial del pack desde el store
  payment.value = adStore.pack || 1; // Asigna un valor por defecto si no hay pack seleccionado

  // Actualizar el pack en el store si todavía no tiene un valor
  if (!adStore.isPackSelected) {
    adStore.updatePack(payment.value);
  }
});

const changePayment = () => {
  // Solo actualizar el pack en el store (los eventos se manejan desde el watcher central)
  adStore.updatePack(payment.value);
};

// Computed property para las reservas
const adReservations = computed(() => getAdReservations());

// Computed property for free ad text
const freeAdText = computed(() => {
  const count = adReservations.value.unusedFreeCount;
  return count === 1
    ? "Usar mi último aviso gratuito"
    : `Usar 1 de mis ${count} avisos gratuitos`;
});

// Computed property for paid ad text
const paidAdText = computed(() => {
  const count = adReservations.value.unusedPaidCount;
  return count === 1
    ? "Usar mi último aviso de pago"
    : `Usar 1 de mis ${count} avisos de pago`;
});

// Function to format price to Chilean Pesos
const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};
</script>
