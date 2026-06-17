<template>
  <div class="introduce introduce--auth">
    <div class="introduce--auth__card">
      <div
        class="introduce--auth__card__glow introduce--auth__card__glow--top"
      />
      <div
        class="introduce--auth__card__glow introduce--auth__card__glow--bottom"
      />

      <div class="introduce--auth__header">
        <div class="introduce--auth__logo"><LogoBlack /></div>
        <span class="introduce--auth__header__chip">
          <span class="introduce--auth__header__chip__dot" />Marketplace
          industrial
        </span>
      </div>

      <div class="introduce--auth__content">
        <h2 class="introduce--auth__title" v-html="getTitle" />
        <div class="introduce--auth__details">
          <h3
            v-if="sanitizedSubtitle"
            class="introduce--auth__details__title"
            v-html="sanitizedSubtitle"
          />
          <ul v-if="getList.length > 0" class="introduce--auth__details__list">
            <li v-for="(item, index) in getList" :key="index">
              <span class="introduce--auth__details__list__check"
                ><IconCheck :size="12" :stroke-width="3"
              /></span>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="introduce--auth__footer">
        <IconShield :size="15" :stroke-width="2" />
        Conexión protegida · datos cifrados de extremo a extremo
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LogoBlack from "@/components/LogoBlack.vue";
import { Check as IconCheck, Shield as IconShield } from "lucide-vue-next";
import { useSanitize } from "@/composables/useSanitize";

const props = defineProps<{
  title: string;
  subtitle?: string;
  list?: string[];
}>();

// Composable para sanitización
const { sanitizeText } = useSanitize();

// Define the functions directly
const stringSanitizeTitle = (title: string): string => {
  return sanitizeText(title.trim());
};

const getTitle = computed(() => stringSanitizeTitle(props.title));
const sanitizedSubtitle = computed(() =>
  props.subtitle ? stringSanitizeTitle(props.subtitle) : "",
);
const getList = computed(() => props.list || []);
</script>
