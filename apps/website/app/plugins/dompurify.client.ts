import DOMPurify from "dompurify";

export default defineNuxtPlugin(() => {
  // Hacer DOMPurify disponible globalmente en el cliente
  if (import.meta.client) {
    window.DOMPurify = DOMPurify;
  }
});
