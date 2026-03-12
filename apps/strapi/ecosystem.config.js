module.exports = {
  apps: [
    {
      name: "waldo-api",
      script: "yarn",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true, // PM2 will restart if it crashes
      watch: false, // Set to true for development with autoreload
      max_memory_restart: "1G",
    },
  ],
};
