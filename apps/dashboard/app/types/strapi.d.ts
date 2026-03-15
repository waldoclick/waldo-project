declare module "@nuxtjs/strapi" {
  interface StrapiForgotPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
    context?: "website" | "dashboard";
  }

  interface StrapiResetPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
  }
}

export {};
