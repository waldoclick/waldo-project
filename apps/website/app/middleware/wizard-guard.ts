import { useAdStore } from "@/stores/ad.store";

/**
 * Wizard step guard — redirects to the first incomplete step.
 * Each step page declares this middleware via definePageMeta.
 *
 * Completion criteria per step:
 *   Step 1: adStore.step >= 2 (pack always has a default; advancing is the signal)
 *   Step 2: ad.name, ad.category > 0, ad.price > 0, ad.description
 *   Step 3: ad.email, ad.phone
 *   Step 4: ad.condition
 *   Step 5: ad.gallery.length > 0
 */
export default defineNuxtRouteMiddleware((to) => {
  const adStore = useAdStore();
  const ad = adStore.ad;

  const step1Complete = adStore.step >= 2;
  const step2Complete = !!(
    ad.name &&
    ad.category > 0 &&
    ad.price > 0 &&
    ad.description
  );
  const step3Complete = !!(ad.email && ad.phone);
  const step4Complete = !!ad.condition;
  const step5Complete = ad.gallery.length > 0;

  const firstIncomplete = (() => {
    if (!step1Complete) return "/anunciar";
    if (!step2Complete) return "/anunciar/datos-del-producto";
    if (!step3Complete) return "/anunciar/datos-personales";
    if (!step4Complete) return "/anunciar/ficha-de-producto";
    if (!step5Complete) return "/anunciar/galeria-de-imagenes";
    return null;
  })();

  // If the user is already at the first incomplete step, allow access
  if (!firstIncomplete || to.path === firstIncomplete) return;

  // Map each route to its required step number — only redirect if trying to skip ahead
  const stepByRoute: Record<string, number> = {
    "/anunciar": 1,
    "/anunciar/datos-del-producto": 2,
    "/anunciar/datos-personales": 3,
    "/anunciar/ficha-de-producto": 4,
    "/anunciar/galeria-de-imagenes": 5,
  };

  const targetStep = stepByRoute[to.path] ?? 0;
  const firstIncompleteStep = stepByRoute[firstIncomplete] ?? 1;

  // Only block if trying to skip ahead — allow going back freely
  if (targetStep > firstIncompleteStep) {
    return navigateTo(firstIncomplete);
  }
});
