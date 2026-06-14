export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const frontendUrl = process.env.BASE_URL || "http://localhost:3000";
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }

  try {
    // Call Strapi custom endpoint in JSON mode (requires ?json=true Strapi support — plan 03).
    // Typed as Record to avoid typed field names in this file (plan constraint).
    const result = await $fetch<Record<string, string>>(
      `${apiUrl}/api/auth/google-oauth/callback?code=${encodeURIComponent(code)}&json=true`,
      { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
    );

    setCookie(event, "waldo_jwt", result.jwt ?? "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 604800,
    });

    setHeader(event, "Content-Type", "text/html");
    // NO token in payload — client receives success signal only, then calls fetchUser()
    return renderPopupHtml({ type: "google-oauth-success" }, frontendUrl);
  } catch {
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }
});

function renderPopupHtml(
  data: Record<string, unknown>,
  origin: string,
): string {
  const json = JSON.stringify(data);
  return `<!DOCTYPE html><html><head><script data-cfasync="false">
(function(){var d=${json};
try{var c=new BroadcastChannel('google-oauth');c.postMessage(d);c.close();}catch(e){}
if(window.opener){window.opener.postMessage(d,'${origin}');}
window.close();setTimeout(function(){window.location.href='${origin}';},200);
})();
</script></head><body></body></html>`;
}
