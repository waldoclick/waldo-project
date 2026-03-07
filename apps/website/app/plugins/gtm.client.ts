// Google Tag Manager plugin for Nuxt 4 with Consent Mode v2
export default defineNuxtPlugin({
  name: "gtm",
  parallel: true, // Run in parallel with other plugins
  setup() {
    const config = useRuntimeConfig();
    const appConfig = useAppConfiguration();

    // Only run on client side and if GTM is enabled
    if (import.meta.client && appConfig.features.gtm) {
      const gtmId = config.public.gtmId || "GTM-N4B8LDKS";

      // Initialize dataLayer first
      window.dataLayer = window.dataLayer || [];

      // Check if user has already accepted cookies in a previous session
      const cookieAccepted = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("site-cookies-accepted="));

      // Consent Mode v2: push default state BEFORE GTM script loads.
      // Format: array-command ["consent", "default"|"update", {...}]
      // If user already accepted cookies, grant immediately to avoid blocking GA4.
      window.dataLayer.push([
        "consent",
        "default",
        {
          analytics_storage: cookieAccepted ? "granted" : "denied",
          ad_storage: cookieAccepted ? "granted" : "denied",
          wait_for_update: 500,
        },
      ]);

      // Load GTM script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      script.addEventListener("error", () =>
        console.warn("Failed to load GTM script"),
      );
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement("noscript");
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = "0";
      iframe.width = "0";
      iframe.style.display = "none";
      iframe.style.visibility = "hidden";
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);

      // Track page views for SPA navigation
      const router = useRouter();
      router.afterEach((to) => {
        window.dataLayer.push({
          event: "page_view",
          page_path: to.fullPath,
          page_title: (to.meta.title as string | undefined) || document.title,
        });
      });
    }
  },
});
