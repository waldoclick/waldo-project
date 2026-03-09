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

const { Swal } = useSweetAlert2();
const { create } = useStrapi();
const { fetchUser } = useStrapiAuth();

const adStore = useAdStore();
const adAnalytics = useAdAnalytics();

const handleFormSubmitted = async (_values?: unknown) => {
  await handlePayClick();
};

const handlePayClick = async () => {
  // Determine flow before any mutations
  const isPackOnly = adStore.ad.ad_id === null;

  try {
    adAnalytics.addPaymentInfo();

    // --- Pack-only flow (user came from /packs, no ad data) ---
    if (isPackOnly) {
      const response = await create<{
        webpay?: { url: string; gatewayRef: string };
      }>("payments/pack", {
        pack: adStore.pack,
        is_invoice: adStore.is_invoice,
      } as unknown as Parameters<typeof create>[1]);

      if (response.data?.webpay) {
        adAnalytics.pushEvent("redirect_to_payment", [], {
          payment_method: "webpay",
        });
        handleRedirect(response.data.webpay);
      }
      return;
    }

    // --- Ad+pack flow (user came from /anunciar/resumen) ---
    const allData = {
      pack: adStore.pack,
      featured: adStore.featured,
      is_invoice: adStore.is_invoice,
      ad: adStore.ad,
    };

    if (adStore.pack !== "free") {
      const draftPayload = { ad: adStore.ad };
      const draftResponse = await create<{ id: number }>(
        "ads/save-draft",
        draftPayload as unknown as Parameters<typeof create>[1],
      );
      const draftId = draftResponse.data?.id;
      if (draftId) {
        adStore.updateAdId(draftId);
        allData.ad = { ...allData.ad, ad_id: draftId };
      }
    }

    const response = await create<{
      webpay?: { url: string; gatewayRef: string };
      ad?: { id: number };
    }>("payments/ad", allData as unknown as Parameters<typeof create>[1]);

    if (response.data?.webpay) {
      const ad_id = response.data.ad?.id;
      if (ad_id) {
        adStore.updateAdId(ad_id);
      }
      adAnalytics.pushEvent("redirect_to_payment", [], {
        payment_method: "webpay",
      });
      handleRedirect(response.data.webpay);
    } else {
      await fetchUser();
      await navigateTo("/anunciar/gracias?ad=" + response.data?.ad?.id);
    }
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
