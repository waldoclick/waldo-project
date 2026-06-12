export default {
  routes: [
    {
      method: "GET",
      path: "/auth/google/initiate",
      handler: "auth-google.initiate",
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: "GET",
      path: "/auth/google-oauth/callback",
      handler: "auth-google.callback",
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
