import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app", import.meta.url)),
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "#app": fileURLToPath(new URL("./.nuxt", import.meta.url)),
      "#imports": fileURLToPath(
        new URL("./tests/stubs/imports.stub.ts", import.meta.url),
      ),
    },
  },
});
