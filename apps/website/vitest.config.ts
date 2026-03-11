import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom", // Use happy-dom instead of nuxt environment for better Vitest 3 compatibility
    globals: true,
  },
});
