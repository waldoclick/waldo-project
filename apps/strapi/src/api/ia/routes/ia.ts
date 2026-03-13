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
    {
      method: "POST",
      path: "/ia/groq",
      handler: "ia.groq",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/ia/deepseek",
      handler: "ia.deepseek",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/ia/claude",
      handler: "ia.claude",
      config: {
        policies: [],
      },
    },
  ],
};
