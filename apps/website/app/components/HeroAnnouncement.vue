<template>
  <section ref="heroElement" class="hero hero--announcement">
    <div class="hero--announcement__container">
      <div class="hero--announcement__content">
        <div class="hero--announcement__breadcrumbs">
          <BreadcrumbsDefault
            :items="[
              { label: 'Anuncios', to: '/anuncios' },
              {
                label: getCategory.name,
                to: `/anuncios?category=${getCategory.slug}`,
              },
              { label: getTitle },
            ]"
          />
        </div>
        <div class="hero--announcement__title">
          <h1 class="title">
            {{ getTitle }}
          </h1>
        </div>
        <div v-if="getUser" class="hero--announcement__tags">
          <template v-if="isLoggedIn">
            <span>
              Por
              <!-- <pre>{{ getUser }}</pre> -->
              <nuxt-link
                :to="`/${getUser?.username}`"
                :title="getUser?.firstname"
              >
                {{ getUser?.firstname }}
              </nuxt-link>
            </span>
            <span>
              <!-- prettier-ignore -->
              <nuxt-link
                to="/anunciar"
                title="Publicar aviso similar a este"
              >Publicar aviso similar a este</nuxt-link>
            </span>
          </template>
          <template v-else>
            <ReminderDefault />
          </template>
        </div>
      </div>
      <div v-if="props.user" class="hero--announcement__qr">
        <QrDefault
          size="120"
          :business-card="{
            firstname: props.user.firstname,
            lastname: props.user.lastname,
            phone: props.user.phone,
            email: props.user.email,
            is_company: props.user.is_company,
            business_name: props.user.business_name,
          }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";
import QrDefault from "@/components/QrDefault.vue";
import ReminderDefault from "@/components/ReminderDefault.vue";
import { useColor } from "../composables/useColor";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
});

const { hexToRgba, bgColorWithTransparency } = useColor();

const authUser = useStrapiUser();
const isLoggedIn = computed(() => !!authUser.value);

const getUser = computed(() => {
  return props.user;
});

const getTitle = computed(() => {
  return props.name;
});

const getCategory = computed(() => {
  return props.category;
});

// Referencia al elemento hero
const heroElement = ref(null);

// Función para actualizar el color de fondo
const updateBackgroundColor = () => {
  if (heroElement.value) {
    const color = bgColorWithTransparency(
      getCategory.value?.color || "#f0f0f0",
    );
    heroElement.value.style.setProperty("background-color", color);
  }
};

// Watch para actualizar cuando cambie la categoría
watch(() => getCategory.value?.color, updateBackgroundColor, {
  immediate: true,
});

// También actualizar en onMounted
onMounted(updateBackgroundColor);
</script>
