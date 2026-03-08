<template>
  <div class="payment payment--gateway">
    <div class="payment--gateway__options">
      <label
        class="payment--gateway__options__item payment--gateway__options__item--active"
      >
        <input type="checkbox" name="gateway" value="webpay" checked disabled />
        <span>Transbank WebPay</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed — decorative only, single gateway (WebPay)
</script>
