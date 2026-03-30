// Stub for Nuxt's #imports virtual module in test environment.
// Real implementations are provided via vi.mock("#imports") in test files.
export const navigateTo = () => {};
export const useNuxtApp = () => ({});
export const useRoute = () => ({ path: "/" });
export const defineNuxtPlugin = (fn: unknown) => fn;
export const useRuntimeConfig = () => ({ public: {} });
export const useState = <T>(key: string, init?: () => T) => ({
  value: init ? init() : null,
});
export const useCookie = <T>(_name: string, _opts?: unknown) => ({
  value: null as T | null,
});
