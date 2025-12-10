export default {
  documentation: {
    info: {
      version: "1.0.0",
      title: "Economic Indicators API",
      description:
        "API for retrieving and converting economic indicators from Chile",
      contact: {
        name: "API Support",
        email: "support@waldo.cl",
      },
    },
    paths: {
      "/indicators": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            code: { type: "string", example: "dolar" },
                            name: {
                              type: "string",
                              example: "Dólar observado",
                            },
                            unit: { type: "string", example: "Pesos" },
                            value: { type: "number", example: 931.75 },
                          },
                        },
                      },
                      meta: {
                        type: "object",
                        properties: {
                          timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2024-03-30T12:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/indicators/{id}": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          code: { type: "string", example: "dolar" },
                          name: { type: "string", example: "Dólar observado" },
                          unit: { type: "string", example: "Pesos" },
                          value: { type: "number", example: 931.75 },
                        },
                      },
                      meta: {
                        type: "object",
                        properties: {
                          timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2024-03-30T12:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/indicators/convert": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          amount: { type: "number", example: 100000 },
                          from: { type: "string", example: "CLP" },
                          to: { type: "string", example: "USD" },
                          result: { type: "number", example: 107.32 },
                        },
                      },
                      meta: {
                        type: "object",
                        properties: {
                          timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2024-03-30T12:00:00.000Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
