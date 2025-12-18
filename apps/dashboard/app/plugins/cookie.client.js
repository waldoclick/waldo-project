import Cookies from "js-cookie";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("cookies", Cookies);
});
