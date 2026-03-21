<template>
  <section class="account account--main" aria-labelledby="account-title">
    <div id="account-title" class="account--main__title">Mi cuenta</div>
    <div class="account--main__profile">
      <span> {{ user?.firstname }} {{ user?.lastname }} </span>
      <nuxt-link
        class="account--main__profile__edit"
        to="/cuenta/perfil"
        title="Ver perfil"
      >
        Ver perfil
      </nuxt-link>
    </div>

    <div v-if="appConfig.features.pro" class="account--main__become_pro">
      <MemoPro />
    </div>

    <div class="account--main__announcements">
      <div class="account--main__announcements__text">
        <div class="account--main__announcements__own">
          <span v-html="adReservationsText" />{{ " "
          }}<span
            v-if="featuredAdReservationsText"
            v-html="featuredAdReservationsText"
          />
        </div>
        <div v-if="packSavingsText" class="account--main__announcements__pack">
          <div
            class="account--main__announcements__pack__info"
            v-html="packSavingsText"
          />
        </div>
      </div>
      <nuxt-link to="/packs" class="btn btn--buy" title="Comprar">
        Comprar
      </nuxt-link>
    </div>

    <div class="account--main__shortcuts">
      <div id="shortcuts-title" class="account--main__shortcuts__title">
        Accesos frecuentes
      </div>
      <div
        class="account--main__shortcuts__links"
        aria-labelledby="shortcuts-title"
      >
        <CardShortcut
          to="/cuenta/mis-anuncios"
          :icon-component="IconMegaphone"
          title="Mis anuncios"
          description="Mira tus anuncios y el estados de tus publicaciones creadas."
          link-text="Ver anuncios"
        />
        <CardShortcut
          to="/cuenta/mis-ordenes"
          :icon-component="IconShoppingCart"
          title="Mis órdenes"
          description="Revisa el historial de tus compras y el estado de tus pedidos."
          link-text="Ver órdenes"
        />
        <CardShortcut
          to="/packs"
          :icon-component="IconPackage"
          title="Comprar Packs"
          description="Mira nuestros packs de anuncios y elige el que más necesites."
          link-text="Comprar packs"
        />
        <CardShortcut
          to="/cuenta/perfil"
          :icon-component="IconUserCog"
          title="Mi perfil"
          description="Revisa o actualiza los datos de tu cuenta, perfil y contacto."
          link-text="Revisar o editar mi perfil"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import {
  Megaphone as IconMegaphone,
  Package as IconPackage,
  UserCog as IconUserCog,
  ShoppingCart as IconShoppingCart,
} from "lucide-vue-next";
import type { User } from "@/types/user";
import CardShortcut from "@/components/CardShortcut.vue";
import { useSanitize } from "@/composables/useSanitize";

// Usar la función del composable
const { getAdReservationsText, getFeaturedAdReservationsText } = useUser();
const { getPackBannerText } = usePacks();
const user = useStrapiUser<User>();
const { sanitizeText } = useSanitize();
const { packs, loadPacks } = usePacksList();
const appConfig = useAppConfiguration();

onMounted(() => loadPacks());

const adReservationsText = computed(() =>
  sanitizeText(getAdReservationsText()),
);
const featuredAdReservationsText = computed(() =>
  sanitizeText(getFeaturedAdReservationsText()),
);
const packSavingsText = computed(() =>
  sanitizeText(
    getPackBannerText(packs.value as import("@/types/pack").Pack[]) ?? "",
  ),
);
</script>
