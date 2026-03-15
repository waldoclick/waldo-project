// Stub for Nuxt's #imports virtual module in test environment.
// Real implementations are provided via vi.mock("#imports") in test files.
export const navigateTo = () => {};
export const useStrapiAuth = () => ({ logout: () => {} });
export const useStrapiClient = () => () => Promise.resolve({});
export const useNuxtApp = () => ({});
