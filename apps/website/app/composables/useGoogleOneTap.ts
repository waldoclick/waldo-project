import { useStrapiUser, useRoute } from "#imports";

export const useGoogleOneTap = () => {
  const promptIfEligible = () => {
    // Auth guard: skip if user is already authenticated
    const user = useStrapiUser();
    if (user.value) return;

    // Route guard: skip on private routes
    const route = useRoute();
    const PRIVATE_PREFIXES = ["/cuenta", "/pagar", "/anunciar", "/packs"];
    if (PRIVATE_PREFIXES.some((p) => route.path.startsWith(p))) return;

    // GIS guard: skip if library not loaded yet
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.prompt((notification) => {
      if (notification.isSkippedMoment()) {
        console.log("[OneTap] Skipped:", notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        console.log("[OneTap] Dismissed:", notification.getDismissedReason());
      }
    });
  };

  return { promptIfEligible };
};
