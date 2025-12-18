// plugins/seo.ts
import { defineNuxtPlugin } from "#app";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DEFAULT_IMAGE = `${BASE_URL}/images/share.jpg`;

export default defineNuxtPlugin((nuxtApp) => {
  // Define a global function for setting SEO meta tags
  nuxtApp.provide(
    "setSEO",
    (params: { title: string; description: string; imageUrl?: string }) => {
      useSeoMeta({
        title: params.title,
        description: params.description,
        ogImage: params.imageUrl || DEFAULT_IMAGE,
      });
    },
  );
});

// Add type declaration for better TypeScript support
declare module "#app" {
  interface NuxtApp {
    $setSEO: (params: {
      title: string;
      description: string;
      imageUrl?: string;
    }) => void;
  }
}
