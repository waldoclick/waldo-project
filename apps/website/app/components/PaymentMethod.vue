<template>
  <div class="payment payment--method">
    <ul class="payment--method__list">
      <!-- <pre>{{ payment }}</pre> -->

      <!-- free -->
      <li
        v-if="!props.hideFree && adReservations.unusedFreeCount > 0"
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

      <!-- anuncios pago -->
      <li
        v-if="!props.hideFree && adReservations.unusedPaidCount > 0"
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
      </client-only>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { usePacksStore } from "@/stores/packs.store";
import type { PackType } from "@/types/ad";

const props = withDefaults(
  defineProps<{
    hideFree?: boolean;
  }>(),
  {
    hideFree: false,
  },
);

const adStore = useAdStore();
const packsStore = usePacksStore();
const user = useStrapiUser();
const { getAdReservations } = useUser();
const packs = computed(() => packsStore.packs);
const payment = ref<string | number | null>(null);

// onMounted: UI-only — initializes local payment ref from store; packs pre-loaded by parent page
onMounted(() => {
  // Set initial payment value from store
  payment.value = adStore.pack || 1;

  // Set default pack in store if not yet selected
  if (!adStore.isPackSelected) {
    adStore.updatePack(payment.value as PackType);
  }
});

const changePayment = () => {
  if (payment.value !== null) {
    adStore.updatePack(payment.value as PackType);
  }
};

// Computed property para las reservas
const adReservations = computed(() => getAdReservations());

// Computed property for free ad text
const freeAdText = computed(() => {
  const count = adReservations.value.unusedFreeCount;
  return count === 1
    ? "Usar mi último anuncio gratuito"
    : `Usar 1 de mis ${count} anuncios gratuitos`;
});

// Computed property for paid ad text
const paidAdText = computed(() => {
  const count = adReservations.value.unusedPaidCount;
  return count === 1
    ? "Usar mi último anuncio de pago"
    : `Usar 1 de mis ${count} anuncios de pago`;
});

// Function to format price to Chilean Pesos
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};
</script>
