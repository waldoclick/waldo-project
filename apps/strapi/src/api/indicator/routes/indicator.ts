export default {
  routes: [
    {
      method: "GET",
      path: "/indicators",
      handler: "indicator.find",
      config: {
        policies: [],
        auth: false,
        description: "Get all economic indicators",
        tag: {
          plugin: "documentation",
          name: "Indicator",
          description: "Economic indicators operations",
        },
      },
    },
    {
      method: "GET",
      path: "/indicators/convert",
      handler: "indicator.convert",
      config: {
        policies: [],
        auth: false,
        query: {
          amount: {
            type: "number",
            required: true,
          },
          from: {
            type: "string",
            enum: ["CLP", "USD", "EUR"],
            default: "CLP",
          },
          to: {
            type: "string",
            enum: ["CLP", "USD", "EUR"],
            default: "USD",
          },
        },
        description: "Convert between currencies",
        tag: {
          plugin: "documentation",
          name: "Indicator",
          description: "Economic indicators operations",
        },
      },
    },
    {
      method: "GET",
      path: "/indicators/:id",
      handler: "indicator.findOne",
      config: {
        policies: [],
        auth: false,
        params: {
          id: {
            type: "string",
            required: true,
          },
        },
        description: "Get specific indicator",
        tag: {
          plugin: "documentation",
          name: "Indicator",
          description: "Economic indicators operations",
        },
      },
    },
  ],
};
