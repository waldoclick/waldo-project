// Stub for Nuxt's #app virtual module in test environment.
// Real implementations are provided via vi.mock("#app") or global overrides in test files.
export const useNuxtApp = () => ({});
export const useRuntimeConfig = () => ({ public: {} });
export const useState = (_key: string, init?: () => unknown) => ({
  value: init ? init() : undefined,
});
export const navigateTo = () => {};
export const defineNuxtPlugin = (fn: unknown) => fn;
export const definePayloadPlugin = (fn: unknown) => fn;
export const defineAppConfig = (config: unknown) => config;
export const defineNuxtComponent = (component: unknown) => component;
export const useAsyncData = () => ({
  data: { value: null },
  pending: { value: false },
  error: { value: null },
  refresh: () => {},
});
export const useFetch = () => ({
  data: { value: null },
  pending: { value: false },
  error: { value: null },
  refresh: () => {},
});
export const useCookie = (_key: string) => ({ value: null });
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  go: () => {},
});
export const useRoute = () => ({ params: {}, query: {}, path: "/" });
export const abortNavigation = () => {};
export const addRouteMiddleware = () => {};
export const defineNuxtRouteMiddleware = (fn: unknown) => fn;
export const setPageLayout = () => {};
export const clearError = () => {};
export const createError = (err: unknown) => err;
export const isNuxtError = () => false;
export const showError = () => {};
export const useError = () => ({ value: null });
export const preloadComponents = () => {};
export const prefetchComponents = () => {};
export const preloadRouteComponents = () => {};
export const onNuxtReady = (fn: () => void) => fn();
export const callOnce = async (fn: () => Promise<void>) => fn();
