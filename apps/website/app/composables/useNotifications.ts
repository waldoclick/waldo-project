import { createGlobalState, useTimeoutFn } from "@vueuse/core";
import { ref } from "vue";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

// Estado global compartido para notificaciones
export const useNotificationState = createGlobalState(() => {
  const notifications = ref<Notification[]>([]);
  let counter = 0;

  function add(notification: Omit<Notification, "id">) {
    const id = counter++;
    notifications.value.push({ ...notification, id });

    useTimeoutFn(() => {
      remove(id);
    }, 3000);

    return id;
  }

  function remove(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  return { notifications, add, remove };
});

// Hook para usar en componentes
export function useToast() {
  const { add } = useNotificationState();

  return {
    success(message: string) {
      add({ type: "success", message });
    },
    error(message: string) {
      add({ type: "error", message });
    },
    info(message: string) {
      add({ type: "info", message });
    },
    warning(message: string) {
      add({ type: "warning", message });
    },
  };
}
