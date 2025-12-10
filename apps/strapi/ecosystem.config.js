module.exports = {
  apps: [
    {
      name: "waldo-api",
      script: "yarn",
      args: "start",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
