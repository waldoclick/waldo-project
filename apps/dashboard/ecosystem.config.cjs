module.exports = {
  apps: [
    {
      name: "waldo-dashboard",
      script: "./.output/server/index.mjs",
      env: {
        NODE_ENV: "production",
        NITRO_PORT: 3001,
      },
    },
  ],
};
