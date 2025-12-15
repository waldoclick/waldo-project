// Google Tag Manager plugin for Nuxt 4 with optimizations
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

      // GTM function with better error handling
      function gtag(...args: any[]) {
        try {
          window.dataLayer.push(args);
        } catch (error) {
          console.warn("GTM error:", error);
        }
      }

      // Configure GTM
      gtag("js", new Date());
      gtag("config", gtmId, {
        // Optimize for Nuxt 4
        send_page_view: false, // We'll handle this manually
        custom_map: {
          custom_parameter: "custom_value",
        },
      });

      // Load GTM script with better error handling
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      script.addEventListener("error", () =>
        console.warn("Failed to load GTM script")
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
        gtag("config", gtmId, {
          page_path: to.fullPath,
          page_title: to.meta.title || document.title,
        });
      });
    }
  },
});
