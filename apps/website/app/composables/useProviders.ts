const OAUTH_TIMEOUT_MS = 180_000;
const ALLOWED_PROVIDERS: ReadonlySet<string> = new Set(["google", "facebook"]);

export const useProviders = () => {
  const { getProviderAuthenticationUrl } = useSessionAuth();

  const redirectToProvider = (provider: string): void => {
    if (!ALLOWED_PROVIDERS.has(provider)) return;
    window.location.href = getProviderAuthenticationUrl(provider);
  };

  const loginWithPopup = async (provider: string): Promise<void> => {
    const data = await $fetch<{ url: string }>(
      `/api/auth/${provider}/initiate`,
    );

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      data.url,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    if (!popup) throw new Error("popup_blocked");

    return new Promise((resolve, reject) => {
      const ctx = {
        done: false,
        timer: undefined as ReturnType<typeof setTimeout> | undefined,
      };
      // BroadcastChannel is same-origin only and survives the COOP
      // same-origin severing of window.opener in production
      const channel = new BroadcastChannel("google-oauth");

      const finish = (fn: () => void) => {
        if (ctx.done) return;
        ctx.done = true;
        clearTimeout(ctx.timer);
        channel.close();
        window.removeEventListener("message", handler);
        fn();
      };

      const onPayload = (payload: unknown) => {
        const msg = payload as { type?: string };
        if (msg?.type === "google-oauth-success") {
          finish(() => resolve());
        } else if (msg?.type === "google-oauth-error") {
          finish(() => reject(new Error("oauth_failed")));
        }
      };

      channel.addEventListener("message", (event) => onPayload(event.data));

      // Fallback for environments without COOP, where window.opener survives
      const handler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        onPayload(event.data);
      };
      window.addEventListener("message", handler);

      // COOP makes popup.closed report true as soon as Google loads, so
      // close-detection is impossible — bound the wait with a timeout instead
      ctx.timer = setTimeout(
        () => finish(() => reject(new Error("popup_closed"))),
        OAUTH_TIMEOUT_MS,
      );
    });
  };

  return { loginWithPopup, redirectToProvider };
};
