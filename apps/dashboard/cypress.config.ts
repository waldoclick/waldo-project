import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: process.env.BASE_URL,
    // specPattern: "**/*.spec.ts",
  },

  component: {
    // specPattern: "**/*.spec.ts",
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
