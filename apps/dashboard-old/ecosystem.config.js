module.exports = {
  apps: [
    {
      name: 'waldo-dashboard',
      script: 'yarn',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
