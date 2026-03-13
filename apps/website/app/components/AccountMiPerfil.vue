<template>
  <div class="account account--miperfil">
    <div class="account--miperfil__block">
      <AccountEdit />
    </div>
    <div class="account--miperfil__block account--miperfil__block--password">
      <AccountPassword />
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountEdit from "@/components/AccountEdit.vue";
import AccountPassword from "@/components/AccountPassword.vue";
</script>
