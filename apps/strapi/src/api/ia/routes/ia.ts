export default {
  routes: [
    {
      method: "POST",
      path: "/ia/gemini",
      handler: "ia.gemini",
      config: {
        policies: [],
      },
    },
  ],
};
