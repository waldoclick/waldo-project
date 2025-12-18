<template>
  <div class="introduce introduce--auth">
    <div class="introduce--auth__content">
      <div class="introduce--auth__logo">
        <LogoWhite />
      </div>
      <h2 class="introduce--auth__title" v-html="getTitle" />
      <div class="introduce--auth__details">
        <h2
          v-if="subtitle"
          class="introduce--auth__details__title"
          v-html="subtitle"
        />
        <!-- <pre>{{ list }}</pre> -->
        <ul v-if="getList.length > 0" class="introduce--auth__details__list">
          <li v-for="(item, index) in getList" :key="index">
            <NuxtImg :src="IconCheck" alt="" />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
    <div class="introduce--auth__bg">
      <PictureDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
// components
import LogoWhite from "@/components/LogoWhite.vue";
import PictureDefault from "@/components/PictureDefault.vue";
import { useSanitize } from "@/composables/useSanitize";

import IconCheck from "/images/icon-check-circle.svg";

const props = defineProps<{
  title: string;
  subtitle?: string;
  list?: Array<any>;
}>();

// Composable para sanitización
const { sanitizeText } = useSanitize();

// Define the functions directly
const stringSanitizeTitle = (title: string): string => {
  return sanitizeText(title.trim());
};

const getTitle = computed(() => stringSanitizeTitle(props.title));
const getList = computed(() => props.list || []);
</script>
