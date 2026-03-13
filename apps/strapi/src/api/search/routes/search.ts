export default {
  routes: [
    {
      method: "POST",
      path: "/search/tavily",
      handler: "search.tavily",
      config: {
        policies: [],
      },
    },
  ],
};
