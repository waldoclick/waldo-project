<template>
  <div class="memo memo--pro">
    <Crown :size="40" class="memo--pro__icon" />

    <!-- Non-subscriber: invite text + Hazte PRO button -->
    <template v-if="!isSubscribed">
      <div class="memo--pro__text">
        <p>
          ¡Potencia tu experiencia en Waldo.click! Por solo $1.000 mensuales,
          accede a funciones exclusivas y destaca tu perfil con una cuenta PRO.
          Únete a nuestra comunidad de usuarios destacados.
        </p>
      </div>
      <button
        class="btn btn--buy"
        title="Hazte PRO"
        @click="handleProSubscription"
      >
        Hazte PRO
      </button>
    </template>

    <!-- Subscriber: status + card info + next charge + cancel -->
    <template v-else>
      <div class="memo--pro__text">
        <p class="memo--pro__text__status">
          <span
            v-if="user?.pro_status === 'cancelled'"
            class="memo--pro__text__status__badge memo--pro__text__status__badge--cancelled"
          >
            Cancelada
          </span>
          Suscripción PRO
        </p>
        <p class="memo--pro__text__card">
          {{ user?.pro_card_type }} **** {{ user?.pro_card_last4 }}
        </p>
        <p
          v-if="user?.pro_status === 'active' && nextChargeDate"
          class="memo--pro__text__date"
        >
          Próxima fecha de cobro: {{ nextChargeDate }}
        </p>
        <p
          v-if="user?.pro_status === 'cancelled' && expiryDate"
          class="memo--pro__text__date"
        >
          Activo hasta: {{ expiryDate }}
        </p>
      </div>
      <button
        v-if="user?.pro_status === 'active'"
        class="btn btn--cancel"
        title="Cancelar suscripción"
        :disabled="cancelling"
        @click="handleCancelSubscription"
      >
        {{ cancelling ? "Cancelando..." : "Cancelar" }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Crown } from "lucide-vue-next";
import type { User } from "@/types/user";

const { Swal } = useSweetAlert2();
const apiClient = useApiClient();
const user = useStrapiUser<User>();
const { fetchUser } = useStrapiAuth();
const cancelling = ref(false);

const isSubscribed = computed(
  () =>
    user.value?.pro_status === "active" ||
    user.value?.pro_status === "cancelled",
);

const formatDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const nextChargeDate = computed(() =>
  formatDate(user.value?.pro_expires_at ?? null),
);
const expiryDate = computed(() =>
  formatDate(user.value?.pro_expires_at ?? null),
);

const handleProSubscription = () => {
  navigateTo("/pro/pagar");
};

const handleCancelSubscription = async () => {
  const result = await Swal.fire({
    title: "Cancelar suscripción PRO",
    text: "¿Está seguro de cancelar su suscripción PRO? Seguirá activo hasta el fin del período.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "No, mantener",
  });

  if (!result.isConfirmed) return;

  cancelling.value = true;
  try {
    await apiClient("payments/pro-cancel", {
      method: "POST",
      body: { data: {} },
    });
    await fetchUser();
  } catch (error) {
    console.error("Error cancelling PRO subscription:", error);
    Swal.fire("Error", "No se pudo cancelar la suscripción.", "error");
  } finally {
    cancelling.value = false;
  }
};
</script>
