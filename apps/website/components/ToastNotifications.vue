<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="toast-container">
        <transition-group name="toast">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['toast', `toast--${notification.type}`]"
            @click="remove(notification.id)"
          >
            {{ notification.message }}
          </div>
        </transition-group>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useNotificationState } from "../composables/useNotifications";

// Usar el estado global exportado directamente
const { notifications, remove } = useNotificationState();
</script>
