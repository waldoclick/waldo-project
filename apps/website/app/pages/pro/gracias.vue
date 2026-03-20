<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <MessageDefault
      type="success"
      title="Tu suscripcion PRO esta activa"
      description="Tu tarjeta ha sido registrada exitosamente. Ya puedes disfrutar de todos los beneficios PRO."
    />
    <section class="pro-gracias">
      <div class="pro-gracias__container">
        <div class="pro-gracias__card">
          <p class="pro-gracias__card__label">Tarjeta registrada</p>
          <p class="pro-gracias__card__type">{{ user?.pro_card_type }}</p>
          <p class="pro-gracias__card__number">
            **** **** **** {{ user?.pro_card_last4 }}
          </p>
        </div>
        <NuxtLink to="/" class="btn btn--buy pro-gracias__cta">
          Volver al inicio
        </NuxtLink>
      </div>
    </section>
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import type { User } from "@/types/user";

const { $setSEO } = useNuxtApp();
const config = useRuntimeConfig();

$setSEO({
  title: "Suscripcion PRO Confirmada",
  description:
    "Tu suscripcion PRO ha sido activada exitosamente en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pro/gracias`,
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const inscribed = route.query.inscribed;

if (inscribed !== "true") {
  await navigateTo("/");
}

const { fetchUser } = useStrapiAuth();
await fetchUser();

const user = useStrapiUser<User>();
</script>

<style scoped lang="scss">
.pro-gracias {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 480px;
    width: 100%;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 2rem;
    border: 1px solid $gainsboro;
    border-radius: 8px;
    background-color: $cultured;
    width: 100%;

    &__label {
      font-size: 0.875rem;
      color: $davys_grey;
    }

    &__type {
      font-size: 1.125rem;
      font-weight: 600;
      color: $charcoal;
    }

    &__number {
      font-size: 1rem;
      color: $charcoal;
      letter-spacing: 0.1em;
    }
  }

  &__cta {
    background-color: $light_peach;
    color: $charcoal;
  }
}
</style>
