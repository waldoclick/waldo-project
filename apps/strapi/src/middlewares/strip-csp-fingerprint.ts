/**
 * strip-csp-fingerprint middleware
 *
 * Strapi core hardcodes https://market-assets.strapi.io into the CSP img-src
 * default (@strapi/utils CSP_DEFAULTS) and merges it back in by array index
 * even when the strapi::security config omits it, so it cannot be removed via
 * config alone. This runs after strapi::security and strips that domain from
 * the Content-Security-Policy header so API responses stop advertising the
 * backend as Strapi.
 */
export default () => {
  return async (ctx, next) => {
    await next();
    const csp = ctx.response.get("Content-Security-Policy");
    if (csp && csp.includes("https://market-assets.strapi.io")) {
      ctx.set(
        "Content-Security-Policy",
        csp.replace(/\s*https:\/\/market-assets\.strapi\.io/g, ""),
      );
    }
  };
};
