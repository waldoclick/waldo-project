// Stub for Nuxt's #imports virtual module in test environment.
// Real implementations are provided via vi.mock("#imports") in test files.
export const navigateTo = () => {};
export const useStrapiAuth = () => ({ logout: () => {} });
export const useStrapiClient = () => () => Promise.resolve({});
export const useNuxtApp = () => ({});
export const useStrapiUser = () => ({ value: null });
export const useRoute = () => ({ path: "/" });
export const defineNuxtPlugin = (fn: unknown) => fn;
export const useRuntimeConfig = () => ({ public: {} });
export const useRequestHeaders = (_keys?: string[]) =>
  ({}) as Record<string, string | undefined>;
// Session composables (Phase 129) — additive; useStrapiX kept until plan 06 cutover
export const useSessionUser = () => ({ value: null });
export const useSessionAuth = () => ({
  fetchUser: () => Promise.resolve(null),
  logout: () => Promise.resolve(),
  getProviderAuthenticationUrl: (_provider: string) => "",
});
export const useSessionClient = () => () => Promise.resolve({});
