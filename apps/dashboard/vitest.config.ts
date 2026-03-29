import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    vue(),
    // Replace Nuxt SSR guards with client-side values so stores initialize in tests
    {
      name: "nuxt-meta-client-stub",
      transform(code) {
        return code
          .replace(/import\.meta\.client/g, "true")
          .replace(/import\.meta\.server/g, "false");
      },
    },
  ],
  test: {
    environment: "happy-dom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app", import.meta.url)),
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "#app": fileURLToPath(
        new URL("./tests/stubs/app.stub.ts", import.meta.url),
      ),
      "#imports": fileURLToPath(
        new URL("./tests/stubs/imports.stub.ts", import.meta.url),
      ),
    },
  },
});
