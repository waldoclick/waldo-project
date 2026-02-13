declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const siteKey = config.public.recaptchaSiteKey;

  // Function to dynamically load the reCAPTCHA script
  function loadRecaptchaScript() {
    return new Promise((resolve, reject) => {
      // Check if the script is already present
      if (document.getElementById("recaptcha-script")) {
        return resolve(window.grecaptcha);
      }

      // Create the script tag for reCAPTCHA
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;

      script.addEventListener("load", () => {
        if (window.grecaptcha) {
          resolve(window.grecaptcha);
        } else {
          reject(new Error("reCAPTCHA failed to load."));
        }
      });

      script.addEventListener("error", () => {
        reject(new Error("Failed to load reCAPTCHA script"));
      });

      document.head.appendChild(script);
    });
  }

  // Initialize the reCAPTCHA
  loadRecaptchaScript()
    .then((grecaptcha: Window["grecaptcha"]) => {
      // Provide a function to use reCAPTCHA
      nuxtApp.provide("recaptcha", {
        execute: async (action: string) => {
          return new Promise((resolve, reject) => {
            grecaptcha.ready(async () => {
              try {
                const token = await grecaptcha.execute(siteKey, { action });
                resolve(token);
              } catch (error) {
                reject(error);
              }
            });
          });
        },
      });
    })
    .catch((error) => {
      console.error("Error loading reCAPTCHA:", error);
    });
});
