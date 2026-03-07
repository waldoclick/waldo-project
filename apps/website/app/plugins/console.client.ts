export default defineNuxtPlugin(() => {
  if (!import.meta.dev) {
    console.log = () => {};
    console.debug = () => {};
    // console.warn, console.error, console.info intentionally NOT suppressed
  }
});
