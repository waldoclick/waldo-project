module.exports = {
  apps: [
    {
      name: "waldo-website",
      script: "./.output/server/index.mjs",
      env: {
        NODE_ENV: "production",
        NITRO_PORT: 3000,
      },
    },
  ],
};
