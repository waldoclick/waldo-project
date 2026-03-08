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
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import FormCheckout from "@/components/FormCheckout.vue";
import { useAdStore } from "@/stores/ad.store";
import { useMeStore } from "@/stores/me.store";

const adStore = useAdStore();
const router = useRouter();

const meStore = useMeStore();
const isProfileComplete = ref(false);

// onMounted: UI-only — verifies profile completeness; meStore pre-loaded by parent page
onMounted(async () => {
  isProfileComplete.value = await meStore.isProfileComplete();
});

function handleFormSubmitted(_values?: unknown) {
  adStore.updateStep(2);
  router.push("/anunciar/datos-del-producto");
}
</script>
