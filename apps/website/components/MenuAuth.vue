<template>
  <ul class="menu menu--auth">
    <li>
      <LinkLogin :link-class="computedLinkClass" />
    </li>
    <li>
      <NuxtLink to="/registro" class="btn btn--register" title="Registrate">
        <span>Registrate</span>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink
        to="/anunciar"
        class="btn btn--announcement"
        title="Anunciar ahora"
      >
        <span>Anunciar ahora</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LinkLogin from "@/components/LinkLogin.vue";

const props = defineProps({
  white: {
    type: [Boolean, String],
    default: true,
  },
});

const computedLinkClass = computed(() => {
  return ["btn btn--default btn--login", { "is-black": !props.white }]
    .map((cls) =>
      typeof cls === "string"
        ? cls
        : Object.keys(cls)
            .filter((key) => cls[key])
            .join(" ")
    )
    .join(" ");
});
</script>
