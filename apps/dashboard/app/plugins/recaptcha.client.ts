declare global {
  interface Window {
    grecaptcha: {
      ready: (_callback: () => void) => void;
      execute: (
        _siteKey: string,
        _options: { action: string },
      ) => Promise<string>;
    };
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const siteKey = config.public.recaptchaSiteKey;

  // Promise that resolves once grecaptcha is ready, or rejects on load failure.
  const ready = new Promise<Window["grecaptcha"]>((resolve, reject) => {
    if (document.getElementById("recaptcha-script")) {
      window.grecaptcha?.ready(() => resolve(window.grecaptcha));
      return;
    }

    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve(window.grecaptcha));
      } else {
        reject(new Error("reCAPTCHA failed to load."));
      }
    });
    script.addEventListener("error", () =>
      reject(new Error("Failed to load reCAPTCHA script")),
    );
    document.head.appendChild(script);
  });

  // Provide $recaptcha immediately — execute() waits for the script internally.
  nuxtApp.provide("recaptcha", {
    execute: async (action: string): Promise<string> => {
      const grecaptcha = await ready;
      return grecaptcha.execute(siteKey, { action });
    },
  });
});
