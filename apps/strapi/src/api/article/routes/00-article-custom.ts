/**
 * Custom article routes — loaded BEFORE article.ts (core router) so that the static
 * /articles/sources and /articles/generate paths register before the GET /articles/:id wildcard.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/articles/sources",
      handler: "article.sources",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "POST",
      path: "/articles/generate",
      handler: "article.generate",
      config: { policies: ["global::isManager"] },
    },
  ],
};
