export default defineNuxtPlugin(() => {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!secret) return;

  const baseURL = process.env.BASE_URL || "";

  globalThis.$fetch = (globalThis.$fetch as typeof $fetch).create({
    onRequest({ options }) {
      const url = typeof options.baseURL === "string" ? options.baseURL : "";
      if (url && baseURL && url.startsWith(baseURL)) {
        const headers = new Headers(options.headers as HeadersInit | undefined);
        headers.set("x-vercel-protection-bypass", secret);
        options.headers = headers;
      }
    },
  });
});
