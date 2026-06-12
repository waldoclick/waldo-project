export const useProviders = () => {
  const { getProviderAuthenticationUrl } = useStrapiAuth();

  const redirectToProvider = (provider: string): void => {
    window.location.href = getProviderAuthenticationUrl(provider);
  };

  const loginWithPopup = async (provider: string): Promise<{ jwt: string }> => {
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
        ticker: undefined as ReturnType<typeof setInterval> | undefined,
      };

      const finish = (fn: () => void) => {
        if (ctx.done) return;
        ctx.done = true;
        clearInterval(ctx.ticker);
        window.removeEventListener("message", handler);
        fn();
      };

      const handler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === "google-oauth-success") {
          finish(() => resolve({ jwt: (event.data as { jwt: string }).jwt }));
        } else if (event.data?.type === "google-oauth-error") {
          finish(() => reject(new Error("oauth_failed")));
        }
      };

      window.addEventListener("message", handler);
      ctx.ticker = setInterval(() => {
        if (popup.closed) finish(() => reject(new Error("popup_closed")));
      }, 500);
    });
  };

  return { loginWithPopup, redirectToProvider };
};
