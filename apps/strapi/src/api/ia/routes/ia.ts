export default {
  routes: [
    {
      method: "POST",
      path: "/ia/gemini",
      handler: "ia.gemini",
      config: {
        policies: ["global::isManager"],
      },
    },
    {
      method: "POST",
      path: "/ia/groq",
      handler: "ia.groq",
      config: {
        policies: ["global::isManager"],
      },
    },
    {
      method: "POST",
      path: "/ia/deepseek",
      handler: "ia.deepseek",
      config: {
        policies: ["global::isManager"],
      },
    },
    {
      method: "POST",
      path: "/ia/claude",
      handler: "ia.claude",
      config: {
        policies: ["global::isManager"],
      },
    },
  ],
};
