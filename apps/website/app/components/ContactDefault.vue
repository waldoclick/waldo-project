<template>
  <div class="contact contact--default">
    <div class="contact--default__form">
      <FormContact />
    </div>
    <div class="contact--default__address">
      <AddressDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import FormContact from "@/components/FormContact.vue";
import AddressDefault from "@/components/AddressDefault.vue";
</script>
