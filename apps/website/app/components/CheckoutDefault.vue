<template>
  <section class="checkout checkout--default">
    <div class="checkout--default__container">
      <ClientOnly>
        <FormCheckout @form-submitted="handleFormSubmitted" />
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import FormCheckout from "@/components/FormCheckout.vue";
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";
import { usePacksList } from "@/composables/usePacksList";

const { Swal } = useSweetAlert2();
const { create } = useStrapi();

const adStore = useAdStore();
const adAnalytics = useAdAnalytics();
const { packs, loadPacks } = usePacksList();

const handleFormSubmitted = async (_values?: unknown) => {
  await handlePayClick();
};

const handlePayClick = async () => {
  try {
    adAnalytics.addPaymentInfo();

    await loadPacks();
    const selectedPack =
      typeof adStore.pack === "number"
        ? packs.value.find((p) => p.id === adStore.pack)
        : null;

    if (!selectedPack) {
      throw new Error("Pack not found");
    }

    const response = await create<{ url: string; token: string }>(
      "payments/checkout",
      {
        pack: selectedPack.name,
        ad_id: adStore.ad.ad_id,
        featured: adStore.featured,
      } as unknown as Parameters<typeof create>[1],
    );

    const { url, token } = response.data ?? {};

    if (!url || !token) {
      throw new Error("Invalid payment response");
    }

    adAnalytics.pushEvent("redirect_to_payment", [], {
      payment_method: "webpay",
    });

    handleRedirect({ url, gatewayRef: token });
  } catch (error: unknown) {
    let errorMessage =
      "Hubo un problema al procesar el pago. Por favor, inténtalo de nuevo.";

    if (
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message === "No free featured credits available" ||
      (error as { message?: string }).message ===
        "No free featured credits available"
    ) {
      errorMessage = "No tienes créditos destacados gratuitos disponibles";
    }

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const handleRedirect = (response: { url: string; gatewayRef: string }) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = response.url;

  const tokenField = document.createElement("input");
  tokenField.type = "hidden";
  tokenField.name = "token_ws";
  tokenField.value = response.gatewayRef;
  form.appendChild(tokenField);

  document.body.appendChild(form);
  form.submit();
};
</script>
