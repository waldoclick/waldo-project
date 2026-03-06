export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    // console.log("🔧 Console plugin initialized in development mode");
  } else {
    // console.log = () => {};
    console.debug = () => {};
    console.warn = () => {};
    console.info = () => {};
  }
});
