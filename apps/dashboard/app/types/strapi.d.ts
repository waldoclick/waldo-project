declare module "@nuxtjs/strapi" {
  interface StrapiForgotPasswordData {
    recaptchaToken?: string;
    context?: "website" | "dashboard";
  }

  interface StrapiResetPasswordData {
    recaptchaToken?: string;
  }
}

export {};
